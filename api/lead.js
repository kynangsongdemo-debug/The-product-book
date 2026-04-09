import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

/** URL đọc tài liệu online (ưu tiên EBOOK_URL, fallback DRIVE_LINK — Google Drive hoặc trang trên Vercel đều được) */
const ebookUrl = process.env.EBOOK_URL || process.env.DRIVE_LINK;
const leadWebhookUrl = process.env.LEAD_WEBHOOK_URL;
const adminEmail = process.env.ADMIN_EMAIL || '';
const replyToEmail = process.env.REPLY_TO_EMAIL || 'contact@agilead.vn';
const senderName = process.env.SENDER_NAME || 'Product Academy';
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!leadWebhookUrl || !ebookUrl) {
    return res.status(500).json({
      error:
        'Chưa cấu hình server: thiếu LEAD_WEBHOOK_URL hoặc EBOOK_URL (hoặc DRIVE_LINK).',
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
  try {
    const whRes = await fetch(leadWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        source: 'the-product-book-ldp',
        createdAt: new Date().toISOString(),
        ebookUrl,
        adminEmail,
        replyToEmail,
        senderName,
      }),
    });
    if (!whRes.ok) {
      const text = await whRes.text().catch(() => '');
      return res.status(502).json({
        error: 'Không gửi được dữ liệu tới Google Apps Script.',
        detail: text.slice(0, 300),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to submit lead.',
      detail: error?.message || 'Unknown error',
    });
  }
}
