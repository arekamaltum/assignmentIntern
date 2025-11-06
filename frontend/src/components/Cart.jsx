"use client"
import React from "react";
import CartItem from "./CartItem"

export default function Cart({ cart, cartTotal, onRemove, onUpdateQty, onCheckout, onShopClick }) {
  const tax = cartTotal * 0.08
  const total = cartTotal * 1.08

  return (
    <div className="cart-section">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="shop-btn" onClick={onShopClick}>
          Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={onShopClick} className="start-shopping-btn">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <CartItem key={item.productId} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
            ))}
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
