import { Resend } from 'resend';
import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

// Khởi tạo Resend với API Key từ environment
const resend = new Resend(process.env.RESEND_API_KEY);

const ebookUrl = process.env.EBOOK_URL || process.env.DRIVE_LINK;
const adminEmail = process.env.ADMIN_EMAIL || '';
const replyToEmail = process.env.REPLY_TO_EMAIL || 'contact@productacademy.edu.vn';
const senderName = process.env.SENDER_NAME || 'Product Academy';
// Email gửi đi phải là email đã verify trên Resend (ví dụ: noreply@agilead.vn)
const fromEmail = process.env.SENDER_EMAIL || 'cuc@agilead.vn'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Kiểm tra cấu hình Resend
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Chưa cấu hình RESEND_API_KEY trên server.' });
  }

  const { name, email, phone: phoneRaw } = req.body || {};

  // Validate đầu vào
  if (!name?.trim() || !email?.trim() || !phoneRaw?.trim()) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
  }

  if (!isValidVnPhone(phoneRaw)) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ.' });
  }

  const phone = normalizeVnPhone(phoneRaw);
  const userEmail = email.trim().toLowerCase();

  try {
    // 1. Gửi Email cho khách hàng (Chứa link Ebook)
    const { data, error } = await resend.emails.send({
      from: `${senderName} <${fromEmail}>`,
      to: [userEmail],
      reply_to: replyToEmail,
      subject: `Tặng bạn Ebook: The Product Book`,
      html: `
        <p>Chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã quan tâm đến tài liệu của chúng tôi.</p>
        <p>Bạn có thể tải Ebook tại đây: <a href="${ebookUrl}">${ebookUrl}</a></p>
        <p>Chúc bạn có những trải nghiệm tuyệt vời!</p>
        <br/>
        <p>Trân trọng,</p>
        <p>${senderName}</p>
      `,
    });

    if (error) {
      return res.status(400).json({ error: 'Lỗi khi gửi email qua Resend', detail: error });
    }

    // 2. Gửi thông báo về Admin (Tùy chọn - nếu bạn muốn nhận mail báo có lead mới)
    if (adminEmail) {
      await resend.emails.send({
        from: `${senderName} System <${fromEmail}>`,
        to: [adminEmail],
        subject: `[New Lead] ${name} vừa đăng ký nhận Ebook`,
        html: `
          <h3>Thông tin khách hàng mới:</h3>
          <ul>
            <li><strong>Họ tên:</strong> ${name}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Số điện thoại:</strong> ${phone}</li>
            <li><strong>Nguồn:</strong> the-product-book-ldp</li>
          </ul>
        `,
      });
    }

    return res.status(200).json({ ok: true, message: 'Email sent successfully', id: data.id });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process lead.',
      detail: error?.message || 'Unknown error',
    });
  }
}
