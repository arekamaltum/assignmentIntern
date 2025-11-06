"use client"
import React from "react";

export default function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div className="cart-item">
      <div className="item-image">
      <img
  src={item.image}
  alt={item.name}
  onError={(e) => {
    e.target.src = "/placeholder.jpg";
  }}
/>
      </div>
      <div className="item-details">
        <h4>{item.name}</h4>
        <p className="item-price">${item.price.toFixed(2)}</p>
      </div>
      <div className="item-qty">
        <button onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}>+</button>
        <button onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}>-</button>
      </div>
      <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
      <button
        className="remove-btn"
        onClick={() => onRemove(item.product_id)}
        title="Remove item"
      >
        ×
      </button>
    </div>
  )
}
