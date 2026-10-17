# Backend Mentoring & Teaching — Version 1 (`v1`)

> **v1 Milestone**: Express.js REST API with the official **Native MongoDB Driver (`mongodb`)** (No Mongoose).

## 🚀 Features in v1
- **Modern ES Modules** (`import` / `export`)
- **Native MongoDB Driver (`mongodb`)** via `MongoClient` connection pooling and `getDB()` accessor
- **Complete CRUD Operations**:
  - `GET /api/products` — Retrieve all documents using `.find({}).toArray()`
  - `GET /api/products/:id` — Retrieve single document with `new ObjectId(id)`
  - `POST /api/products` — Create document with `insertOne()`
  - `PUT /api/products/:id` — Update document with `updateOne()` using `$set`
  - `DELETE /api/products/:id` — Delete document with `deleteOne()`
- **Input & ID Validation**: `ObjectId.isValid(id)`
- **MVC Architecture**: `src/config/`, `src/controllers/`, `src/routes/`

---

## 🛠️ Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MongoDB instance is running (locally or MongoDB Atlas connection string).

### 3. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`.

---

## 📖 Teaching Guide
See [steps.md](./steps.md) for the complete pedagogical breakdown and teaching notes.
