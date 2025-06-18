// src/app/(site)/(pages)/shop-details/[slug]/page.tsx
import React from 'react';
import ShopDetailsComponent from '@/components/ShopDetails'; // Assuming your main component is named ShopDetails
import { getProductBySlug } from '@/lib/apiService';
import { Product } from '@/types/product';
import type { Metadata, ResolvingMetadata, PageProps } from 'next';
import APITestComponent from '@/components/Common/APITestComponent'; // For easy debugging

type ProductDetailsPageProps = PageProps<{
  slug: string;
}>;

// Function to generate metadata dynamically
export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }
    return {
      title: `${product.name || 'Product Details'} | Celtrix Wireless Ltd`,
      description: product.description?.substring(0, 160) || `Details for ${product.name}`,
      openGraph: {
        title: product.name || 'Product Details',
        description: product.description?.substring(0, 160) || 'Check out this product.',
        images: product.cover_image_url ? [product.cover_image_url] : ((product.imgs?.previews && product.imgs.previews.length > 0) ? [product.imgs.previews[0]] : []),
      },
    };
  } catch (error) {
    console.error(`Error fetching metadata for product slug ${slug}:`, error);
    return {
      title: 'Error Fetching Product',
      description: 'Could not load product details at this time.',
    };
  }
}


// This is a React Server Component (RSC) by default in Next.js App Router
export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const slug = params.slug;
  let product: Product | null = null;
  let error: string | null = null;

  try {
    product = await getProductBySlug(slug);
  } catch (err: any) {
    console.error(`Failed to fetch product with slug "${slug}":`, err);
    error = err.data?.detail || err.message || "Failed to load product details. Please try again later.";
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontSize: '20px', color: 'red' }}>
        <h1>Error Loading Product</h1>
        <p>{error}</p>
        {/* You might want to add a link back to the shop or homepage here */}
        {/* <APITestComponent /> */} {/* For debugging API connectivity from server-side */}
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontSize: '20px' }}>
        <h1>Product Not Found</h1>
        <p>The product you are looking for (slug: <strong>{slug}</strong>) does not exist or could not be loaded.</p>
        {/* <APITestComponent /> */} {/* For debugging API connectivity from server-side */}
      </div>
    );
  }

  // If product is found, pass it to the client component
  return <ShopDetailsComponent product={product} />;
}
