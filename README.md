# Personal Finance Tracker (Sheets-Backed) 💸

This is my mini weekend project: a Personal Finance Tracker. I already track my expenses using Google Sheets, but I wanted something faster and more convenient to use on my phone. So I decided to build this app to make it easier and accessible. It calculates budget limits per period, groups transactions, and gives a compact 7-day aggregate summary of my recent spendings directly on the dashboard.

I applied a **Stale-While-Revalidate (SWR)** caching pattern with `localStorage` too, so the app basically has a zero-second time-to-interactive. Also threw in a simple Passkey Vault Auth in the front.

## 🛠 Tech Stacks

- **Frontend Core:** React + Vite
- **Styling:** Vanilla CSS.
- **Backend / Database:** Google Apps Script + Google Sheets (Remote Database that is literally free).

## 🚀 Key Features

*   State updates immediately on the UI while syncing to Sheets in the background. No more annoying blocking full-screen loading spinners.
*   Opens offline/cache first, quietly fetches from GAS API behind the scenes.
*   Protected by a single passkey stored with an expiry token. Basic concept but works perfectly to prevent unauthorized access.
*   Tracks budget remaining per monthly cycle individually.
*   A heavily condensed tabular view grouping up transactions for straightforward auditing.
*   In short, for personal use: it's fast, free, neat, and secure. Does its job perfectly.

## 🏃‍♂️ How to Run

1. Clone or download this repo.
2. Run `npm install`.
3. You need to deploy your own Google Apps Script (GAS) using the `Code.gs` logic, grab the Web App URL, and paste it into `.env.local` inside `VITE_GAS_URL`.
4. Run `npm run dev`.

That's pretty much it! The code is super straightforward, literally all the heavy lifting UI is inside `App.jsx`, and `api.js` acts as a thin wrapper.

## 🧠 Software Engineering Principles Applied

While this is a personal project, it strictly adheres to professional software engineering best practices to keep the codebase maintainable, fast, and bug-free:

