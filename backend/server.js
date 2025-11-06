const express = require("express")
const cors = require("cors")
const db = require("./db")

const app = express()


// Middleware
app.use(cors({
  origin: "http://localhost:5173", // your React frontend URL
  credentials: true, // allows cookies or headers like x-cart-id
}));
app.use(express.json())

// Helper function to generate unique cart ID
function generateCartId() {
  return "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

// Helper function to get cart items with totals
function getCartItems(cartId, callback) {
  db.all("SELECT * FROM cart_items WHERE cart_id = ?", [cartId], (err, items) => {
    if (err) {
      callback(err, null)
      return
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    callback(null, { items, total, itemCount })
  })
}
app.get("/", (req, res) => {
  res.send("✅ Vibe Commerce API is running");
});
// GET /api/products - Get all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

// POST /api/cart - Add item to cart
// POST /api/cart - Add or update item in cart
app.post("/api/cart", async (req, res) => {
  try {
    const { productId, qty, price, name } = req.body;
    const cartId =
      req.headers["x-cart-id"] ||
      `cart_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    console.log("🟢 Incoming Add to Cart Request:", req.body);

    // Ensure table exists
    await db.run(
      `CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id TEXT,
        product_id INTEGER,
        name TEXT,
        price REAL,
        quantity INTEGER
      )`
    );

    // Check if item already exists in this cart
    db.get(
      `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId],
      async (err, row) => {
        if (err) {
          console.error("❌ Cart lookup error:", err.message);
          return res.status(500).json({ error: "Failed to add item" });
        }

        if (row) {
          // Item exists → update quantity
          const newQty = row.quantity + qty;
          await db.run(
            `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
            [newQty, cartId, productId]
          );
          res.json({ message: "Cart updated", cartId, quantity: newQty });
        } else {
          // Item doesn't exist → insert new
          await db.run(
            `INSERT INTO cart_items (cart_id, product_id, name, price, quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [cartId, productId, name, price, qty]
          );
          res.json({ message: "Item added to cart", cartId, quantity: qty });
        }
      }
    );
  } catch (err) {
    console.error("❌ Add to Cart Error:", err.message);
    res.status(500).json({ error: "Failed to add item" });
  }
});






// GET /api/cart - Get cart contents
app.get("/api/cart", (req, res) => {
  try {
    const cartId = req.headers["x-cart-id"]

    if (!cartId) {
      return res.json({ items: [], total: 0, itemCount: 0 })
    }

    getCartItems(cartId, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json(data)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/cart/:id - Remove item from cart
app.delete("/api/cart/:id", (req, res) => {
  try {
    const cartId = req.headers["x-cart-id"]
    const productId = Number.parseInt(req.params.id)

    if (!cartId) {
      return res.status(404).json({ error: "Cart not found" })
    }

    db.run("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      // Get remaining items count
      db.get("SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?", [cartId], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message })
        }
        res.json({ message: "Item removed", remaining: row.count })
      })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/cart/:id - Update item quantity
app.patch("/api/cart/:id", (req, res) => {
  try {
    const cartId = req.headers["x-cart-id"]
    const productId = Number.parseInt(req.params.id)
    const { qty } = req.body

    if (!qty || qty < 1) {
      return res.status(400).json({ error: "Invalid quantity" })
    }

    if (!cartId) {
      return res.status(404).json({ error: "Cart not found" })
    }

    db.run(
      "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
      [qty, cartId, productId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message })
        }

        db.get("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId], (err, item) => {
          if (err) {
            return res.status(500).json({ error: err.message })
          }
          res.json({ message: "Quantity updated", item })
        })
      },
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/checkout - Process checkout
app.post("/api/checkout", (req, res) => {
  try {
    const { cartItems, customerName, customerEmail } = req.body;

    if (!customerName || !customerEmail || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const orderId = "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Insert main order record
    db.run(
      "INSERT INTO orders (id, customer_name, customer_email, subtotal, tax, total) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, customerName, customerEmail, subtotal, tax, total],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Prepare inserting order items
        const stmt = db.prepare(
          "INSERT INTO order_items (order_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)"
        );

        cartItems.forEach((item) => {
          const productId = item.productId || item.id; // ✅ ensures value
          stmt.run([orderId, productId, item.quantity, item.price, item.name], (err) => {
            if (err) console.error("❌ Order item insert failed:", err.message);
          });
        });

        // After finalizing order items
stmt.finalize(async (err) => {
  if (err) return res.status(500).json({ error: err.message });

  console.log(`✅ Checkout success for ${customerName} (${orderId})`);

  // ✅ Clear cart_items for this cart
  if (req.headers["x-cart-id"]) {
    const cartId = req.headers["x-cart-id"];
    await db.run("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    console.log(`🗑️ Cleared cart for ${cartId}`);
  }

  res.json({
    orderId,
    customerName,
    customerEmail,
    subtotal,
    tax,
    total,
  });
});

      }
    );
  } catch (error) {
    console.error("❌ Checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
});



// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

// Start server
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Vibe Commerce API running on port ${PORT}`)
  console.log(`Frontend should connect to http://localhost:${PORT}`)
  console.log(`SQLite database at: backend/vibe_commerce.db`)
})
