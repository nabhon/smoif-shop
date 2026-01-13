"use client";

import React, { useEffect, useState, use } from "react";
import { fetchClient } from "@/lib/api";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchClient<Product>(`/products/${id}`);
        setProduct(data);

        // Initialize options if variants exist
        if (data.variants && data.variants.length > 0) {
          // Extract all possible option keys (e.g., Color, Size)
          // This logic assumes all variants have the same keys, which is typical
          const firstVariant = data.variants[0];
          const keys = Object.keys(firstVariant.combination_json || {});
          /* 
                For a smoother UX, we could pre-select the first variant's options.
                const initialOptions: Record<string, string> = {};
                keys.forEach(key => {
                    initialOptions[key] = firstVariant.combination_json[key];
                });
                setSelectedOptions(initialOptions);
             */
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Determine available variants based on current selection
  // This helps finding the specific variant that matches ALL selected options
  useEffect(() => {
    if (!product || !product.variants) return;

    const match = product.variants.find((v) => {
      const vOptions = v.combination_json;
      // Check if every selected option matches this variant's option
      // And also ensure the variant has the same number of keys (exact match)
      return (
        Object.entries(selectedOptions).every(
          ([key, value]) => vOptions[key] === value
        ) &&
        Object.keys(selectedOptions).length === Object.keys(vOptions).length
      );
    });

    setSelectedVariant(match || null);
  }, [selectedOptions, product]);

  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      options: selectedVariant.combination_json,
      price: selectedVariant.price,
      amount: 1,
      maxStock: selectedVariant.stock_quantity,
      image: product.image_url,
    });

    // Optional: Show feedback or redirect
    alert("Added to cart!");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !product)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Product not found"}
      </div>
    );

  // Extract unique options for rendering UI
  // e.g., Color: [Red, Blue], Size: [S, M]
  const optionKeys =
    product.variants && product.variants.length > 0
      ? Object.keys(product.variants[0].combination_json)
      : [];

  // Helper to get available values for a specific option key
  const getValuesForKey = (key: string) => {
    const allValues =
      product.variants?.map((v) => v.combination_json[key]) || [];
    return Array.from(new Set(allValues));
  };

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.base_price;
  const isOutOfStock = selectedVariant
    ? selectedVariant.stock_quantity <= 0
    : false;
  const isSelectionComplete =
    product.variants && product.variants.length > 0
      ? optionKeys.every((k) => selectedOptions[k])
      : true; // No variants means selection is "complete" (base product only, if supported)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-400 text-6xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            "📦"
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              ฿{currentPrice}
            </p>
          </div>

          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          {/* Option Selectors */}
          {optionKeys.map((key) => (
            <div key={key}>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{key}</h3>
              <div className="flex flex-wrap gap-2">
                {getValuesForKey(key).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionSelect(key, value)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
                                    ${
                                      selectedOptions[key] === value
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }
                                `}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t font-semibold">
            {selectedVariant ? (
              <p className={isOutOfStock ? "text-red-600" : "text-green-600"}>
                {isOutOfStock
                  ? "Out of Stock"
                  : `In Stock: ${selectedVariant.stock_quantity}`}
              </p>
            ) : (
              optionKeys.length > 0 && (
                <p className="text-gray-500">
                  Please select options to see availability
                </p>
              )
            )}
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleAddToCart}
            disabled={!isSelectionComplete || !selectedVariant || isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
