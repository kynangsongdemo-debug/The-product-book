# Gói LDP — cách dùng lại sau khi giải nén

## Nội dung gói (source)

Gói **không** kèm `node_modules` (cài lại bằng npm để đồng bộ phiên bản).

## Mở và chạy

```bash
cd the-product-book-ldp
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Kết quả trong thư mục `dist/`.

## Triển khai Vercel

Đẩy code lên GitHub → Import project trên Vercel → điền biến môi trường theo `DEPLOY_CHECKLIST.md` và `VERCEL_EMAIL_SETUP.md`.

## File gói zip

Bản zip được tạo cùng cấp thư mục cha của project, tên: **`Product-Book-LDP-package.zip`** (chạy lại lệnh đóng gói nếu cần cập nhật).
