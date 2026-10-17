# Backend Mentoring & Teaching — Version 6 (`v6`)

> **v6 Milestone**: Production Security Hardening & Rate Limiting (`helmet`, `express-rate-limit`, `express-mongo-sanitize`, body size limits, CORS restrictions).

---

## 🚀 What's New in `v6`?

Comparing to `v5`:
- 🛡️ **HTTP Headers Security (`helmet`)**: Hardens app against XSS, clickjacking, MIME-sniffing, and cross-site leaks.
- ⏱️ **Rate Limiting (`express-rate-limit`)**:
  - Global limiter: 100 requests per 15 minutes per IP.
  - Auth limiter: 10 login/register attempts per 15 minutes per IP (defeats brute-force password attacks).
- 💉 **NoSQL Injection Defense (`express-mongo-sanitize`)**: Removes malicious keys like `{"$gt": ""}` from request bodies and query strings.
- 📦 **Payload Size Limits**: Capped JSON and URL-encoded bodies to `10kb` to thwart body-flooding memory exhaustion.
- 🌐 **Controlled CORS**: Environment variable `CORS_ORIGIN` allows restricting cross-origin requests to trusted domains in production.

For full version history and diffs, see [CHANGELOG.md](./CHANGELOG.md).

---

## 🧭 Complete Curriculum Roadmap (v1 to v6)

| Version | Milestone | Topics Covered |
| :--- | :--- | :--- |
| **[`v1`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v1)** | **Native MongoDB CRUD** | `MongoClient`, `insertOne`, `find().toArray()`, `findOne`, `updateOne`, `deleteOne`, `ObjectId` validation |
| **[`v2`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v2)** | **Querying & Error Handling** | Database pagination (`.skip`/`.limit`), `$regex` text search, range filtering (`$gte`/`$lte`), sorting, `ApiError`, `errorHandler` |
| **[`v3`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v3)** | **Auth & RBAC** | `users` collection, `bcryptjs` password hashing, `jsonwebtoken` (JWT), `protect` & `authorize('admin')` |
| **[`v4`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v4)** | **Relational Aggregations** | `orders` collection, `$lookup` NoSQL joins, `$unwind`, business sales analytics with `$group` |
| **[`v5`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v5)** | **File Uploads** | `multer` multipart handling, image validation, disk storage, MongoDB document linking, `express.static()` |
| **[`v6`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v6)** | **Production Security** | `helmet`, `express-rate-limit`, `express-mongo-sanitize`, body size caps, controlled CORS |

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
Server runs at `http://localhost:5000`.
