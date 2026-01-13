"use client";

import React, { useEffect, useState, use } from "react";
import { fetchClient } from "@/lib/api";
import { PaymentConfig, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Parallel fetch
        const [orderData, configData] = await Promise.all([
          fetchClient<Order>(`/orders/${id}`),
          fetchClient<PaymentConfig>("/payment-config"),
        ]);

        setOrder(orderData);
        setConfig(configData);
      } catch (err) {
        console.error("Failed to load payment data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("slip", file);

      // Use raw fetch for multipart/form-data to let browser handle boundary
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
        }/orders/${id}/pay`,
        {
          method: "POST",
          body: formData,
          // Do NOT set Content-Type header manually
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      // Success -> Redirect to status page
      router.push(`/orders/${id}`);
    } catch (err) {
      console.error("Upload Error", err);
      alert("Failed to upload slip. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!order || !config)
    return (
      <div className="text-center p-8 text-red-600">
        Order or Payment Config not found.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order #{order.id}
        </h1>
        <p className="text-gray-500">Total Amount</p>
        <p className="text-4xl font-bold text-indigo-600 mt-2">
          ฿{order.total_amount}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bank Transfer Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Bank Transfer
          </h2>
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {config.qr_image_url ? (
                <img
                  src={config.qr_image_url}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">QR Code</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Bank</p>
              <p className="font-semibold">{config.bank_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Name</p>
              <p className="font-semibold">{config.account_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="font-mono text-lg font-bold tracking-wider">
                {config.account_number}
              </p>
            </div>
          </div>
        </div>

        {/* Slip Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Upload Payment Slip
          </h2>

          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] ${
                preview ? "border-indigo-600" : "border-gray-300"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Slip Preview"
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>Click below to select image</p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            <Button
              fullWidth
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
