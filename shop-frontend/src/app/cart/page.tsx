"use client";

import React from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            className="flex flex-col sm:flex-row items-center justify-between border-b pb-6 last:border-0 last:pb-0"
          >
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xl">
                    📦
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}
                </p>
                <p className="text-indigo-600 font-medium">฿{item.price}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.variantId,
                      item.amount - 1
                    )
                  }
                  className="px-3 py-1 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-3 py-1 border-x min-w-[3ch] text-center">
                  {item.amount}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.variantId,
                      item.amount + 1
                    )
                  }
                  className="px-3 py-1 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.productId, item.variantId)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-6 rounded-lg">
        <div className="mb-4 sm:mb-0">
          <span className="text-lg text-gray-600">Total:</span>
          <span className="ml-2 text-2xl font-bold text-indigo-600">
            ฿{cartTotal}
          </span>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
          <Link href="/checkout">
            <Button size="lg">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
