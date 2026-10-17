# Complete Guide: Teaching Express.js with Native MongoDB Driver (`mongodb`)

A complete, beginner-friendly curriculum and teaching guide for building backend APIs using **Node.js**, **Express.js**, and the **official native MongoDB Driver (`mongodb`)** without any ODM like Mongoose.

---

## 💡 Quick Teacher Talking Points: Native MongoDB vs Mongoose

When students ask *"Why use native `mongodb` instead of Mongoose?"*, explain:

| Feature | Native MongoDB Driver (`mongodb`) | Mongoose (ODM) |
| :--- | :--- | :--- |
| **What is it?** | Official low-level driver created directly by MongoDB | An abstraction layer (ODM) built on top of the native driver |
| **Learning Value** | **Teaches true database fundamentals**: Collections, BSON documents, direct cursors, and queries | Hides native database mechanics behind schemas and models |
| **Schema** | Schema-less (flexible, pure NoSQL) | Enforces strict schemas in JavaScript application layer |
| **Performance** | Faster with less memory overhead | Adds overhead from casting, middleware, and document wrapping |
| **ID Handling** | Explicit `new ObjectId(id)` (students learn how `_id` works) | Automatically casts strings to `ObjectId` behind the scenes |

> [!TIP]
> **Pedagogical Recommendation**: Teaching native `mongodb` first gives students a genuine understanding of how MongoDB works under the hood before they encounter any abstraction tools like Mongoose or Prisma.

---

