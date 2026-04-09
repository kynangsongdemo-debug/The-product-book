# Vercel setup for lead form

## 0) Chỉ dùng Vercel để “up web” — tối giản

**Trên máy bạn:** không bắt buộc cài Vercel CLI hay chạy `npm run build` để deploy. Chỉ cần đẩy code lên GitHub (hoặc kéo thư mục bằng Vercel Dashboard nếu bạn dùng tính năng đó).

**Trên Vercel (web):** Import repo → Deploy. Xong phần hosting.

**Ngoài Vercel** (vẫn là “ít bước”, không phải cài thêm trên server):

| Việc | Bắt buộc? | Ghi chú |
|------|-----------|---------|
| **Google Apps Script** + `LEAD_WEBHOOK_URL` | Có (Google-only) | Vừa lưu sheet vừa gửi mail |
| Chạy `npm run dev` trên máy | Không | Chỉ khi bạn muốn sửa code và xem local |

Tóm lại: Vercel chỉ lo **build + host**; Apps Script sẽ xử lý **cả gửi mail lẫn lưu Google Sheet**.

---

## 1) Add environment variables on Vercel

Project Settings -> Environment Variables:

- `ADMIN_EMAIL`: email nhận thông báo mỗi khi có lead (ví dụ `cuc@agillead.vn`)
- `REPLY_TO_EMAIL` (khuyến nghị): khi user bấm **Trả lời** trên email tài liệu, thư tới địa chỉ này (ví dụ `contact@agilead.vn`). Nếu bỏ trống, dùng `ADMIN_EMAIL`.
- `SENDER_NAME` (khuyến nghị): tên hiển thị chữ ký mail, ví dụ `Product Academy`
- `EBOOK_URL` hoặc `DRIVE_LINK`: **URL đọc tài liệu** (trang ebook online trên Vercel, hoặc link Google Drive — chỉ cần **một** URL công khai). Ưu tiên `EBOOK_URL` nếu bạn đặt cả hai.
- `LEAD_WEBHOOK_URL`: URL Google Apps Script (web app) để ghi lead và gửi mail. Nếu thiếu, form không hoạt động.

## 2) Deploy

- Push source code to GitHub
- Import repository into Vercel
- Deploy

Vercel will run static frontend + `/api/lead` serverless function automatically.

## 3) Test

- Open landing page and submit form
- Check mailbox người dùng: nhận email chứa link tài liệu
- Check mailbox `ADMIN_EMAIL`: nhận thông báo lead

## 4) Chạy thử trên máy (local)

### Chỉ xem giao diện

- `npm run dev` → mở URL Vite (thường `http://localhost:5173`).  
- **Form submit sẽ lỗi** vì `npm run dev` **không** chạy API `/api/lead` (chỉ có trên Vercel hoặc khi dùng lệnh bên dưới).

### Test đầy đủ: form + email + Sheet (giống production)

1. Copy `.env.example` → **`.env.local`** trong cùng thư mục project, điền đủ biến (`ADMIN_EMAIL`, `REPLY_TO_EMAIL`, `SENDER_NAME`, `EBOOK_URL`/`DRIVE_LINK`, `LEAD_WEBHOOK_URL`).
2. Chạy: **`npm run dev:vercel`**  
   - Lần đầu có thể hỏi đăng nhập Vercel / link project — làm theo hướng dẫn trên terminal (hoặc chọn scope cá nhân).  
   - Terminal sẽ in URL (thường `http://localhost:3000`) — mở URL đó để thử đăng ký.  
3. Submit form: mail và Sheet sẽ chạy thật (dùng đúng key trong `.env.local`).

**Ghi chú:** Nếu không muốn cài flow Vercel CLI, bạn vẫn có thể **chỉ test trên bản đã deploy** trên Vercel (URL production).

## 5) Google Sheet — lead đổ về file của bạn

