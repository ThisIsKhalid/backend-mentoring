# Changelog

All notable changes to the **Backend Mentoring & Teaching Project** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
