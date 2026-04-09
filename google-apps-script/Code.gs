/**
 * Dan vao Apps Script (Code.gs), xoa noi dung cu, luu, Deploy Web App.
 * Chi dung dau nhay ASCII ' va dau gach - thuong.
 */
var SPREADSHEET_ID = '1clxWdAjf2V3ypIGR-XX_FTT2bMMRrQfEwPikryE9bn4';

function doGet() {
  return ContentService.createTextOutput('OK - Webhook ready. Open this URL in browser to test GET.');
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'No POST body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([
      data.createdAt || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.source || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
