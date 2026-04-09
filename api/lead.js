import { Resend } from 'resend';
import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;
const adminEmail = process.env.ADMIN_EMAIL;
/** Hộp thư nhận phản hồi khi user bấm "Trả lời" trên email tài liệu (mặc định = ADMIN_EMAIL) */
const replyToEmail = process.env.REPLY_TO_EMAIL || adminEmail;
/** URL đọc tài liệu online (ưu tiên EBOOK_URL, fallback DRIVE_LINK — Google Drive hoặc trang trên Vercel đều được) */
const ebookUrl = process.env.EBOOK_URL || process.env.DRIVE_LINK;
const leadWebhookUrl = process.env.LEAD_WEBHOOK_URL;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!resendApiKey || !fromEmail || !adminEmail || !ebookUrl) {
    return res.status(500).json({
      error:
        'Chưa cấu hình server: thiếu RESEND/FROM/ADMIN hoặc chưa đặt EBOOK_URL (hoặc DRIVE_LINK) — đó là link sách trong mail.',
    });
  }

  const name = (req.body?.name || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();
  const phoneRaw = (req.body?.phone || '').trim();

  if (!name || !email || !phoneRaw) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email và số điện thoại.' });
  }

  if (name.length < 2) {
    return res.status(400).json({ error: 'Họ tên cần ít nhất 2 ký tự.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email không đúng định dạng.' });
  }

  if (!isValidVnPhone(phoneRaw)) {
    return res.status(400).json({
      error: 'Số điện thoại không hợp lệ. Dùng số di động Việt Nam (ví dụ: 0912345678).',
    });
  }

  const phone = normalizeVnPhone(phoneRaw);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);

  const resend = new Resend(resendApiKey);

  try {
    if (leadWebhookUrl) {
      const whRes = await fetch(leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          source: 'the-product-book-ldp',
          createdAt: new Date().toISOString(),
        }),
      });
      if (!whRes.ok) {
        const text = await whRes.text().catch(() => '');
        return res.status(502).json({
          error: 'Không lưu được lead lên Google Sheet. Vui lòng thử lại sau.',
          detail: text.slice(0, 200),
        });
      }
    }

    const academyUrl = 'https://productacademy.edu.vn/';
    const userEmailSubject =
      'Ebook The Product Book: Cẩm nang trở thành Product Manager xuất sắc (Bản tóm tắt)';

    await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: replyToEmail,
      subject: userEmailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.65; color: #111;">
          <p>Chào ${safeName},</p>
          <p>Cảm ơn ${safeName} đã quan tâm đến những tri thức do Product Academy cung cấp.</p>
          <p>Mời bạn nhận tài liệu tại đây: <a href="${escapeHtml(ebookUrl)}" target="_blank" rel="noopener noreferrer">mở đọc tài liệu online</a></p>
          <p style="font-size:13px;color:#444;word-break:break-all;margin-top:8px;">Nếu không bấm được link, hãy copy dán vào trình duyệt:<br/>${escapeHtml(ebookUrl)}</p>
          <p>Ngoài ra, để tìm hiểu thêm các khóa học về Phát triển sản phẩm (Product Management), vui lòng truy cập: <a href="${academyUrl}" target="_blank" rel="noopener noreferrer">${academyUrl}</a></p>
          <p>Mong rằng tài liệu này sẽ giúp ích cho bạn!</p>
          <p>Trân trọng,</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;max-width:360px;" />
          <p style="margin:0;"><strong>Product Academy</strong></p>
          <p style="margin:8px 0 0;">Phát triển năng lực bài bản và toàn diện cho người làm sản phẩm chuyên nghiệp</p>
          <p style="margin:12px 0 0;">☎ Hotline: 036-715-5580<br />
          📩 Email: <a href="mailto:hanhnhm@agilead.vn">hanhnhm@agilead.vn</a><br />
          🌍 Website: <a href="${academyUrl}" target="_blank" rel="noopener noreferrer">${academyUrl}</a></p>
        </div>
      `,
    });

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: email,
      subject: `[Lead mới] ${name} — ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h3>Lead mới từ landing page</h3>
          <p><strong>Họ tên:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Số điện thoại:</strong> ${safePhone}</p>
          <p><strong>Thời gian (UTC):</strong> ${new Date().toISOString()}</p>
          <p><em>Bấm Trả lời để gửi thư trực tiếp tới email của lead.</em></p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to submit lead.',
      detail: error?.message || 'Unknown error',
    });
  }
}
