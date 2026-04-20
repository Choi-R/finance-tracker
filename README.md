# Personal Finance Tracker (Sheets-Backed) 💸

This is my mini weekend project: a Personal Finance Tracker. I already track my expenses using Google Sheets, but I wanted something faster and more convenient to use on my phone. So I decided to build this app to make it easier and accessible. It calculates budget limits per period, groups transactions, and gives a compact 15-day aggregate summary of my recent spendings directly on the dashboard.

I applied a **Stale-While-Revalidate (SWR)** caching pattern with `localStorage` too, so the app basically has a zero-second time-to-interactive. And yeah, I threw in a simple Passkey Vault Auth in the front.

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
*   Basically, for personal use, it's fast, free, neat, and secure. Does its job perfectly.

## 🏃‍♂️ How to Run

1. Clone or download this repo.
2. Run `npm install`.
3. You need to deploy your own Google Apps Script (GAS) using the `Code.gs` logic, grab the Web App URL, and paste it into `.env.local` inside `VITE_GAS_URL`.
4. Run `npm run dev`.

That's pretty much it! The code is super straightforward, literally all the heavy lifting UI is inside `App.jsx`, and `api.js` acts as a thin wrapper.

Cheers,  
*Web Dev yang lagi pusing ngatur cash flow* ✌️
