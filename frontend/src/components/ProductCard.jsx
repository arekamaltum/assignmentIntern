"use client"
import React from "react";
import { useState } from "react"

export default function ProductCard({ product, onAddToCart }) {
  const [qty, setQty] = useState(1)

  const handleAdd = () => {
    onAddToCart(product, qty)
    setQty(1)
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || "/placeholder.jpg"} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <p className="price">${product.price.toFixed(2)}</p>
        <div className="add-to-cart">
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="qty-input"
          />
          <button onClick={handleAdd} className="add-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
