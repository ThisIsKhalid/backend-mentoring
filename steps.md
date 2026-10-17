# Master Backend Teaching Curriculum: Express.js & Native MongoDB Driver

A progressive, end-to-end curriculum for mentoring students in backend development from pure fundamentals to production-grade architecture. Built using **Node.js**, **Express.js**, and the official **Native MongoDB Driver (`mongodb`)** (No Mongoose).

---

## 🧭 Curriculum Milestone Overview (v1 to v6)

| Milestone | Branch | Core Teaching Objectives |
| :--- | :--- | :--- |
| **v1** | [`v1`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v1) | **Native MongoDB CRUD**: `MongoClient`, `insertOne`, `find().toArray()`, `findOne`, `updateOne($set)`, `deleteOne`, `ObjectId` format validation. |
| **v2** | [`v2`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v2) | **Querying & Error Handling**: Pagination (`.skip()`, `.limit()`), text search (`$regex`), range filters (`$gte`/`$lte`), `.sort()`, `asyncHandler`, custom `ApiError`, centralized `errorHandler`. |
| **v3** | [`v3`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v3) | **Authentication & RBAC**: `users` collection, salted password hashing (`bcryptjs`), JWT generation/verification (`jsonwebtoken`), `protect` middleware, admin role guards. |
| **v4** | [`v4`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v4) | **Relational Aggregations**: Normalized `orders` collection, NoSQL joins via `$lookup`, array flattening with `$unwind`, business revenue metrics with `$group` & `$sum`/`$avg`. |
| **v5** | [`v5`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v5) | **File Uploads**: `multipart/form-data` with `multer`, disk storage, filetype/size validation, updating document image URLs, static file serving (`express.static`). |
| **v6** | [`v6`](https://github.com/ThisIsKhalid/backend-mentoring/tree/v6) | **Production Security**: HTTP headers (`helmet`), rate limiting (`express-rate-limit`), NoSQL injection defense (`express-mongo-sanitize`), request size limits, CORS restrictions. |

---

## ⚡ Classroom Quick Start & Database Seeder

To avoid students having an empty database when testing queries, pagination, or logins, use the built-in seeder:

```bash
# 1. Populate sample users and 10 products
npm run seed

# 2. Clear all collections
npm run seed:destroy
```

### Pre-seeded Credentials:
- **Admin**: `admin@example.com` / `adminpassword123`
- **Customer**: `john@example.com` / `password123`
- **Customer**: `jane@example.com` / `password123`

---

## 📚 Milestone Lecture Notes & Classroom Walkthrough

---

### Milestone 1: Native MongoDB Driver CRUD (`v1`)
**Goal:** Strip away Mongoose abstraction so students understand what databases, collections, BSON documents, cursors, and ObjectIds actually are.

1. **Database Connection (`MongoClient`)**:
   - Connection string anatomy: `mongodb://<host>:<port>/<dbName>`.
   - Exporting a reusable singleton connection function `getDB()`.
2. **The 5 CRUD Methods**:
   - `collection.insertOne(doc)`: Returns `{ insertedId }`.
   - `collection.find({}).toArray()`: Why `.toArray()` is required (resolving a stream cursor into a memory array).
   - `collection.findOne({ _id: new ObjectId(id) })`: Why strings must be converted to `ObjectId`.
   - `collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields })`: Why `$set` is mandatory to avoid wiping unspecified fields.
   - `collection.deleteOne({ _id: new ObjectId(id) })`.
3. **Student Pitfalls**:
   - Forgetting `new ObjectId(id)` resulting in `null` responses.
   - Passing an invalid 3-character string to `new ObjectId()` causing server crashes (solve with `ObjectId.isValid(id)`).

---

### Milestone 2: Advanced Querying & Centralized Error Handling (`v2`)
**Goal:** Transform basic CRUD into a real-world API that can handle thousands of records cleanly without repetitive `try...catch`.

1. **Async Error Architecture**:
   - `asyncHandler`: Wraps async controllers in `Promise.resolve().catch(next)` to eliminate repetitive `try...catch`.
   - Custom `ApiError`: Extends JavaScript's `Error` with `statusCode` (e.g. `400`, `404`).
   - Global `errorHandler`: Express 4-argument middleware `(err, req, res, next)` returning standardized JSON errors.
2. **Database Querying**:
   - **Pagination**: Calculate `skip = (page - 1) * limit` and use `.skip(skip).limit(limit)`. Use `collection.countDocuments(filter)` to calculate `totalPages`.
   - **Text Search**: `filter.name = { $regex: search, $options: 'i' }`.
   - **Range Filters**: `filter.price = { $gte: minPrice, $lte: maxPrice }`.
   - **Sorting**: Parse `sort=price:asc` into `{ price: 1 }` or `sort=createdAt:desc` into `{ createdAt: -1 }`.

---

### Milestone 3: Authentication & Authorization (`v3`)
**Goal:** Implement full identity management and access control from scratch.

1. **Password Hashing (`bcryptjs`)**:
   - Why plain text passwords are a catastrophic liability.
   - Salt generation and one-way hashing with `bcrypt.hash(password, 10)`.
   - Verification with `bcrypt.compare(candidatePassword, storedHash)`.
2. **JSON Web Tokens (`jsonwebtoken`)**:
   - Structure of JWT: `Header.Payload.Signature`.
   - Stateless authentication: The server does not store active session IDs in RAM.
   - Token creation: `jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })`.
3. **Auth Middlewares**:
   - `protect`: Extracts `Bearer <token>` from `req.headers.authorization`, verifies signature, fetches user document without password, and assigns to `req.user`.
   - `authorize(...roles)`: Role-Based Access Control checking `req.user.role`.
   - Securing routes: `POST /api/products` (authenticated), `DELETE /api/products/:id` (admin only).

---

### Milestone 4: Relational Data & Aggregation Pipeline (`v4`)
**Goal:** Dispel the myth that "NoSQL cannot do relational data" by teaching normalized document references and the MongoDB Aggregation Pipeline.

1. **Data Modeling**:
   - Normalizing an `orders` collection referencing `userId: ObjectId` and `items: [{ productId: ObjectId, quantity, price }]`.
2. **The Aggregation Pipeline**:
   - Analogy: An assembly line where documents pass through sequential transformation stages.
   - Stage 1: `$match` (filters documents like a `WHERE` clause).
   - Stage 2: `$lookup` (performs a NoSQL `JOIN` with another collection).
     ```javascript
     {
       $lookup: {
         from: 'products',
         localField: 'items.productId',
         foreignField: '_id',
         as: 'productDetails'
       }
     }
     ```
   - Stage 3: `$unwind` (flattens joined array elements into distinct objects).
   - Stage 4: `$project` (excludes sensitive fields like customer password hashes).
   - Stage 5: `$group` with `$sum` & `$avg` to calculate business revenue metrics.

---

### Milestone 5: File Uploads & Media Management (`v5`)
**Goal:** Teach handling binary files, form-data, storage strategies, and serving static files.

1. **Multipart Form Data (`multer`)**:
   - Why `express.json()` cannot parse binary files.
   - Storage configuration: `multer.diskStorage()` with unique timestamp naming.
2. **File Validation**:
   - Whitelisting extensions and MIME types (`jpeg`, `jpg`, `png`, `webp`).
   - Restricting max upload size (e.g. 5MB) to avoid server memory exhaustion.
3. **Database Integration**:
   - Storing the relative URL path (`/uploads/filename.jpg`) in the MongoDB product document.
4. **Static File Serving**:
   - `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`.
   - Git hygiene: Adding `uploads/*` and `!uploads/.gitkeep` to `.gitignore`.

---

### Milestone 6: Production Security Hardening & Rate Limiting (`v6`)
**Goal:** Prepare students for real-world deployment by mitigating top web application vulnerabilities.

1. **Security Headers (`helmet`)**:
   - Hardening against XSS, clickjacking, MIME sniffing, and cross-site leaks.
   - Configuring `crossOriginResourcePolicy: { policy: 'cross-origin' }` so frontends can load uploaded images.
2. **Rate Limiting (`express-rate-limit`)**:
   - Global rate limiter (100 reqs / 15 mins) preventing DDoS flooding.
   - Strict auth rate limiter (10 attempts / 15 mins) on `/api/auth/login` blocking brute-force credential stuffing.
3. **NoSQL Query Injection Prevention (`express-mongo-sanitize`)**:
   - How attackers send `{"email": {"$gt": ""}}` to bypass authentication.
   - Sanitizing inputs by stripping `$` and `.` characters from incoming request bodies and query parameters.
4. **Body Size Limits & CORS**:
   - Capping JSON bodies to `10kb` to thwart body-flooding memory crashes.
   - Restricting `CORS_ORIGIN` to authorized client domains.

---

## 🗂️ How Students Can Switch & Compare Versions

```bash
# View any milestone locally:
git checkout v1  # Milestone 1: Pure CRUD
git checkout v2  # Milestone 2: Querying & Error handling
git checkout v3  # Milestone 3: Auth & RBAC
git checkout v4  # Milestone 4: Relational Aggregations
git checkout v5  # Milestone 5: File Uploads
git checkout v6  # Milestone 6: Production Security

# See differences between milestones:
git diff v1..v2 --stat
git diff v2..v3 --stat
```
