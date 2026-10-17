import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'shopDB';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'admin',
    createdAt: new Date(),
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    createdAt: new Date(),
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    createdAt: new Date(),
  },
];

const sampleProducts = [
  {
    name: 'Mechanical Gaming Keyboard',
    price: 89.99,
    category: 'Electronics',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Wireless Ergonomic Mouse',
    price: 49.99,
    category: 'Electronics',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: '27-inch 4K IPS Monitor',
    price: 329.99,
    category: 'Electronics',
    inStock: false,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Noise-Cancelling Over-Ear Headphones',
    price: 199.99,
    category: 'Audio',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Portable Bluetooth Speaker',
    price: 59.99,
    category: 'Audio',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Adjustable Standing Desk',
    price: 399.00,
    category: 'Furniture',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    price: 249.50,
    category: 'Furniture',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'USB-C Multiport Docking Station',
    price: 79.99,
    category: 'Accessories',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: 'Aluminum Laptop Riser Stand',
    price: 34.99,
    category: 'Accessories',
    inStock: false,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    name: '1080p Full HD Webcam with Privacy Shutter',
    price: 64.99,
    category: 'Electronics',
    inStock: true,
    imageUrl: '',
    createdAt: new Date(),
  },
];

const client = new MongoClient(uri);

const importData = async () => {
  try {
    await client.connect();
    const db = client.db(dbName);

    console.log(`[Seeder] Connected to database: "${db.databaseName}"`);

    // Clear existing collections
    await db.collection('users').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('orders').deleteMany({});
    console.log('[Seeder] Cleared previous users, products, and orders collections.');

    // Hash passwords before inserting users
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    // Insert Users
    const userResult = await db.collection('users').insertMany(hashedUsers);
    console.log(`[Seeder] Successfully imported ${userResult.insertedCount} users:`);
    console.log('   - Admin:    admin@example.com / adminpassword123');
    console.log('   - Customer: john@example.com  / password123');
    console.log('   - Customer: jane@example.com  / password123');

    // Insert Products
    const productResult = await db.collection('products').insertMany(sampleProducts);
    console.log(`[Seeder] Successfully imported ${productResult.insertedCount} sample products.`);

    console.log('[Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  } finally {
    await client.close();
  }
};

const destroyData = async () => {
  try {
    await client.connect();
    const db = client.db(dbName);

    await db.collection('users').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('orders').deleteMany({});

    console.log('[Seeder] All collections (users, products, orders) have been emptied!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  } finally {
    await client.close();
  }
};

// Check CLI arguments: -d or --destroy
if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
