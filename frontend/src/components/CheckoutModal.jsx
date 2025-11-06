"use client"

import { useState } from "react"
import React from "react";
export default function CheckoutModal({ isOpen, receipt, cart, total, onClose, onSubmit }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(name, email)
      setName("")
      setEmail("")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Receipt view
  if (receipt) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Confirmation</h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="receipt">
            <div className="receipt-section">
              <p>
                <strong>Order ID:</strong> {receipt.orderId}
              </p>
              <p>
                <strong>Date:</strong> {new Date(receipt.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="receipt-section">
              <h3>Items</h3>
              {receipt.items.map((item) => (
                <div key={item.productId} className="receipt-item">
                  <span>
                    {item.name} x {item.qty}
                  </span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-section">
              <div className="receipt-row">
                <span>Subtotal:</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-row">
                <span>Tax:</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              <div className="receipt-row total">
                <span>Total:</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>

            <p className="receipt-message">
              Thank you for your order! A confirmation email has been sent to {receipt.customerEmail}.
            </p>
          </div>

          <button className="close-modal-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  // Checkout form view
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="order-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Order"}
          </button>
        </form>
      </div>
    </div>
  )
}
