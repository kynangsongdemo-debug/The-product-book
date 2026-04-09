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
    var name = data.name || '';
    var email = data.email || '';
    var phone = data.phone || '';
    var source = data.source || '';
    var createdAt = data.createdAt || new Date().toISOString();
    var ebookUrl = data.ebookUrl || '';
    var adminEmail = data.adminEmail || '';
    var senderName = data.senderName || 'Product Academy';
    var replyToEmail = data.replyToEmail || 'contact@agilead.vn';

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([
      createdAt,
      name,
      email,
      phone,
      source
    ]);

    if (email && ebookUrl) {
      var subject = 'Ebook The Product Book: Cam nang tro thanh Product Manager xuat sac (Ban tom tat)';
      var body = ''
        + 'Chao ' + name + ',\n\n'
        + 'Cam on ' + name + ' da quan tam den nhung tri thuc do Product Academy cung cap.\n\n'
        + 'Moi ban nhan tai lieu tai day: ' + ebookUrl + '\n\n'
        + 'Ngoai ra, de tim hieu them cac khoa hoc ve Phat trien san pham (Product Management), vui long truy cap: https://productacademy.edu.vn/\n\n'
        + 'Mong rang tai lieu nay se giup ich cho ban!\n\n'
        + 'Tran trong,\n'
        + '-------------------------------\n'
        + senderName + '\n'
        + 'Phat trien nang luc bai ban va toan dien cho nguoi lam san pham chuyen nghiep\n'
        + 'Hotline: 036-715-5580\n'
        + 'Email: hanhnhm@agilead.vn\n'
        + 'Website: https://productacademy.edu.vn/\n';

      var options = {};
      if (replyToEmail) options.replyTo = replyToEmail;
      MailApp.sendEmail(email, subject, body, options);
    }

    if (adminEmail) {
      var adminSubject = '[Lead moi] ' + name + ' - ' + email;
      var adminBody = ''
        + 'Lead moi tu landing page\n\n'
        + 'Ho ten: ' + name + '\n'
        + 'Email: ' + email + '\n'
        + 'So dien thoai: ' + phone + '\n'
        + 'Nguon: ' + source + '\n'
        + 'Thoi gian (UTC): ' + createdAt + '\n';
      MailApp.sendEmail(adminEmail, adminSubject, adminBody, { replyTo: email });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
