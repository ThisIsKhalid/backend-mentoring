# Changelog

All notable changes to the **Backend Mentoring & Teaching Project** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v6.0.0] - Production Security Hardening & Rate Limiting

### 🎯 Educational Goal
Learn essential backend defensive engineering to protect web applications against common web vulnerabilities, brute-force password cracking, NoSQL query injection, and denial-of-service (DDoS) flooding.

### 📦 New Dependencies
- `helmet`: Sets secure HTTP headers (`X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`, etc.).
- `express-rate-limit`: IP-based request throttling.
- `express-mongo-sanitize`: Sanitizes user input to prevent MongoDB operator injection.

### 📁 Files Added
- `src/middleware/rateLimiter.js`:
  - `globalLimiter`: Throttles all `/api` endpoints to 100 requests per 15-minute window per IP.
  - `authLimiter`: Strict limiter capping `/api/auth/login` and `/api/auth/register` to 10 requests per 15-minute window per IP to block credential-stuffing bots.

### ✏️ Files Modified
- `server.js`:
  - Integrated `helmet` with `crossOriginResourcePolicy: { policy: 'cross-origin' }` so frontend clients can display uploaded media.
  - Added `express-mongo-sanitize` to strip prohibited `$` query injection payloads.
  - Added payload body size limits (`10kb`) on `express.json()` and `express.urlencoded()`.
  - Configured CORS with environment-driven `CORS_ORIGIN` support.
  - Mounted `globalLimiter` on `/api` and `authLimiter` on auth routes.
- `.env.example` & `.env`: Added `CORS_ORIGIN`.

---

## [v5.0.0] - File Uploads & Media Management (`multer` & Static Serving)

### 🎯 Educational Goal
Learn how backends handle `multipart/form-data` uploads (such as images), validate file types and sizes, store files safely on the server disk, link uploaded file URLs to MongoDB documents, and serve static assets publicly.

### 📦 New Dependencies
- `multer`: Middleware for handling `multipart/form-data`.

### 📁 Files Added
- `src/middleware/uploadMiddleware.js`: Multer disk storage engine configuring storage paths, unique timestamp-based filenames, 5MB file size limit, and regex image type validation.
- `src/controllers/uploadController.js`:
  - `uploadFile`: Handles generic file upload and returns accessible public URL path.
  - `uploadProductImage`: Uploads image and updates `imageUrl` on the matching product document in MongoDB.
- `src/routes/uploadRoutes.js`: Upload endpoints with `protect` middleware.
- `uploads/.gitkeep`: Empty tracked file to keep the upload destination folder in version control.

### ✏️ Files Modified
- `server.js`: Mounted `express.static()` to serve `/uploads` publicly and registered `/api/upload` router.
- `.gitignore`: Added `uploads/*` and `!uploads/.gitkeep` so user-uploaded binary images are not tracked in git.

---

## [v4.0.0] - Relational Data & MongoDB Aggregation Pipeline (`$lookup`, `$group`, `$unwind`)

### 🎯 Educational Goal
Learn how to model relational data in NoSQL databases using normalized references (`userId`, `productId`) and perform complex data queries and joins with the **MongoDB Aggregation Framework** instead of multiple sequential queries.

---

## [v3.0.0] - Authentication & Authorization (JWT + bcryptjs + RBAC)

### 🎯 Educational Goal
Learn how user authentication and security work under the hood without external auth frameworks. Students learn password hashing, token generation/verification, and route protection using Role-Based Access Control (RBAC).

---

## [v2.0.0] - Advanced Querying & Global Error Handling

### 🎯 Educational Goal
Eliminate repetitive `try...catch` code across controllers, implement a centralized error handling architecture, and introduce real-world database querying capabilities (pagination, text search, multi-field filtering, and sorting).

---

## [v1.0.0] - Initial Release: Native MongoDB Driver CRUD API

### 🎯 Educational Goal
Learn backend fundamentals with Node.js, Express.js, and the native official MongoDB driver (`mongodb`) without any ORM/ODM abstraction layer.
