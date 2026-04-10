/**
 * Dán vào Apps Script (Code.gs), xóa nội dung cũ, lưu, rồi Deploy Web App.
 */
var SPREADSHEET_ID = '1jXQfhjhTOt3eHC9X8uj2BdcpJ-mlIc5yxg6gUgcCT0M';

function doGet() {
  return ContentService.createTextOutput('OK - Webhook đã sẵn sàng. Mở URL này trên trình duyệt để test GET.');
}

function doPost(e) {
  console.log("Toàn bộ sự kiện e:", JSON.stringify(e)); // Thêm dòng này
  try {
    // ... code còn lại
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
    var adminEmail = data.adminEmail || 'kynangsongdemo@gmail.com,cuc@agilead.vn';
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

    if (!email || !ebookUrl) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: 'Thiếu email hoặc ebookUrl trong payload.',
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var userMailSent = false;
    var adminMailSent = false;

    if (email && ebookUrl) {
      var subject = 'Ebook The Product Book: Cẩm nang trở thành Product Manager xuất sắc (Bản tóm tắt)';
      var body = ''
        + 'Chào ' + name + ',\n\n'
        + 'Cảm ơn ' + name + ' đã quan tâm đến những tri thức do Product Academy cung cấp.\n\n'
        + 'Mời bạn nhận tài liệu tại đây: ' + ebookUrl + '\n\n'
        + 'Ngoài ra, để tìm hiểu thêm các khóa học về Phát triển sản phẩm (Product Management), vui lòng truy cập: https://productacademy.edu.vn/\n\n'
        + 'Mong rằng tài liệu này sẽ giúp ích cho bạn!\n\n'
        + 'Trân trọng,\n'
        + '-------------------------------\n'
        + senderName + '\n'
        + 'Phát triển năng lực bài bản và toàn diện cho người làm sản phẩm chuyên nghiệp\n'
        + 'Hotline: 036-715-5580\n'
        + 'Email: hanhnhm@agilead.vn\n'
        + 'Website: https://productacademy.edu.vn/\n';

      // Khai báo email bí danh (Alias) mà bạn đã cài đặt
      var fromAlias = 'contact@agilead.vn'; 

      var options = { 
        name: senderName,
        from: fromAlias // Sử dụng thuộc tính from của GmailApp
      };
      
      if (replyToEmail) options.replyTo = replyToEmail;
      
      // ĐỔI MailApp THÀNH GmailApp TẠI ĐÂY
      GmailApp.sendEmail(email, subject, body, options); 
      userMailSent = true;
    }

    if (adminEmail) {
      var adminSubject = '[Lead mới] ' + name + ' - ' + email;
      var adminBody = ''
        + 'Lead mới từ landing page\n\n'
        + 'Họ tên: ' + name + '\n'
        + 'Email: ' + email + '\n'
        + 'Số điện thoại: ' + phone + '\n'
        + 'Nguồn: ' + source + '\n'
        + 'Thời gian (UTC): ' + createdAt + '\n';
      
      // Khai báo bí danh (Alias) đã cài đặt trong Gmail
      var fromAlias = 'contact@agilead.vn';

      // Sử dụng GmailApp thay cho MailApp để hỗ trợ thuộc tính "from"
      GmailApp.sendEmail(adminEmail, adminSubject, adminBody, { 
        replyTo: email,
        from: fromAlias 
      });
      
      adminMailSent = true;
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      sheetWritten: true,
      userMailSent: userMailSent,
      adminMailSent: adminMailSent
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err), detail: 'Kiểm tra Apps Script executions log.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
