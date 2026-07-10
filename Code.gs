/**
 * ==========================================================================
 * Code.gs — Google Apps Script Web App
 * Receives contact-form submissions (as JSON) and appends a row to a
 * Google Sheet. Deploy this bound to the Sheet you want to log into.
 *
 * Sheet columns (row 1 headers):
 *   Timestamp | Name | Email | Phone | Subject | Message
 * ==========================================================================
 */

// Name of the sheet/tab to write to. Change if you use a different tab name.
const SHEET_NAME = 'Contacts';

/**
 * Handles HTTP POST requests sent from the portfolio's contact form.
 * Expects a JSON body: { name, email, phone, subject, message }
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // avoid two simultaneous submissions overwriting each other

  try {
    const sheet = getOrCreateSheet();

    // Parse the incoming JSON payload
    const data = JSON.parse(e.postData.contents);

    // Basic server-side validation — never trust client-only checks
    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const subject = (data.subject || '').toString().trim();
    const message = (data.message || '').toString().trim();

    if (!name || !email || !subject || !message) {
      return jsonResponse({ result: 'error', error: 'Missing required fields.' });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return jsonResponse({ result: 'error', error: 'Invalid email address.' });
    }

    // Append the new submission as a row: Timestamp, Name, Email, Phone, Subject, Message
    sheet.appendRow([new Date(), name, email, phone, subject, message]);

    return jsonResponse({ result: 'success' });

  } catch (err) {
    return jsonResponse({ result: 'error', error: err.message });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Optional: lets you sanity-check the deployment by visiting the Web
 * App URL directly in a browser (GET request).
 */
function doGet() {
  return ContentService
    .createTextOutput('Portfolio contact form endpoint is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Returns the target sheet, creating it with headers if it doesn't exist yet.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Subject', 'Message']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Small helper to build a JSON HTTP response with the correct MIME type.
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
