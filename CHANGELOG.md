# Changelog

All notable changes to the **Backend Mentoring & Teaching Project** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v4.0.0] - Relational Data & MongoDB Aggregation Pipeline (`$lookup`, `$group`, `$unwind`)

### 🎯 Educational Goal
Learn how to model relational data in NoSQL databases using normalized references (`userId`, `productId`) and perform complex data queries and joins with the **MongoDB Aggregation Framework** instead of multiple sequential queries.

### 📁 Files Added
- `src/controllers/orderController.js`:
  - `createOrder`: Validates product IDs and quantities, verifies products exist, computes totals, and writes an order referencing `userId`.
  - `getMyOrders`: Uses `$match` and `$lookup` to join the `products` collection, populating live product details.
  - `getAllOrders`: Multi-stage pipeline using `$lookup`, `$unwind`, and `$project` to join `users` (excluding sensitive password hash) and return complete order records.
  - `getOrderStats`: Business analytics using `$group` to aggregate `totalRevenue`, `totalOrders`, and `avgOrderValue` by order status.
- `src/routes/orderRoutes.js`: Order endpoints with customer and admin access controls.

### ✏️ Files Modified
- `server.js`: Mounted `/api/orders` router.

### 🌐 New Endpoints
| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Protected | Place a new order with multiple items: `{"items": [{"productId":"...", "quantity":2}]}` |
| `GET` | `/api/orders/my-orders` | Protected | View user's past orders with joined product details (`$lookup`) |
| `GET` | `/api/orders` | Admin Only | View all system orders with customer details (`$lookup` + `$unwind`) |
| `GET` | `/api/orders/stats` | Admin Only | View analytics, revenue, and average order value (`$group`) |

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
