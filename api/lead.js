import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

/** URL đọc tài liệu online (ưu tiên EBOOK_URL, fallback DRIVE_LINK — Google Drive hoặc trang trên Vercel đều được) */
const ebookUrl = process.env.EBOOK_URL || process.env.DRIVE_LINK;
const leadWebhookUrl = process.env.LEAD_WEBHOOK_URL;
const adminEmail = process.env.ADMIN_EMAIL || '';
const replyToEmail = process.env.REPLY_TO_EMAIL || 'contact@agilead.vn';
const senderName = process.env.SENDER_NAME || 'Product Academy';
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Google Apps Script Web App thường trả 302 → URL có token. Fetch mặc định có thể
 * follow redirect sai (POST mất body / đổi method), nên POST lại thủ công theo Location.
 */
async function postToGoogleAppsScript(webhookUrl, body) {
  const payload = JSON.stringify(body);
  const headers = { 'Content-Type': 'application/json' };
  let url = String(webhookUrl).trim();
  let lastRes = null;
  for (let i = 0; i < 5; i++) {
    lastRes = await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
      redirect: 'manual',
    });
    const loc = lastRes.headers.get('location');
    if (
      (lastRes.status === 301 ||
        lastRes.status === 302 ||
        lastRes.status === 303 ||
        lastRes.status === 307 ||
        lastRes.status === 308) &&
      loc
    ) {
      url = loc.startsWith('http') ? loc : new URL(loc, url).href;
      continue;
    }
    return lastRes;
  }
  return lastRes;
}

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
    const whRes = await postToGoogleAppsScript(leadWebhookUrl, {
      name,
      email,
      phone,
      source: 'the-product-book-ldp',
      createdAt: new Date().toISOString(),
      ebookUrl,
      adminEmail,
      replyToEmail,
      senderName,
    });
    if (!whRes.ok) {
      const text = await whRes.text().catch(() => '');
      return res.status(502).json({
        error: 'Không gửi được dữ liệu tới Google Apps Script.',
        status: whRes.status,
        statusText: whRes.statusText,
        detail: text.slice(0, 500),
      });
    }

    const rawText = await whRes.text().catch(() => '');
    let webhookData = null;
    try {
      webhookData = rawText ? JSON.parse(rawText) : null;
    } catch {
      webhookData = null;
    }

    // Bắt rõ trường hợp Google trả HTML/redirect/login page thay vì JSON từ doPost.
    if (!webhookData || typeof webhookData !== 'object') {
      return res.status(502).json({
        error: 'Google Apps Script không trả JSON hợp lệ.',
        status: whRes.status,
        statusText: whRes.statusText,
        contentType: whRes.headers.get('content-type') || '',
        detail: rawText.slice(0, 500),
      });
    }

    if (webhookData?.ok !== true) {
      return res.status(502).json({
        error: webhookData.error || 'Google Apps Script xử lý thất bại.',
        detail: webhookData.detail || '',
        webhook: webhookData,
      });
    }

    return res.status(200).json({ ok: true, webhook: webhookData });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to submit lead.',
      detail: error?.message || 'Unknown error',
    });
  }
}