## Table of Contents
1. [Prerequisites & Tools](#1-prerequisites--tools)
2. [Step 1: Project Initialization & Installation](#step-1-project-initialization--installation)
3. [Step 2: Recommended Project Structure](#step-2-recommended-project-structure)
4. [Step 3: Build the Minimal Express Server](#step-3-build-the-minimal-express-server)
5. [Step 4: Environment Variables (`.env`)](#step-4-environment-variables-env)
6. [Step 5: Connect Native MongoDB (`MongoClient`)](#step-5-connect-native-mongodb-mongoclient)
7. [Step 6: Understanding MongoDB Concepts (Database, Collection, ObjectId)](#step-6-understanding-mongodb-concepts)
8. [Step 7: Connect APIs One by One (Full CRUD with Native Driver)](#step-7-connect-apis-one-by-one-full-crud)
   - [7.1: Setup Middleware (`express.json()`)](#71-setup-middleware-expressjson)
   - [7.2: POST - Create Document (`insertOne`)](#72-post---create-document-insertone)
   - [7.3: GET - Read All Documents (`find().toArray()`)](#73-get---read-all-documents-findtoarray)
   - [7.4: GET - Read Single Document (`findOne` with `ObjectId`)](#74-get---read-single-document-findone-with-objectid)
   - [7.5: PUT / PATCH - Update Document (`updateOne` with `$set`)](#75-put--patch---update-document-updateone-with-set)
   - [7.6: DELETE - Delete Document (`deleteOne`)](#76-delete---delete-document-deleteone)
9. [Step 8: Clean Refactoring (MVC: Controller & Router)](#step-8-clean-refactoring-mvc-controller--router)
10. [Step 9: API Testing Reference (Postman / Thunder Client)](#step-9-api-testing-reference)
11. [Step 10: Common Student Mistakes & Fixes](#step-10-common-student-mistakes--fixes)

---

## 1. Prerequisites & Tools

Ensure students have installed:
1. **Node.js** (LTS version):
   ```bash
   node -v
   npm -v
   ```
2. **VS Code** (with Thunder Client or REST Client extension) or **Postman**
3. **MongoDB**:
   - **Cloud (Atlas)**: Free Cluster connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
   - **Local**: MongoDB Community Server + MongoDB Compass: `mongodb://127.0.0.1:27017`

---

## Step 1: Project Initialization & Installation

Teach students how to start the Node project with **only the official native MongoDB driver**:

```bash
# 1. Create project folder and open it
mkdir backend-teaching
cd backend-teaching

# 2. Initialize package.json
npm init -y

# 3. Install production dependencies (Express + Native MongoDB + dotenv + cors)
npm install express mongodb dotenv cors

# 4. Install dev dependency for auto-restart
npm install -D nodemon
```

### Configure `package.json`
Configure `"type": "module"` for modern ES import/export syntax and dev scripts:

```json
{
  "name": "backend-teaching",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "mongodb": "^6.9.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

---

## Step 2: Recommended Project Structure

Show students the clean MVC separation adapted for native MongoDB:

```text
backend-teaching/
├── src/
│   ├── config/
│   │   └── db.js            # MongoClient connection & getDB() helper
│   ├── controllers/
│   │   └── productController.js # CRUD business logic
│   ├── routes/
│   │   └── productRoutes.js # Express router endpoints
├── .env                     # Secrets & connection string
├── .gitignore               # Ignored files
├── package.json
└── server.js                # Server entry point
```

Create `.gitignore`:
```text
node_modules
.env
```

---

## Step 3: Build the Minimal Express Server

Demonstrate a simple working server first before introducing database logic.

Create `server.js`:
```javascript
import express from 'express';

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.status(200).send('API is running successfully!');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
```

Test it:
```bash
npm run dev
```

---

## Step 4: Environment Variables (`.env`)

Explain why connection strings must stay private.

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=shopDB
```
*(If using local MongoDB Compass, use `mongodb://127.0.0.1:27017`)*.

---

## Step 5: Connect Native MongoDB (`MongoClient`)

With the native driver, we create a single `MongoClient` instance and export a reusable database connection.

Create `src/config/db.js`:
```javascript
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    // Connect to specific database name from .env or default to shopDB
    db = client.db(process.env.DB_NAME || 'shopDB');
    console.log(`MongoDB Connected successfully to database: "${db.databaseName}"`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Helper function to access the database instance anywhere in controllers
export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized! Call connectDB first.');
  }
  return db;
};
```

---

## Step 6: Understanding MongoDB Concepts

Before coding APIs, explain these 3 fundamental concepts to students:

1. **Database**: A container for collections (e.g., `shopDB`).
2. **Collection**: Equivalent to a SQL table (e.g., `products`). Accessed via:
   ```javascript
   const productsCollection = getDB().collection('products');
   ```
3. **`_id` and `ObjectId`**: MongoDB stores unique identifiers as 12-byte BSON `ObjectId` objects, not plain strings. To query by ID:
   ```javascript
   import { ObjectId } from 'mongodb';
   const query = { _id: new ObjectId(idString) };
   ```

---

## Step 7: Connect APIs One by One (Full CRUD)

Teach each API method step-by-step.

### 7.1 Setup Middleware (`express.json()`)
Explain that Express cannot read `req.body` without body parser middleware:
```javascript
app.use(express.json());
```

---

### 7.2 POST - Create Document (`insertOne`)
- **Route**: `POST /api/products`
- **Native Method**: `collection.insertOne(doc)`
- **HTTP Code**: `201 Created`

**Logic**:
```javascript
import { getDB } from './src/config/db.js';

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;

    // Manual validation
    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required',
      });
    }

    const newProduct = {
      name,
      price: Number(price),
      category,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      createdAt: new Date(),
    };

    const collection = getDB().collection('products');
    const result = await collection.insertOne(newProduct);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newProduct,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

### 7.3 GET - Read All Documents (`find().toArray()`)
- **Route**: `GET /api/products`
- **Native Method**: `collection.find({}).toArray()`
- **HTTP Code**: `200 OK`

> [!NOTE]
> Explain that `find()` returns a **Cursor**. We call `.toArray()` to resolve all documents into a JavaScript array.

**Logic**:
```javascript
app.get('/api/products', async (req, res) => {
  try {
    const collection = getDB().collection('products');
    const products = await collection.find({}).toArray();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

### 7.4 GET - Read Single Document (`findOne` with `ObjectId`)
- **Route**: `GET /api/products/:id`
- **Native Method**: `collection.findOne({ _id: new ObjectId(id) })`
- **HTTP Code**: `200 OK` or `404 Not Found`

**Logic**:
```javascript
import { ObjectId } from 'mongodb';

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid 24-character hexadecimal string
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid MongoDB ID format' });
    }

    const collection = getDB().collection('products');
    const product = await collection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

### 7.5 PUT / PATCH - Update Document (`updateOne` with `$set`)
- **Route**: `PUT /api/products/:id`
- **Native Method**: `collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })`
- **HTTP Code**: `200 OK` or `404 Not Found`

> [!IMPORTANT]
> Emphasize MongoDB update operators like **`$set`**. Without `$set`, replacing a document in native MongoDB could wipe unspecified fields!

**Logic**:
```javascript
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid MongoDB ID format' });
    }

    const updateFields = {
      ...req.body,
      updatedAt: new Date(),
    };

    const collection = getDB().collection('products');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Retrieve the updated document
    const updatedProduct = await collection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

### 7.6 DELETE - Delete Document (`deleteOne`)
- **Route**: `DELETE /api/products/:id`
- **Native Method**: `collection.deleteOne({ _id: new ObjectId(id) })`
- **HTTP Code**: `200 OK` or `404 Not Found`

**Logic**:
```javascript
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid MongoDB ID format' });
    }

    const collection = getDB().collection('products');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## Step 8: Clean Refactoring (MVC: Controller & Router)

After students understand the inline routes, show them how professional code is organized into Controllers and Routers.

### 1. `src/controllers/productController.js`
```javascript
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const getCollection = () => getDB().collection('products');

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await getCollection().find({}).toArray();
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const product = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const newProduct = {
      name,
      price: Number(price),
      category,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      createdAt: new Date(),
    };
    const result = await getCollection().insertOne(newProduct);
    res.status(201).json({ success: true, data: { _id: result.insertedId, ...newProduct } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const result = await getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const updated = await getCollection().findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const result = await getCollection().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### 2. `src/routes/productRoutes.js`
```javascript
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
```

### 3. Final `server.js`
```javascript
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Native MongoDB Express API is active.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## Step 9: API Testing Reference

| Action | HTTP Method | Endpoint | Request Body | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| **Create Item** | `POST` | `http://localhost:5000/api/products` | `{"name":"Mechanical Keyboard", "price":79, "category":"Computers"}` | `201 Created` |
| **Get All Items** | `GET` | `http://localhost:5000/api/products` | None | `200 OK` |
| **Get Single Item** | `GET` | `http://localhost:5000/api/products/<OBJECT_ID>` | None | `200 OK` |
| **Update Item** | `PUT` | `http://localhost:5000/api/products/<OBJECT_ID>` | `{"price":69, "inStock":false}` | `200 OK` |
| **Delete Item** | `DELETE` | `http://localhost:5000/api/products/<OBJECT_ID>` | None | `200 OK` |

---

## Step 10: Common Student Mistakes & Fixes

1. **Forgetting `new ObjectId(id)` in queries:**
   - *Error*: Passing `{ _id: id }` as a plain string returns `null` because MongoDB stores `_id` as an `ObjectId`.
   - *Fix*: Always import `import { ObjectId } from 'mongodb'` and use `new ObjectId(id)`.

2. **Crashing the server with invalid IDs:**
   - *Error*: Passing `123` to `new ObjectId("123")` throws `BSONError: input must be a 24 character hex string`.
   - *Fix*: Check with `ObjectId.isValid(id)` before querying.

3. **Missing `.toArray()` on `collection.find()`:**
   - *Error*: Responding with `res.json(collection.find())` sends an empty or circular cursor object.
   - *Fix*: Call `await collection.find({}).toArray()`.

4. **Forgetting `$set` in `updateOne`:**
   - *Error*: Passing `{ name: 'New' }` instead of `{ $set: { name: 'New' } }` can cause unexpected MongoDB update errors or overwrite fields.
   - *Fix*: Always wrap update data inside `{ $set: ... }`.
