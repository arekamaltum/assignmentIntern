const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "vibe_commerce.db")
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message)
  } else {
    console.log("Connected to SQLite database at:", dbPath)
  }
})

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON")

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if products table is empty and seed data
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (row.count === 0) {
        const mockProducts = [
          {
            name: "Premium Wireless Headphones",
            price: 199.99,
            description: "High-quality sound with noise cancellation",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
          },
          {
            name: "Mechanical Keyboard RGB",
            price: 149.99,
            description: "Gaming keyboard with RGB lighting",
            image: "https://images.unsplash.com/photo-1587829191301-c4b2b7fdac6c?w=400&h=300&fit=crop",
          },
          {
            name: "4K Webcam Pro",
            price: 129.99,
            description: "Crystal clear 4K video for streaming",
            image: "https://images.unsplash.com/photo-1598302257097-c6c2e67c6c92?w=400&h=300&fit=crop",
          },
          {
            name: "Ergonomic Mouse",
            price: 79.99,
            description: "Comfortable design for long sessions",
            image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
          },
          {
            name: "USB-C Hub Multi-port",
            price: 59.99,
            description: "7-in-1 USB-C hub for connectivity",
            image: "https://images.unsplash.com/photo-1609291923528-fb8e3dd7c28e?w=400&h=300&fit=crop",
          },
          {
            name: "Monitor Light Bar",
            price: 89.99,
            description: "Smart lighting for reduced eye strain",
            image: "https://images.unsplash.com/photo-1599566150163-29194019aaca?w=400&h=300&fit=crop",
          },
          {
            name: "Portable SSD 1TB",
            price: 119.99,
            description: "Fast external storage solution",
            image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop",
          },
          {
            name: "Smartwatch Pro",
            price: 299.99,
            description: "Advanced fitness and health tracking",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
          },
        ]

        const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)")
        mockProducts.forEach((product) => {
          stmt.run([product.name, product.price, product.description, product.image])
        })
        stmt.finalize()
        console.log("Database seeded with mock products")
      }
    })

    // Carts table
    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Cart items table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Order items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)
  })
}

initializeDatabase()

module.exports = db
