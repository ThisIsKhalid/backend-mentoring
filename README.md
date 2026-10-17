# Backend Mentoring & Teaching — Version 5 (`v5`)

> **v5 Milestone**: File Uploads & Media Management (`multer`, file validation, MongoDB document linking, static file serving).

---

## 🚀 What's New in `v5`?

Comparing to `v4`:
- 📸 **Multipart Form Data**: Handled file uploads using `multer`.
- 📁 **Disk Storage Configuration**: Generated collision-proof unique filenames with timestamps (`image-1697541234567.jpg`).
- 🛡️ **File Type & Size Validation**: Strict regex whitelist (`jpeg|jpg|png|webp|gif`) and 5MB payload limit.
- 🔗 **MongoDB Document Linking**: Directly updated `products` collection with the relative image URL path (`imageUrl`).
- 🌐 **Static Asset Serving**: Made `/uploads` folder publicly accessible using `express.static()`.

For full changelog details, see [CHANGELOG.md](./CHANGELOG.md).

---

## 📡 API Reference in `v5`

### Upload Endpoints (`/api/upload`)
Requires `Authorization: Bearer <TOKEN>`. Headers must include `Content-Type: multipart/form-data`.

| Method | Endpoint | Form-Data Field | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | `image` (File) | Uploads image and returns public URL |
| `POST` | `/api/upload/product/:id` | `image` (File) | Uploads image and updates product document in MongoDB |

---

## 💻 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```
Server runs at `http://localhost:5000`. Uploaded images accessible at `http://localhost:5000/uploads/<filename>`.