*   **YAGNI (You Ain't Gonna Need It):** The architecture avoids over-engineering. Instead of building complex server-side pagination and sync engines for a dataset that fits in <500KB of JSON, it uses a "Thick Client" approach. It fetches all data once and processes it locally, resulting in instantaneous, native-app-like performance without the complexity debt.
*   **DRY (Don't Repeat Yourself):** Data like the `CATEGORIES` array and utility functions (`parseLocalDate`, `formatCurrency`) are defined exactly once in `utils.js` and imported wherever needed. Adding a new category requires a one-line change that automatically propagates throughout the entire UI.
*   **Separation of Concerns (SoC):** The codebase is modularized cleanly. `api.js` handles all backend communication, `utils.js` manages pure logic/math, `index.css` controls visuals, and `App.jsx` acts purely as the state and UI orchestrator.
*   **Single Source of Truth (SSoT):** The application state maintains only one master record of the data (`entries`). All derived views—such as period-specific lists, category totals, the recent days summary, and search results—are calculated on-the-fly using `useMemo()`. This eliminates the risk of UI inconsistencies or desynchronized totals.
*   **KISS (Keep It Simple, Stupid):** The application completely avoids heavy, unnecessary libraries (no Redux, no React Router, no heavy UI component libraries). It relies solely on React's built-in hooks (`useState`, `useMemo`) to manage state and navigation, keeping the bundle incredibly lightweight.
*   **Single Responsibility Principle (SRP):** Functions and modules are designed to do exactly one thing. For example, in `api.js`, the `addEntryToSheet` function strictly handles the network request, leaving the UI state updates entirely to `App.jsx`. Utility functions like `parseLocalDate` purely calculate dates without causing side effects.

## 🔒 Security & Privacy Checklist Evaluation
# Personal Finance Tracker (Sheets-Backed) 💸

This is my mini weekend project: a Personal Finance Tracker. I already track my expenses using Google Sheets, but I wanted something faster and more convenient to use on my phone. So I decided to build this app to make it easier and accessible. It calculates budget limits per period, groups transactions, and gives a compact 7-day aggregate summary of my recent spendings directly on the dashboard.

I applied a **Stale-While-Revalidate (SWR)** caching pattern with `localStorage` too, so the app basically has a zero-second time-to-interactive. Also threw in a simple Passkey Vault Auth in the front.

## 🛠 Tech Stacks

- **Frontend Core:** React + Vite
- **Styling:** Vanilla CSS.
- **Backend / Database:** Google Apps Script + Google Sheets (Remote Database that is literally free).

## 🚀 Key Features

*   State updates immediately on the UI while syncing to Sheets in the background. No more annoying blocking full-screen loading spinners.
*   Opens offline/cache first, quietly fetches from GAS API behind the scenes.
*   Protected by a single passkey stored with an expiry token. Basic concept but works perfectly to prevent unauthorized access.
*   Tracks budget remaining per monthly cycle individually.
*   A heavily condensed tabular view grouping up transactions for straightforward auditing.
*   In short, for personal use: it's fast, free, neat, and secure. Does its job perfectly.

## 🏃‍♂️ How to Run

1. Clone or download this repo.
2. Run `npm install`.
3. You need to deploy your own Google Apps Script (GAS) using the `Code.gs` logic, grab the Web App URL, and paste it into `.env.local` inside `VITE_GAS_URL`.
4. Run `npm run dev`.

That's pretty much it! The code is super straightforward, literally all the heavy lifting UI is inside `App.jsx`, and `api.js` acts as a thin wrapper.

## 🧠 Software Engineering Principles Applied

While this is a personal project, it strictly adheres to professional software engineering best practices to keep the codebase maintainable, fast, and bug-free:

*   **YAGNI (You Ain't Gonna Need It):** The architecture avoids over-engineering. Instead of building complex server-side pagination and sync engines for a dataset that fits in <500KB of JSON, it uses a "Thick Client" approach. It fetches all data once and processes it locally, resulting in instantaneous, native-app-like performance without the complexity debt.
*   **DRY (Don't Repeat Yourself):** Data like the `CATEGORIES` array and utility functions (`parseLocalDate`, `formatCurrency`) are defined exactly once in `utils.js` and imported wherever needed. Adding a new category requires a one-line change that automatically propagates throughout the entire UI.
*   **Separation of Concerns (SoC):** The codebase is modularized cleanly. `api.js` handles all backend communication, `utils.js` manages pure logic/math, `index.css` controls visuals, and `App.jsx` acts purely as the state and UI orchestrator.
*   **Single Source of Truth (SSoT):** The application state maintains only one master record of the data (`entries`). All derived views—such as period-specific lists, category totals, the recent days summary, and search results—are calculated on-the-fly using `useMemo()`. This eliminates the risk of UI inconsistencies or desynchronized totals.
*   **KISS (Keep It Simple, Stupid):** The application completely avoids heavy, unnecessary libraries (no Redux, no React Router, no heavy UI component libraries). It relies solely on React's built-in hooks (`useState`, `useMemo`) to manage state and navigation, keeping the bundle incredibly lightweight.
*   **Single Responsibility Principle (SRP):** Functions and modules are designed to do exactly one thing. For example, in `api.js`, the `addEntryToSheet` function strictly handles the network request, leaving the UI state updates entirely to `App.jsx`. Utility functions like `parseLocalDate` purely calculate dates without causing side effects.

## 🔒 Security & Privacy Checklist Evaluation

- [x] **Privacy policy if you collect user data:** N/A. This is a personal, self-hosted project. No public user data is collected.
- [x] **Know where user data is stored:** Data is stored exclusively in the user's personal Google Sheets.
- [x] **Check security headers:** N/A. Since this is a client-side Vite application (SSG/SPA), security headers are typically managed by your hosting provider (e.g., Vercel, Netlify, Cloudflare Pages).
- [x] **Scan against OWASP basics:** Handled. As a static frontend with a Google Apps Script proxy, most standard server-side OWASP vulnerabilities do not apply. 
- [x] **Look for SQL injection / XSS / auth issues:** 
  - **SQLi / Formula Injection:** No SQL database, but to prevent spreadsheet formula injection, the Google Apps Script backend automatically sanitizes inputs by prepending `'` to strings starting with `=`, `+`, `-`, or `@`.
  - **XSS:** Handled natively by React's built-in text escaping.
  - **Auth:** Uses a basic Passkey system. While simple, it effectively restricts access to the Google Apps Script endpoint.
- [x] **Make sure .env values are not leaking:** **Impossible to hide `VITE_GAS_URL`**. Because we use Google Apps Script as our direct backend without an intermediate proxy, the browser must know the URL to send data to it. The URL is exposed, but the endpoint itself is protected by the passkey requirement.
- [x] **Check API responses for sensitive data:** The API only returns the user's own financial data after authenticating with the passkey.
- [x] **Remove secrets from logs:** Verified. No secrets or keys are logged in the frontend codebase.
- [x] **Never expose API keys in frontend code:** The access `key` is never hardcoded; it is user-provided and temporarily stored locally in `localStorage`.
- [x] **Move keys server-side or behind a proxy:** Handled. The `key` is securely sent to the Google Apps Script backend, which acts as a secure proxy to write to Google Sheets.
- [x] **Add rate limits before someone burns your API bill:** **Handled backend-side**. Added a rate limiter inside the Google Apps Script using `CacheService` to prevent abuse. Additionally, a client-side throttle prevents accidental UI spam. (And Google Apps Script is free anyway).
