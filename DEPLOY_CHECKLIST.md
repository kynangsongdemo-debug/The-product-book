# Checklist triển khai — Lead Magnet The Product Book

Dùng trước khi coi landing là **hoàn tất** trên production.

## Đã rà trong code (dev)

- `npm run build` — thành công (`dist/` sẵn sàng)
- `npm run lint` — không lỗi

## Biến môi trường bắt buộc (Vercel)

| Biến | Ghi chú |
|------|---------|
| `ADMIN_EMAIL` | Nhận thông báo lead (do Apps Script gửi) |
| `EBOOK_URL` hoặc `DRIVE_LINK` | Ít nhất một URL đọc tài liệu (ưu tiên `EBOOK_URL`) |
| `LEAD_WEBHOOK_URL` | URL Web App `https://script.google.com/macros/s/.../exec` |

## Khuyến nghị

| Biến | Ghi chú |
|------|---------|
| `REPLY_TO_EMAIL` | Ví dụ `contact@agilead.vn` — user Trả lời mail tài liệu |
| `SENDER_NAME` | Tên chữ ký trong mail phản hồi (mặc định Product Academy) |

Sau khi sửa biến: **Redeploy** Vercel.

## Kiểm tra sau deploy

1. Mở URL production → cuộn hết trang, không lỗi console nghiêm trọng.
2. Gửi form với SĐT + email hợp lệ → thấy thông báo thành công.
3. Hộp thư user nhận mail có link đọc online.
4. `ADMIN_EMAIL` nhận mail lead.
5. Nếu đã cấu hình Sheet → dòng mới trong Google Sheet.

## Tài liệu chi tiết

- Email + Sheet + test local: `VERCEL_EMAIL_SETUP.md`
- Apps Script mẫu: `google-apps-script/Code.gs`
