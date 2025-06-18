// src/app/(site)/(pages)/shop-details/[slug]/page.tsx
import React from 'react';
// Page route parameters are passed via the `params` prop

import type { PageProps } from '@/types/PageProps';

type ProductDetailsPageProps = PageProps<{
  slug: string;
}>;

export default function TemporaryProductDetailsPage({ params }: ProductDetailsPageProps) {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontSize: '20px' }}>
      <h1>Shop Details Test Page</h1>
      <p>If you see this, the dynamic route is working!</p>
      <p>Requested Product Slug: <strong>{params.slug}</strong></p>
    </div>
  );
}
