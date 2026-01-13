import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
        {/* Placeholder for image */}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-indigo-600 font-bold">
          Starts at ฿{product.base_price}
        </p>
        <div className="mt-4">
          <Link href={`/products/${product.id}`} className="w-full">
            <Button fullWidth variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
