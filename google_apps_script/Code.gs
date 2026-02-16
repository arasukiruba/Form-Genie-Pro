// ─── CONFIGURATION ──────────────────────────────────
// 1. Create a folder in Google Drive for screenshots.
// 2. Open that folder, copy the ID from the URL (after /folders/) and paste it below.
const DRIVE_FOLDER_ID = '1Sp-G7ySxEhC0_TJqSEn7VomRVBBuCyWh';
// 3. Enter the email address where you want to receive registration alerts.
const ADMIN_EMAIL = 'arasukirubanandhan2430035@ssn.edu.in';

// Sheet Names
const SHEET_USERS = 'Users';
const SHEET_TRANSACTIONS = 'Transactions';
const SHEET_ANNOUNCEMENTS = 'Announcements';

// ─── SETUP FUNCTION ─────────────────────────────────
// Run this function ('setup') once from the editor to create sheets/headers!
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Users Sheet
  let usersSheet = ss.getSheetByName(SHEET_USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(SHEET_USERS);
    usersSheet.appendRow(['id', 'name', 'username', 'email', 'password', 'role', 'plan', 'credits', 'status', 'contact', 'created_at']);
    // Add default admin
    usersSheet.appendRow(['1', 'Admin', 'admin', 'admin@example.com', 'admin123', 'admin', 'pro', 9999, 'approved', '', new Date().toISOString()]);
  }
  
  // Transactions Sheet
  let txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  if (!txSheet) {
    txSheet = ss.insertSheet(SHEET_TRANSACTIONS);
    txSheet.appendRow(['id', 'user_id', 'transaction_id', 'screenshot_url', 'status', 'amount', 'created_at']);
  }
  
  // Announcements Sheet
  let annSheet = ss.getSheetByName(SHEET_ANNOUNCEMENTS);
  if (!annSheet) {
    annSheet = ss.insertSheet(SHEET_ANNOUNCEMENTS);
    annSheet.appendRow(['id', 'title', 'message', 'type', 'active', 'created_at']);
  }
}

// ─── API ROUTER ─────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    // CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Route Actions
    switch (action) {
      case 'register': return handleRegister(data);
      case 'login': return handleLogin(data);
      case 'getProfile': return handleGetProfile(data);
      case 'getUsers': return handleGetUsers(data);
      case 'approveUser': return handleUserAction(data, 'approve');
      case 'rejectUser': return handleUserAction(data, 'reject');
      case 'deleteUser': return handleDeleteUser(data);
      case 'toggleUserStatus': return handleUserStatus(data);
      case 'updateCredits': return handleUpdateCredits(data);
      case 'getAnnouncements': return handleGetAnnouncements(data);
      case 'createAnnouncement': return handleCreateAnnouncement(data);
      case 'toggleAnnouncement': return handleToggleAnnouncement(data);
      case 'deleteAnnouncement': return handleDeleteAnnouncement(data);
      case 'getScreenshot': return handleGetScreenshot(data);
      case 'adminStats': return handleAdminStats(data);
      default: return errorResponse('Invalid action');
    }
  } catch (error) {
    return errorResponse(error.toString());
  }
}

