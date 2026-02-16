# Setup Guide: Google Apps Script Backend

Since I cannot deploy this for you, please follow these steps carefully.

## 1. Create Google Sheet
1.  Go to **sheets.new** to create a new spreadsheet.
2.  Name it `FormGenie Database`.
3.  Create the following **Tabs** (at the bottom) and **Header Rows** (Row 1):
    *   **Users**: `id` | `name` | `username` | `email` | `password` | `role` | `plan` | `credits` | `status` | `contact` | `created_at`
    *   **Transactions**: `id` | `user_id` | `transaction_id` | `screenshot_url` | `status` | `amount` | `created_at`
    *   **Announcements**: `id` | `title` | `message` | `type` | `active` | `created_at`
4.  Adding an **Admin User**:
    *   Manually add a row to **Users**:
    *   `id`: `1`
    *   `username`: `admin`
    *   `password`: `admin123` (or your preferred password)
    *   `role`: `admin`
    *   `status`: `approved`
5.  Copy the **Spreadsheet ID** from the URL: `docs.google.com/spreadsheets/d/SpreadsheetID/edit...`

## 2. Create Google Drive Folder
1.  Go to **drive.google.com**.
2.  Create a folder named `FormGenie_Screenshots`.
3.  Open the folder and copy the **Folder ID** from the URL: `drive.google.com/drive/u/0/folders/FolderID`.

## 3. Deploy Script
1.  Inside your Google Sheet, go to **Extensions > Apps Script**.
2.  Delete any code in `Code.gs` and **Paste** the contents of the file I provided (`google_apps_script/Code.gs`).
3.  **Update Configuration:**
    *   Replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID.
    *   Replace `YOUR_DRIVE_FOLDER_ID_HERE` with your Folder ID.
4.  Click **Save** (Floppy disk icon).
5.  Click **Deploy > New deployment**.
    *   Select type: **Web app**.
    *   Description: `Initial Deploy`.
    *   Execute as: **Me**.
    *   Who has access: **Anyone** (Important for the app to work).
6.  Click **Deploy**.
    *   Authorize access when prompted (Click Advanced > Go to Untitled Project (unsafe) if warned).
7.  **Copy the Web App URL**.

## 4. Connect Frontend
1.  Provide the Web App URL to me, and I will update your frontend configuration.
