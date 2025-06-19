"use client";

import { useEffect, useState } from "react";
import ShopDetailsComponent from "@/components/ShopDetails";
import { getProductBySlug } from "@/lib/apiService";
import type { Product } from "@/types/product";
import type { PageProps } from "@/types/PageProps";

function fallbackSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductDetailsPage({ params }: PageProps<{ slug: string }>) {
  const { slug } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct(current: string, triedFallback = false) {
      try {
        const p = await getProductBySlug(current);
        setProduct(p);
        setError(null);
      } catch (err: any) {
        if (!triedFallback && err.status === 404) {
          const alt = fallbackSlug(current);
          if (alt !== current) {
            return fetchProduct(alt, true);
          }
        }
        console.error(`Failed to fetch product with slug "${current}":`, err);
        setError(err.data?.detail || err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct(slug);
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "20px" }}>
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "20px", color: "red" }}>
        <h1>Error Loading Product</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "20px" }}>
        <h1>Product Not Found</h1>
        <p>The product you are looking for does not exist.</p>
      </div>
    );
  }

  return <ShopDetailsComponent product={product} />;
}
