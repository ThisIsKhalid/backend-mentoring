# Changelog

All notable changes to the **Backend Mentoring & Teaching Project** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v3.0.0] - Authentication & Authorization (JWT + bcryptjs + RBAC)

### 🎯 Educational Goal
Learn how user authentication and security work under the hood without external auth frameworks. Students learn password hashing, token generation/verification, and route protection using Role-Based Access Control (RBAC).

### 📦 New Dependencies
- `bcryptjs`: Secure salted password hashing.
- `jsonwebtoken`: Signing and verifying stateless JWTs.

### 📁 Files Added
- `src/controllers/authController.js`: Registration with unique email check, password hashing, login token issuing, and current user profile retrieval.
- `src/middleware/authMiddleware.js`:
  - `protect`: Extracts `Bearer <token>` header, verifies signature, loads `req.user` from native `users` collection without password.
  - `authorize(...roles)`: Role-Based Access Control (RBAC) guard.
- `src/routes/authRoutes.js`: Auth endpoints (`/register`, `/login`, `/me`).

### ✏️ Files Modified
- `src/routes/productRoutes.js`:
  - `POST /api/products` protected (requires valid login token).
  - `PUT /api/products/:id` protected (requires valid login token).
  - `DELETE /api/products/:id` restricted to `admin` role only.
- `server.js`: Mounted `/api/auth` router.
- `.env.example` & `.env`: Added `JWT_SECRET` and `JWT_EXPIRES_IN`.

### 🌐 New Endpoints
| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (body: `name`, `email`, `password`, optional `role`) |
| `POST` | `/api/auth/login` | Public | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get authenticated user profile (`Bearer <token>`) |

---

## [v2.0.0] - Advanced Querying & Global Error Handling

### 🎯 Educational Goal
Eliminate repetitive `try...catch` code across controllers, implement a centralized error handling architecture, and introduce real-world database querying capabilities (pagination, text search, multi-field filtering, and sorting).

### 📁 Files Added
- `src/utils/apiError.js`: Custom `ApiError` class extending `Error` with HTTP status code support.
- `src/utils/asyncHandler.js`: Higher-order function catching unhandled promises in async controllers and passing them to `next()`.
- `src/middleware/errorHandler.js`: Global error handler intercepting BSON format errors, malformed JSON, and operational errors.

### ✏️ Files Modified
- `src/controllers/productController.js`:
  - Wrapped all handler functions in `asyncHandler`.
  - Replaced inline `try...catch` and manual `res.status(500)` with `throw new ApiError(...)`.
  - Added **Pagination**: `.skip((page - 1) * limit).limit(limit)` and `countDocuments()`.
  - Added **Search**: `$regex` on product name (case-insensitive).
  - Added **Filtering**: `$gte` and `$lte` for price ranges, category exact match, and `inStock` boolean.
  - Added **Sorting**: Dynamic `.sort()` parsing `field:direction` (e.g., `price:asc`, `price:desc`).
- `server.js`:
  - Mounted `errorHandler` as the final middleware.
  - Updated 404 handler to trigger `next(new ApiError(404, ...))`.

### 🌐 New Query Parameters on `GET /api/products`
| Parameter | Description | Example |
| :--- | :--- | :--- |
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Number of items per page (default: 10, max: 100) | `?limit=5` |
| `search` | Case-insensitive keyword search on product name | `?search=keyboard` |
| `category` | Filter by category | `?category=Electronics` |
| `inStock` | Filter by stock availability (`true` / `false`) | `?inStock=true` |
| `minPrice` | Lower bound price filter (`$gte`) | `?minPrice=50` |
| `maxPrice` | Upper bound price filter (`$lte`) | `?maxPrice=300` |
| `sort` | Sort field and order (`field:asc` or `field:desc`) | `?sort=price:asc` |

---

## [v1.0.0] - Initial Release: Native MongoDB Driver CRUD API

### 🎯 Educational Goal
Learn backend fundamentals with Node.js, Express.js, and the native official MongoDB driver (`mongodb`) without any ORM/ODM abstraction layer.

### 📁 Files Added
- `server.js`: Minimal Express server with JSON parser and CORS.
- `src/config/db.js`: `MongoClient` connection with singleton `getDB()` helper.
- `src/controllers/productController.js`: CRUD endpoints using `insertOne`, `find().toArray()`, `findOne`, `updateOne` (`$set`), and `deleteOne`.
- `src/routes/productRoutes.js`: Express router endpoints for `/api/products`.
- `.env.example`, `.gitignore`, `package.json`, `README.md`, `steps.md`.
