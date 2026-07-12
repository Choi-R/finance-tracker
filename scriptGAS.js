// --- CONFIGURATION ---
const PASSKEY = "rekcart ecnanif"; // Use this in your site's .env or config
const CACHE_KEY = "FINANCE_DATA_CACHE";
const CACHE_TTL = 600; 

// Rate Limit Configuration
const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per window

/**
 * Basic Rate Limiter using CacheService
 * We rate limit globally based on the Passkey, since this is a single-user personal app.
 */
function isRateLimited() {
  const cache = CacheService.getScriptCache();
  const rateLimitKey = "RATE_LIMIT_" + PASSKEY;
  let requests = cache.get(rateLimitKey);
  
  if (!requests) {
    cache.put(rateLimitKey, "1", RATE_LIMIT_WINDOW);
    return false;
  }
  
  requests = parseInt(requests, 10);
  if (requests >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  cache.put(rateLimitKey, (requests + 1).toString(), RATE_LIMIT_WINDOW);
  return false;
}

/**
 * Sanitizes input to prevent Spreadsheet Formula Injection
 * Prepends a single quote if the string starts with =, +, -, or @
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * GET Request: Fetches all Entries and Budgets.
 * Expects key in query param: ?key=YOUR_PASSKEY
 */
function doGet(e) {
  // 1. Authorization Check (Before anything else)
  if (e.parameter.key !== PASSKEY) {
    return createJsonResponse({ success: false, error: "Unauthorized" });
  }

  // 2. Rate Limit Check
  if (isRateLimited()) {
    return createJsonResponse({ success: false, error: "Rate limit exceeded. Try again later." });
  }

  const cache = CacheService.getScriptCache();
  const cachedData = cache.get(CACHE_KEY);

  if (cachedData) {
    return createJsonResponse(JSON.parse(cachedData));
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entriesData = ss.getSheetByName("Entries").getDataRange().getValues();
  const budgetsData = ss.getSheetByName("Budgets").getDataRange().getValues();

  const result = {
    entries: parseEntries(entriesData),
    budgets: parseBudgets(budgetsData)
  };

  cache.put(CACHE_KEY, JSON.stringify(result), CACHE_TTL);

  return createJsonResponse(result);
}

/**
 * POST Request: Handles Add, Delete, and Update Budget.
 * Expects "key" inside the JSON body.
 */
function doPost(e) {
  // 1. Rate Limit Check (do this before even parsing payload or locking)
  if (isRateLimited()) {
    return createJsonResponse({ success: false, error: "Rate limit exceeded. Try again later." });
  }

  const lock = LockService.getScriptLock();
  const successLock = lock.tryLock(1000); 

  if (!successLock) {
    return createJsonResponse({ success: false, error: "Concurrency Error: System busy." });
  }

  try {
    const data = JSON.parse(e.postData.contents);
    
    // 2. Authorization Check
    if (data.key !== PASSKEY) {
      return createJsonResponse({ success: false, error: "Unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let actionSuccessful = false;

    // --- ADD ENTRY ---
    if (data.action === "ADD_ENTRY") {
      const entry = data.entry;
      
      // Sanitize inputs before writing to sheet
      const sanitizedCategory = sanitizeInput(entry.category);
      const sanitizedNote = sanitizeInput(entry.note);
      
      ss.getSheetByName("Entries").appendRow([
        entry.id, 
        entry.date, 
        sanitizedCategory, 
        entry.amount, 
        sanitizedNote
      ]);
      actionSuccessful = true;
    }

    // --- DELETE ENTRY ---
    else if (data.action === "DELETE_ENTRY") {
      const idToDelete = data.id.toString();
      const sheet = ss.getSheetByName("Entries");
      const range = sheet.getRange("A:A")
                     .createTextFinder(idToDelete)
                     .matchEntireCell(true)
                     .findNext();
      
      if (range) {
        sheet.deleteRow(range.getRow());
        actionSuccessful = true;
      }
    }

    // --- EDIT ENTRY ---
    else if (data.action === "EDIT_ENTRY") {
      const entry = data.entry;
      const idToEdit = entry.id.toString();
      const sheet = ss.getSheetByName("Entries");
      const range = sheet.getRange("A:A")
                     .createTextFinder(idToEdit)
                     .matchEntireCell(true)
                     .findNext();
      
      if (range) {
        const row = range.getRow();
        const sanitizedCategory = sanitizeInput(entry.category);
        const sanitizedNote = sanitizeInput(entry.note);
        
        sheet.getRange(row, 2, 1, 4).setValues([[
          entry.date,
          sanitizedCategory,
          entry.amount,
          sanitizedNote
        ]]);
        actionSuccessful = true;
      }
    }

    // --- UPDATE BUDGET ---
    else if (data.action === "UPDATE_BUDGET") {
      const { periodKey, category, amount } = data;
      const budgetSheet = ss.getSheetByName("Budgets");
      const budgetValues = budgetSheet.getDataRange().getValues();
      let found = false;

      // Sanitize category just in case
      const sanitizedCategory = sanitizeInput(category);

      for (let i = 1; i < budgetValues.length; i++) {
        if (budgetValues[i][0].toString() === periodKey.toString() && budgetValues[i][1].toString() === sanitizedCategory.toString()) {
          budgetSheet.getRange(i + 1, 3).setValue(amount);
          found = true;
          break;
        }
      }

      if (!found) {
        budgetSheet.appendRow([periodKey, sanitizedCategory, amount]);
      }
      actionSuccessful = true;
    }

    // Invalidate cache if data was modified
    if (actionSuccessful) {
      CacheService.getScriptCache().remove(CACHE_KEY);
      return createJsonResponse({ success: true });
    } else {
      return createJsonResponse({ success: false, error: "Action failed or ID not found" });
    }

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- HELPERS ---

function parseEntries(values) {
  const entries = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue; 
    entries.push({
      id: row[0].toString(),
      date: row[1].toString(),
      category: row[2].toString(),
      amount: Number(row[3]),
      note: row[4].toString()
    });
  }
  return entries;
}

function parseBudgets(values) {
  const budgets = {};
  for (let j = 1; j < values.length; j++) {
    const row = values[j];
    if (!row[0]) continue;
    const period = row[0].toString();
    const cat = row[1].toString();
    const amt = Number(row[2]);
    if (!budgets[period]) budgets[period] = {};
    budgets[period][cat] = amt;
  }
  return budgets;
}

function createJsonResponse(output) {
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

