"use client"
import React from "react";
export default function Header({ activeTab, setActiveTab, itemCount }) {
  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>Ecommerce Cart</h1>
          <p>Your favorite tech store</p>
        </div>
        <button className={`cart-btn ${activeTab === "cart" ? "active" : ""}`} onClick={() => setActiveTab("cart")}>
          Cart
          {itemCount > 0 && <span className="badge">{itemCount}</span>}
        </button>
      </div>
    </header>
  )
}
