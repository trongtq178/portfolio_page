# Portfolio – Senior Backend Developer

Trang portfolio tĩnh (HTML/CSS/JS thuần, không cần build) với 2 ngôn ngữ Việt/Anh và chức năng tải CV dạng `.docx`.

## Cấu trúc

```
index.html        Bố cục trang
css/style.css     Giao diện (sáng/tối, responsive)
js/data.js        ★ Nội dung CV (VI + EN) và chuỗi giao diện — chỉ cần sửa file này
js/cv-docx.js     Tạo file Word (.docx) từ data.js bằng thư viện docx@8.5.0
js/app.js         Render trang, chuyển ngôn ngữ, theme, nút tải CV
```

## Chạy thử

Mở trực tiếp `index.html`, hoặc chạy server tĩnh:

```bash
npx serve .        # hoặc: python3 -m http.server 8080
```

## Tuỳ chỉnh

- Sửa thông tin cá nhân trong `js/data.js` (`common` dùng chung, `vi` / `en` là nội dung theo ngôn ngữ).
- Trang web và file CV `.docx` cùng đọc từ một nguồn dữ liệu, nên luôn khớp nhau.
- Ngôn ngữ được chọn theo thứ tự: tham số URL `?lang=vi|en` → lựa chọn đã lưu → ngôn ngữ trình duyệt.

## Deploy

Toàn bộ là file tĩnh, có thể deploy lên GitHub Pages, Netlify, Vercel, Cloudflare Pages… mà không cần cấu hình gì thêm.