Sheet đích: [Danh sách đăng ký Lead Magnet 01](https://docs.google.com/spreadsheets/d/1clxWdAjf2V3ypIGR-XX_FTT2bMMRrQfEwPikryE9bn4/edit?gid=0#gid=0)  
**Spreadsheet ID:** `1clxWdAjf2V3ypIGR-XX_FTT2bMMRrQfEwPikryE9bn4` (tab đầu tiên).

**Điều kiện:** Tài khoản Google bạn đăng nhập phải **có quyền chỉnh sửa** file Sheet đó (Owner hoặc được share quyền Edit).

API gửi `POST` JSON tới `LEAD_WEBHOOK_URL`; Apps Script sẽ ghi Sheet và gửi email, body:

`{ "name", "email", "phone", "source", "createdAt", "ebookUrl", "adminEmail", "replyToEmail", "senderName" }` — `phone` dạng `0xxxxxxxxx`.

---

### A. Chuẩn bị Sheet (1 phút)

1. Mở link Sheet ở trên (đăng nhập đúng Gmail có quyền sửa).
2. Ở **hàng 1**, gõ tiêu đề (không bắt buộc cho code chạy, nhưng nên có để dễ đọc):  
   `Thời gian` | `Họ tên` | `Email` | `SĐT` | `Nguồn`  
   (mỗi cột một ô A1, B1, C1…)

---

### B. Tạo Apps Script và dán code

1. Trong cửa sổ Sheet: menu **Tiện ích mở rộng** (Extensions) → **Apps Script**.  
   - Nếu không thấy: thử **Extensions** bằng tiếng Anh, hoặc **Công cụ khác** tùy giao diện.
2. Xóa hết nội dung mặc định trong file `Code.gs`, dán **toàn bộ** đoạn sau rồi **Ctrl+S** (Lưu):

   - **Không** dán các dòng có ba dấu \`\`\` (fence) — chỉ dán phần code bên dưới.  
   - Nếu vẫn báo lỗi syntax: mở file trong project **`google-apps-script/Code.gs`**, copy toàn bộ từ đó (tránh ký tự lạ khi copy từ trình xem Markdown).

```javascript
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
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([
      data.createdAt || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.source || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Lần đầu, nhấn **Run** (Chạy) chọn hàm `doGet` → Google sẽ bật cửa sổ **Cấp quyền** → chọn tài khoản → **Cho phép** (Advanced / Go to … nếu Google cảnh báo “app chưa xác minh” — đây là script của bạn, vẫn **Allow**).

---

### C. Deploy Web App (bước dễ nhầm nhất)

1. Trong trình soạn Apps Script: nút **Deploy** (Triển khai) → **New deployment** (Triển khai mới).
2. Biểu tượng bánh răng bên cạnh **Select type** → chọn **Web app**.
3. Điền:
   - **Description:** ví dụ `Lead webhook v1`
   - **Execute as:** **Me** (Tôi)
   - **Who has access:** **Anyone** (Bất kỳ ai) — **bắt buộc** để máy chủ Vercel gọi được.  
     - Nếu công ty bạn chặn “Anyone”, cần tài khoản Google Workspace cho phép hoặc dùng cách khác (liên hệ IT).
4. **Deploy** → copy **URL** dạng `https://script.google.com/macros/s/AKfycb.../exec`  
   - Phải kết thúc bằng `/exec` (hoặc tương đương mà Google hiển thị). **Không** dùng link trình soạn script.

5. Kiểm tra nhanh: dán URL đó vào trình duyệt → nên thấy dòng chữ `OK — Webhook đã chạy...` (do `doGet`). Nếu lỗi 403 / không cho truy cập → xem mục **D** bên dưới.

---

### D. Nối vào Vercel

1. Vào project trên Vercel → **Settings** → **Environment Variables**.
2. Thêm biến **`LEAD_WEBHOOK_URL`** = **URL Web App đầy đủ** từ ô Deploy (dạng `https://script.google.com/macros/s/AKfycb.../exec`) — không thừa khoảng trắng.  
   - **Không** dùng URL dài kiểu `script.googleusercontent.com/macros/echo?user_content_key=...` (thường là bản redirect khi mở trình duyệt); chỉ URL **`script.google.com/.../exec`** mới ổn định cho **POST** từ Vercel.
3. **Save** → vào tab **Deployments** → **Redeploy** bản mới nhất (để server nhận biến mới).

**Lưu ý:** Nếu **không** điền `LEAD_WEBHOOK_URL`, form vẫn gửi email nhưng **sẽ không ghi Sheet**.

**Lỗi khi mở URL Web App trong trình duyệt:** `Script function not found: doGet` — trình duyệt gửi **GET**, nên script **bắt buộc** có cả `doGet` (để kiểm tra) và `doPost` (để form gửi dữ liệu). Dán lại **toàn bộ** đoạn ở mục **B** (có cả `doGet` và `doPost`), **Lưu** → **Deploy → Manage deployments → Edit** → chọn phiên bản mới → **Deploy**. Sau đó mở lại URL: phải thấy chữ `OK — Webhook đã chạy...`.

---

### E. Thử form

1. Mở landing đã deploy, điền form và gửi.
2. Vài giây sau, Sheet phải có **thêm một dòng** (cột A = thời gian, B = tên…).

---

### F. Xử lý sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Sheet không có dòng mới | Kiểm tra Vercel đã có `LEAD_WEBHOOK_URL` và đã **Redeploy** sau khi thêm biến. |
| Form báo lỗi lưu Sheet | Mở **Deployments → Functions / Logs** trên Vercel xem lỗi; hoặc sửa script và **Deploy lại** Web app (đôi khi cần **Manage deployments → Edit** và Deploy phiên bản mới). |
| Trình duyệt mở URL webhook báo 403 | Deploy lại Web app, chọn **Who has access: Anyone**. |
| Trình duyệt báo **`Script function not found: doGet`** | Thêm hàm `doGet` trong Apps Script (như mục **B**), **Deploy lại** Web app. |
| Apps Script báo **syntax error** / đỏ dòng | Không dán nhầm các dòng fence markdown (ba dấu backtick). Copy từ file **`google-apps-script/Code.gs`** trong project. Tránh dấu nháy kiểu Word; trong code chỉ dùng nháy đơn ASCII `'` |
| Google báo không có quyền Sheet | Tài khoản bạn **Deploy** phải là tài khoản **có quyền sửa** file Sheet; hoặc share Sheet quyền Edit cho đúng Gmail đó. |
| Sửa code Script xong mà không đổi | Mỗi lần sửa `doPost`/`doGet` cần **Deploy → Manage deployments → Edit** (hoặc New deployment) rồi **Deploy** lại — bản cũ không tự cập nhật. |
| **Lỗi “sync” / không lưu được code trong Apps Script** | Xem khối **G** bên dưới. |
| **Lỗi sync Git ↔ Vercel** (deploy không kéo code mới) | Kiểm tra GitHub đã **push** chưa; trên Vercel **Settings → Git** xem repo đúng branch; **Redeploy** hoặc **Reconnect** repository. |

### G. Lỗi “code sync” trong Google Apps Script (không lưu / báo đỏ)

Thông báo kiểu *Unable to sync*, *Failed to save*, *Something went wrong* khi sửa `Code.gs` thường do mạng hoặc trình duyệt, không phải do đoạn code webhook sai.

1. **F5** tải lại tab `script.google.com`, thử **Lưu** (Ctrl+S) lại.
2. Tắt **extension chặn quảng cáo / privacy** với `script.google.com` (uBlock, Brave shields…) hoặc mở Apps Script ở **cửa sổ ẩn danh** / trình duyệt khác.
3. Đăng nhập đúng **một** tài khoản Google (tránh 2 profile Chrome xung đột).
4. Thử **mạng khác** (4G / WiFi khác) nếu công ty chặn `googleusercontent.com` / Apps Script.
5. Nếu vẫn lỗi: **Tệp (File) → Sao chép dự án** (Copy project) → mở bản copy, dán lại code → Lưu. Hoặc tạo dự án Script mới, dán code, gắn lại Sheet (bound script từ **Extensions → Apps Script** trên Sheet thường ổn định hơn script tách rời).

Sau khi lưu được, làm tiếp mục **C** (Deploy Web App).

**Tab khác:** đổi `getSheets()[0]` thành `ss.getSheetByName('Tên tab')` nếu không dùng tab đầu.

**Bảo mật:** có thể thêm `?key=chuỗi-bí-mật` vào URL và trong `doPost` kiểm tra `e.parameter.key` trước `appendRow`.
