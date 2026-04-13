import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

const ebookUrl = process.env.EBOOK_URL || process.env.DRIVE_LINK;
const leadWebhookUrl = process.env.LEAD_WEBHOOK_URL;
const adminEmail = process.env.ADMIN_EMAIL || '';
const replyToEmail = process.env.REPLY_TO_EMAIL || 'contact@agilead.vn';
const senderName = process.env.SENDER_NAME || 'Product Academy';
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Hàm gửi dữ liệu tới Google Apps Script
 */
async function postToGoogleAppsScript(webhookUrl, body) {
  const url = String(webhookUrl).trim();
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', 
    },
    body: JSON.stringify(body),
    redirect: 'follow', 
  };

  const response = await fetch(url, options);
  return response; // Trả về nguyên bản đối tượng Response để các logic bên dưới sử dụng ok, text, status
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!leadWebhookUrl || !ebookUrl) {
    return res.status(500).json({
      error: 'Chưa cấu hình server: thiếu LEAD_WEBHOOK_URL hoặc EBOOK_URL.',
    });
  }

  const name = (req.body?.name || '').trim();
  const email = (req.body?.email || '').trim().toLowerCase();
  const phoneRaw = (req.body?.phone || '').trim();

  if (!name || !email || !phoneRaw) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
  }

  if (!isValidVnPhone(phoneRaw)) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ.' });
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

    // Lấy nội dung phản hồi dưới dạng text trước
    const rawText = await whRes.text().catch(() => '');

    if (!whRes.ok) {
      return res.status(502).json({
        error: 'Không gửi được dữ liệu tới Google Apps Script.',
        status: whRes.status,
        detail: rawText.slice(0, 500),
      });
    }

    let webhookData = null;
    try {
      webhookData = JSON.parse(rawText);
    } catch (e) {
      // Nếu không parse được JSON, có thể Google trả về trang Login hoặc HTML lỗi
      return res.status(502).json({
        error: 'Google Apps Script không trả về JSON hợp lệ.',
        contentType: whRes.headers.get('content-type'),
        detail: rawText.slice(0, 500),
      });
    }

    // Kiểm tra kết quả xử lý bên trong của Script (nếu bạn có trả về {ok: true})
    // Lưu ý: Nếu script của bạn chỉ trả về text thuần, đoạn này có thể cần điều chỉnh
    return res.status(200).json({ ok: true, webhook: webhookData });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to submit lead.',
      detail: error?.message || 'Unknown error',
    });
  }
}