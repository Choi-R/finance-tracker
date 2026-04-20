// Replace this with the URL you got from Google Apps Script after deploying
const GAS_URL = import.meta.env.VITE_GAS_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE';
import { format } from 'date-fns';
import { getValidKey, clearKey } from './auth';

/**
 * Helper to perform POST requests. We send payload as text/plain 
 * to avoid CORS preflight issues with Google Apps Script.
 */
async function postData(payload) {
  if (GAS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE') {
    console.error('GAS_URL is not set!');
    return false;
  }
  
  const key = getValidKey();
  if (!key) {
    clearKey();
    window.location.reload();
    return false;
  }
  
  // Attach key to payload
  payload.key = key;

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      // Use text/plain to avoid CORS preflight options request
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error posting to Apps Script:", error);
    return false;
  }
}

export async function fetchSheetData(overrideKey = null) {
  if (GAS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE') {
    return { entries: [], budgets: {} };
  }
  
  const key = overrideKey || getValidKey();
  if (!key) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await fetch(`${GAS_URL}?key=${encodeURIComponent(key)}`);
    const data = await response.json();
    
    if (data.error === "Unauthorized") {
      clearKey();
      throw new Error("Unauthorized");
    }

    // data should be { entries: [], budgets: {} }
    return {
      entries: (data.entries || []).map(e => {
        let normalizedDate = e.date;
        try {
          // If the date is already in YYYY-MM-DD format, keep it to avoid timezone shifting
          if (typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
            normalizedDate = e.date;
          } else {
            const d = new Date(e.date);
            if (!isNaN(d.getTime())) {
              normalizedDate = format(d, 'yyyy-MM-dd');
            }
          }
        } catch (err) {
          console.error("Error parsing date:", e.date);
        }
        
        return {
          ...e,
          date: normalizedDate,
          amount: Number(e.amount)
        };
      }),
      budgets: data.budgets || {}
    };
  } catch (error) {
    console.error("Error fetching data from Apps Script:", error);
    return { entries: [], budgets: {} };
  }
}

export async function addEntryToSheet(entry) {
  return postData({
    action: "ADD_ENTRY",
    entry
  });
}

export async function deleteEntryFromSheet(id) {
  return postData({
    action: "DELETE_ENTRY",
    id
  });
}

export async function updateBudgetInSheet(periodKey, category, amount) {
  return postData({
    action: "UPDATE_BUDGET",
    periodKey,
    category,
    amount
  });
}
