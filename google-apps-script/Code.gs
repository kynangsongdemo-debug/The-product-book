/**
 * Dán vào Apps Script (Code.gs), xóa nội dung cũ, lưu, rồi Deploy Web App.
 */
var SPREADSHEET_ID = '1jXQfhjhTOt3eHC9X8uj2BdcpJ-mlIc5yxg6gUgcCT0M';

function doGet() {
  return ContentService.createTextOutput('OK - Webhook đã sẵn sàng. Mở URL này trên trình duyệt để test GET.');
}

function doPost(e) {
  console.log("Toàn bộ sự kiện e:", JSON.stringify(e));
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'No POST body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = JSON.parse(e.postData.contents);
    var name = data.name || '';
    var email = data.email || '';
    var phone = data.phone || '';
    var source = data.source || '';
    var createdAt = data.createdAt || new Date().toISOString();

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([
      createdAt,
      name,
      email,
      phone,
      source
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      sheetWritten: true,
      row: [createdAt, name, email, phone, source]
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err), detail: 'Kiểm tra Apps Script executions log.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
