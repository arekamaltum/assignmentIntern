import ProductCard from "./ProductCard"
import React from "react";
export default function ProductGrid({ products, onAddToCart }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
