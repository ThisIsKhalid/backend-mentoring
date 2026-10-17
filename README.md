# Backend Mentoring & Teaching — Version 2 (`v2`)

> **v2 Milestone**: Advanced Querying (Pagination, Search, Filter, Sort) + Global Error Handling Architecture.

---

## 🚀 What's New in `v2`?

Comparing to `v1`:
- 🚫 **No more repetitive `try...catch`**: Handled automatically via `asyncHandler`.
- ⚠️ **Centralized Error Handling**: Standardized error responses using custom `ApiError` class and global `errorHandler` middleware.
- 📄 **Pagination**: Efficient database-level pagination with `.skip()` and `.limit()` plus metadata (`totalItems`, `totalPages`, `hasNextPage`).
- 🔍 **Fuzzy Text Search**: Case-insensitive name search using MongoDB `$regex`.
- 🏷️ **Multi-Field Filtering**: Category matching and numerical range filters (`$gte`, `$lte`) for prices.
- 🔄 **Dynamic Sorting**: `.sort()` with `field:direction` syntax (e.g. `price:asc`, `price:desc`).

For a detailed file-by-file diff, see [CHANGELOG.md](./CHANGELOG.md).

---

## 🛠️ API Querying Examples in `v2`

| Query Goal | Example Request |
| :--- | :--- |
| **Search Products** | `GET /api/products?search=wireless` |
| **Filter by Category** | `GET /api/products?category=Electronics` |
| **Filter by Price Range** | `GET /api/products?minPrice=50&maxPrice=250` |
| **Combine Filters & Search** | `GET /api/products?category=Electronics&inStock=true&maxPrice=500` |
| **Sort by Cheapest** | `GET /api/products?sort=price:asc` |
| **Sort by Newest** | `GET /api/products?sort=createdAt:desc` |
| **Paginate (Page 2, 5 items)** | `GET /api/products?page=2&limit=5` |

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