function doGet(e) {
  // Simple check to see if Web App is running
  return ContentService.createTextOutput(JSON.stringify({ status: 'active', time: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── HANDLERS ───────────────────────────────────────

function handleRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const users = sheet.getDataRange().getValues();

  // Check if username/email exists
  // Row structure: [id, name, username, email, password, role, plan, credits, status, contact, created_at]
  for (let i = 1; i < users.length; i++) {
    if (users[i][2] === data.username) return errorResponse('Username already exists');
    if (users[i][3] === data.email) return errorResponse('Email already registered');
  }

  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  // Password stored as plain text for GAS demo simplicity
  
  const credits = data.plan === 'starter' ? 150 : data.plan === 'pro' ? 300 : 500;
  
  // Upload Screenshot if present
  let screenshotUrl = '';
  if (data.screenshotBase64) {
    screenshotUrl = uploadToDrive(data.username + '_payment', data.screenshotBase64, data.mimeType);
  }

  sheet.appendRow([
    id, data.name, data.username, data.email, data.password, 'user', 
    data.plan, credits, 'pending', data.contact_number || data.contact, timestamp
  ]);

  // Log Transaction
  const txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  txSheet.appendRow([
    Utilities.getUuid(), id, data.transactionId, screenshotUrl, 'pending', 
    data.plan === 'starter' ? 100 : 180, timestamp
  ]);

  // 📧 SEND EMAIL TO ADMIN
  if (ADMIN_EMAIL && ADMIN_EMAIL !== 'PASTE_YOUR_ADMIN_EMAIL_HERE') {
    try {
      const emailBody = `
        <p>A new user has requested access to Form Genie.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-transform: capitalize;">${data.plan}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Transaction ID</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-family: monospace;">${data.transactionId}</td></tr>
          </table>
        </div>
        <p>Please check the Admin Panel to approve or reject this request.</p>
      `;

      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: '🆕 New User Registration using Form Genie: ' + data.name,
        htmlBody: getEmailTemplate('New User Registration', emailBody, screenshotUrl, 'View Payment Screenshot')
      });
    } catch (e) {
      // Ignore
    }
  }

  return successResponse({ message: 'Registration successful', userId: id });
}

function handleLogin(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const users = sheet.getDataRange().getValues();

  for (let i = 1; i < users.length; i++) {
    const row = users[i];
    if (row[2] === data.username && row[4] === data.password) {
      if (row[8] === 'pending') return errorResponse('Account pending approval');
      if (row[8] === 'disabled' || row[8] === 'rejected') return errorResponse('Account disabled');

      const user = {
        id: row[0], name: row[1], username: row[2], email: row[3],
        role: row[5], plan: row[6], credits: row[7], status: row[8]
      };
      
      return successResponse({ 
        token: Utilities.base64Encode(user.username + ':' + Date.now()), 
        user: user 
      });
    }
  }
  return errorResponse('Invalid credentials');
}

function handleGetProfile(data) {
  if(!data.token) return errorResponse('No token');
  
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(data.token)).getDataAsString();
    const username = decoded.split(':')[0];
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_USERS);
    const users = sheet.getDataRange().getValues();
    
    for (let i = 1; i < users.length; i++) {
     const row = users[i];
     if (row[2] === username) {
       return successResponse({
         user: {
           id: row[0], name: row[1], username: row[2], email: row[3],
           role: row[5], plan: row[6], credits: row[7], status: row[8]
         }
       });
     }
    }
    return errorResponse('User not found');
  } catch (e) {
    return errorResponse('Invalid token');
  }
}

function handleGetUsers(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();
  const users = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    // Filter by status if provided
    if (data.status && r[8] !== data.status && data.status !== '') continue;

    users.push({
      id: r[0], name: r[1], username: r[2], email: r[3], role: r[5],
      plan: r[6], credits: r[7], status: r[8], contact: r[9], created_at: r[10]
    });
  }
  return successResponse({ users: users.reverse() });
}

function handleDeleteUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.userId) { // Passed as body parameter
      sheet.deleteRow(i + 1);
      return successResponse({ message: 'User deleted' });
    }
  }
  return errorResponse('User not found');
}

function handleUserAction(data, action) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.userId) { // userId passed in body
      sheet.getRange(i + 1, 9).setValue(newStatus); // Status is col 9
      
      // 📧 SEND EMAIL TO USER IF APPROVED
      const userEmail = rows[i][3]; // Email is col 3
      const userName = rows[i][1];
      
      if (action === 'approve' && userEmail) {
        try {
          const emailBody = `
            <p>Hi ${userName},</p>
            <p>Great news! Your account has been successfully <strong>approved</strong>.</p>
            <p>You now have full access to Form Genie Pro. You can login immediately and start automating your Google Forms.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
          `;

          MailApp.sendEmail({
            to: userEmail,
            subject: '🎉 Account Approved - Form Genie Pro',
            htmlBody: getEmailTemplate('Welcome to Form Genie!', emailBody, 'https://arasukiruba.github.io/Form-Genie-Pro/', 'Go to Dashboard')
          });
        } catch (e) {
          // Ignore
        }
      }

      return successResponse({ message: 'User ' + newStatus });
    }
  }
  return errorResponse('User not found');
}

function handleUserStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.userId) {
       sheet.getRange(i + 1, 9).setValue(data.status); // Status col 9
       return successResponse({ message: 'User status updated' });
    }
  }
  return errorResponse('User not found');
}

function handleUpdateCredits(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.userId) {
       let current = rows[i][7];
       let newAmount = data.action === 'add' ? current + data.amount : current - data.amount;
       if (newAmount < 0) newAmount = 0;
       
       sheet.getRange(i + 1, 8).setValue(newAmount); // Credits col 8
       return successResponse({ message: 'Credits updated', credits: newAmount });
    }
  }
  return errorResponse('User not found');
}

function handleGetAnnouncements(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ANNOUNCEMENTS);
  // Ensure sheet exists
  if (!sheet) return successResponse({ announcements: [] });
  
  const rows = sheet.getDataRange().getValues();
  const list = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    list.push({
      id: r[0], title: r[1], message: r[2], type: r[3], active: r[4], created_at: r[5]
    });
  }
  return successResponse({ announcements: list.reverse() });
}

function handleCreateAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_ANNOUNCEMENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ANNOUNCEMENTS);
    sheet.appendRow(['id', 'title', 'message', 'type', 'active', 'created_at']);
  }
  
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  sheet.appendRow([id, data.title, data.message, data.type, true, timestamp]);
  return successResponse({ message: 'Announcement created' });
}

function handleToggleAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ANNOUNCEMENTS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
       const current = rows[i][4];
       sheet.getRange(i + 1, 5).setValue(!current);
       return successResponse({ message: 'Announcement toggled' });
    }
  }
  return errorResponse('Not found');
}

function handleDeleteAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ANNOUNCEMENTS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
       sheet.deleteRow(i + 1);
       return successResponse({ message: 'Deleted' });
    }
  }
  return errorResponse('Not found');
}

function handleGetScreenshot(data) {
  const url = generateScreenshotUrl(data.userId);
  if (url) return successResponse({ screenshotUrl: url });
  return errorResponse('No screenshot found');
}

function generateScreenshotUrl(userId) {
   const ss = SpreadsheetApp.getActiveSpreadsheet();
   const sheet = ss.getSheetByName(SHEET_TRANSACTIONS);
   const rows = sheet.getDataRange().getValues();
   for (let i=1; i<rows.length; i++) {
     if (rows[i][1] === userId) {
       return rows[i][3]; // Screenshot URL
     }
   }
   return '';
}

function handleAdminStats(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uSheet = ss.getSheetByName(SHEET_USERS);
  const uRows = uSheet.getDataRange().getValues();
  
  let totalUsers = 0;
  let pendingUsers = 0;
  
  for(let i=1; i<uRows.length; i++){
    totalUsers++;
    if(uRows[i][8] === 'pending') pendingUsers++;
  }
  
  return successResponse({ totalUsers, pendingUsers, revenue: 0 });
}

// ─── UTILS ──────────────────────────────────────────

// ─── EMAIL TEMPLATE ─────────────────────────────────

function getEmailTemplate(title, body, actionLink, actionText) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px;">
        
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 40px 0 30px 0; background: linear-gradient(135deg, #4285F4, #5a9cf5);">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Form Genie Genie</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Smart Automation Platform</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 40px 20px 40px;">
            <h2 style="color: #1e1b2e; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">${title}</h2>
            <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              ${body}
            </div>
            
            ${actionLink ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${actionLink}" style="background: linear-gradient(135deg, #4285F4, #5a9cf5); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(66, 133, 244, 0.2); transition: transform 0.2s;">
                  ${actionText || 'View Dashboard'}
                </a>
              </div>
            ` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Form Genie Pro. All rights reserved.<br>
              This is an automated message. Please do not reply directly.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function uploadToDrive(filename, base64Data, mimeType) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    // Return direct image link format for <img> tags
    return `https://lh3.googleusercontent.com/d/${file.getId()}`; 
  } catch (e) {
    return '';
  }
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
