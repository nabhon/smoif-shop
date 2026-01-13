"use client";

import React, { useEffect, useState, use } from "react";
import { fetchClient } from "@/lib/api";
import { Order } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchClient<Order>(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!order)
    return <div className="text-center p-8 text-red-600">Order not found</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-50 border-green-200";
      case "VERIFYING_SLIP":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-6 pt-12">
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <div className="mb-6">
          <span className="text-4xl">🎉</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-6">Order ID: #{order.id}</p>

        <div
          className={`inline-block px-4 py-2 rounded-full border font-semibold ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.replace("_", " ")}
        </div>

        <div className="mt-8 text-left space-y-2 bg-gray-50 p-4 rounded-md text-sm text-gray-700">
          <p>We have received your order details.</p>
          {order.status === "VERIFYING_SLIP" && (
            <p>
              <strong>Next Step:</strong> Our admin team will verify your
              payment slip shortly. You will receive an email confirmation once
              approved.
            </p>
          )}
          {order.status === "WAITING_FOR_PAYMENT" && (
            <p className="text-red-600">
              <strong>Note:</strong> Payment is pending. If you haven't paid
              yet, please complete the payment.
            </p>
          )}
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          {order.status === "WAITING_FOR_PAYMENT" && (
            <Link href={`/orders/${order.id}/pay`} className="ml-4">
              <Button>Pay Now</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
