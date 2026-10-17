# Backend Mentoring & Teaching — Version 4 (`v4`)

> **v4 Milestone**: Relational Data & MongoDB Aggregation Pipeline (`$lookup`, `$unwind`, `$group`, `$project`).

---

## 🚀 What's New in `v4`?

Comparing to `v3`:
- 📦 **Relational Data Modeling**: Introduced normalized `orders` collection referencing both `users` (`userId`) and `products` (`items.productId`).
- 🔗 **NoSQL Joins (`$lookup`)**: Taught students how to join multiple collections dynamically in MongoDB.
- 💨 **Pipeline Stages (`$unwind` & `$project`)**: Flattens nested document arrays and excludes sensitive fields (e.g., password hashes) in join results.
- 📊 **Business Analytics (`$group` & `$sum` / `$avg`)**: Real-time sales calculations, total revenue, and average order values.

For a complete history of all versions, see [CHANGELOG.md](./CHANGELOG.md).

---

## 🧭 Branch & Curriculum Roadmap

| Branch | Milestone | Focus Area |
| :--- | :--- | :--- |
| **`v1`** | **Native Driver CRUD** | `MongoClient`, `insertOne`, `find().toArray()`, `findOne`, `updateOne`, `deleteOne` |
| **`v2`** | **Querying & Error Handling** | Pagination (`.skip`/`.limit`), `$regex` Search, `$gte`/`$lte` Filters, `ApiError`, `errorHandler` |
| **`v3`** | **Auth & RBAC** | `users` collection, `bcryptjs` password hashing, `jsonwebtoken` (JWT), `protect` & `authorize` |
| **`v4`** | **Relational Aggregations** | `orders` collection, `$lookup` joins, `$unwind`, `$group` analytics |

---

## 📡 API Reference in `v4`

### Orders Endpoints (`/api/orders`)
All order endpoints require `Authorization: Bearer <TOKEN>`.

| Method | Endpoint | Access | Body Payload / Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | `{"items": [{"productId":"...", "quantity":2}]}` — Place an order |
| `GET` | `/api/orders/my-orders` | Customer | View personal order history with joined product details (`$lookup`) |
| `GET` | `/api/orders` | Admin Only | View all orders system-wide with joined customer info (`$lookup` + `$unwind`) |
| `GET` | `/api/orders/stats` | Admin Only | Calculate revenue, total orders, and average order value (`$group`) |

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
