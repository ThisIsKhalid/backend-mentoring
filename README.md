# Backend Mentoring & Teaching — Version 3 (`v3`)

> **v3 Milestone**: Authentication & Authorization (JWT, bcryptjs, Protected Routes & Role-Based Access Control).

---

## 🚀 What's New in `v3`?

Comparing to `v2`:
- 🔐 **User Registration & Login**: Direct MongoDB `users` collection operations.
- 🛡️ **Salted Password Hashing**: Passwords are never stored in plain text (hashed via `bcryptjs`).
- 🎟️ **JSON Web Tokens (JWT)**: Stateless token issuance and verification.
- 🛑 **Route Protection Middleware**: `protect` middleware ensures only logged-in users with a valid `Bearer <token>` can mutate products.
- 👑 **Role-Based Access Control (RBAC)**: `authorize('admin')` restricts sensitive actions (e.g. `DELETE /api/products/:id`) to administrators.

For full changes and diffs, see [CHANGELOG.md](./CHANGELOG.md).

---

## 📡 API Reference in `v3`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Body Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{"name":"John", "email":"john@example.com", "password":"password123", "role":"admin"}` |
| `POST` | `/api/auth/login` | Public | `{"email":"john@example.com", "password":"password123"}` |
| `GET` | `/api/auth/me` | Protected | None (Requires header: `Authorization: Bearer <TOKEN>`) |

### 2. Products (`/api/products`)
| Method | Endpoint | Access | Header |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | None |
| `GET` | `/api/products/:id` | Public | None |
| `POST` | `/api/products` | Protected | `Authorization: Bearer <TOKEN>` |
| `PUT` | `/api/products/:id` | Protected | `Authorization: Bearer <TOKEN>` |
| `DELETE` | `/api/products/:id` | Admin Only | `Authorization: Bearer <ADMIN_TOKEN>` |

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
