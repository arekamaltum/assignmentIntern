// App.jsx
"use client"
import React, { useState, useEffect } from "react"
import Header from "./components/Header"
import ProductGrid from "./components/ProductGrid"
import Cart from "./components/Cart"
import CheckoutModal from "./components/CheckoutModal"
import "./App.css"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001"

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)
  const [activeTab, setActiveTab] = useState("shop")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  
  
  const [cartId, setCartId] = useState(() => {
    let id = localStorage.getItem("cartId")
    if (!id) {
      id = "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("cartId", id)
    }
    return id
  })

  useEffect(() => {
    if (showSuccessPopup && activeTab === "cart") {
      const timer = setTimeout(() => setShowSuccessPopup(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessPopup, activeTab])
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`${API_BASE}/api/products`)
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        setError("Failed to load products. Make sure backend is running.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Fetch cart
  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { "x-cart-id": cartId }
      })
      if (!res.ok) throw new Error("Failed to fetch cart")
      const data = await res.json()
      setCart(data.items || [])
      setCartTotal(data.total || 0)
      setItemCount(data.itemCount || 0)
    } catch (err) {
      console.error("Cart fetch error:", err)
    }
  }

  useEffect(() => { fetchCart() }, [cartId])

  // Add, remove, update cart
  const handleAddToCart = async (product) => {
    try {
      // Check if product already in cart
      const existingItem = cart.find((item) => item.productId === product.id);
  
      const qty = existingItem ? existingItem.qty + 1 : 1;
  
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cart-id": cartId },
        body: JSON.stringify({
          productId: product.id,
          qty, // send updated quantity
          price: product.price,
          name: product.name,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to add/update item");
  
      await fetchCart();
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };
  

  const handleRemoveFromCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
        method: "DELETE",
        headers: { "x-cart-id": cartId }
      })
      if (!res.ok) throw new Error("Failed to remove item")
      await fetchCart()
    } catch (err) {
      setError("Failed to remove item")
      console.error(err)
    }
  }

  const handleUpdateQty = async (productId, qty) => {
    if (qty <= 0) return handleRemoveFromCart(productId)
    try {
      const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-cart-id": cartId },
        body: JSON.stringify({ qty })
      })
      if (!res.ok) throw new Error("Failed to update item")
      await fetchCart()
    } catch (err) {
      setError("Failed to update item")
      console.error(err)
    }
  }

  // Checkout
  const handleCheckout = async (name, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cart, customerName: name, customerEmail: email })
      })
      if (!res.ok) throw new Error("Checkout failed")
      const data = await res.json()
      setReceipt(data)
      setCart([])
      setCartTotal(0)
      setItemCount(0)
      setIsCheckoutOpen(false)
      setActiveTab("shop")
      setShowSuccessPopup(true)
    } catch (err) {
      setError("Checkout failed: " + err.message)
      console.error(err)
    }
  }

  if (isLoading) return <div className="loading-container"><p>Loading...</p></div>

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} itemCount={itemCount} />

      {error && <div className="error-banner">{error}<button onClick={() => setError("")}>Dismiss</button></div>}

      <main className="main-content">
        {activeTab === "shop" ? (
          <div className="shop-section">
            <h2>Featured Products</h2>
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          </div>
        ) : (
          <Cart
            cart={cart}
            cartTotal={cartTotal}
            onRemove={handleRemoveFromCart}
            onUpdateQty={handleUpdateQty}
            onCheckout={() => setIsCheckoutOpen(true)}
            onShopClick={() => setActiveTab("shop")}
          />
        )}
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        receipt={receipt}
        cart={cart}
        total={cartTotal * 1.08}
        onClose={() => { setIsCheckoutOpen(false); setReceipt(null) }}
        onSubmit={handleCheckout}
      />
      {/* Success Popup - Top Notification (only on cart page) */}
  {/* Success Popup - Compact Version (only on cart page) */}
{activeTab === "cart" && showSuccessPopup && receipt && (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-xs">
    <div className="bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-3 flex flex-col items-center space-y-2 animate-slideDown">
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 rounded-full p-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-green-700 font-semibold text-sm sm:text-base">Checkout Successful!</h2>
      </div>
      <p className="text-gray-700 text-xs sm:text-sm text-center">
        Thank you for your purchase, <strong>{receipt.customerName}</strong>!
      </p>
      <div className="bg-gray-50 rounded-md p-2 w-full text-left text-xs sm:text-sm">
        <p><strong>Order ID:</strong> {receipt.orderId}</p>
        <p><strong>Email:</strong> {receipt.customerEmail}</p>
        <p className="font-semibold mt-1">Total: ${receipt.total.toFixed(2)}</p>
      </div>
      <button
        onClick={() => { setShowSuccessPopup(false); setReceipt(null) }}
        className="bg-green-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}


    </div>
  )
}
