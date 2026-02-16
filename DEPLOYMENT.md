# Deployment Guide (GitHub Pages)

This project has been migrated to a serverless architecture using Google Apps Script (Backend) and GitHub Pages (Frontend).

## Prerequisites
1.  **Node.js** installed.
2.  **Google Apps Script** deployed (see `google_apps_script/Setup.md`).

## 1. Setup
Install dependencies:
```bash
npm install
```

## 2. Environment Configuration
Ensure you have a `.env` file at the root with your GAS Web App URL:
```
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 3. Deploy to GitHub Pages
To deploy the frontend to GitHub Pages, run:

```bash
npm run deploy
```

This command will:
1.  Build the project (output to `dist`).
2.  Push the `dist` folder to the `gh-pages` branch of your repository.

## 4. GitHub Settings
1.  Go to your GitHub Repository > **Settings** > **Pages**.
2.  Ensure **Source** is set to `Deploy from a branch`.
3.  Select **Branch**: `gh-pages` / `root`.
4.  Your site will be live at `https://your-username.github.io/Form-Genie-Pro/`.
