"use client";

import React, { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchClient } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    address: "", // Optional per instruction but good to have
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare payload
      const orderData = {
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.amount,
          price_at_purchase: item.price,
        })),
      };

      // POST to API
      // Response expected: { id: 123, ... }
      const result = await fetchClient<{ id: number }>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      // Clear cart
      clearCart();

      // Redirect to Payment Page
      router.push(`/orders/${result.id}/pay`);
    } catch (err: any) {
      console.error("Checkout failed", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-md">
        <h2 className="font-semibold text-gray-700 mb-2">Order Summary</h2>
        <p className="text-sm text-gray-600">{items.length} items</p>
        <p className="text-xl font-bold text-indigo-600 mt-1">
          Total: ฿{cartTotal}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          name="guest_name"
          required
          value={form.guest_name}
          onChange={handleChange}
          placeholder="John Doe"
        />

        <Input
          label="Email Address"
          name="guest_email"
          type="email"
          required
          value={form.guest_email}
          onChange={handleChange}
          placeholder="john@example.com"
        />

        <Input
          label="Shipping Address"
          name="address"
          required
          value={form.address}
          onChange={handleChange}
          placeholder="123 Main St, Bangkok..."
        />

        <div className="pt-4">
          <Button type="submit" fullWidth disabled={isSubmitting} size="lg">
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
