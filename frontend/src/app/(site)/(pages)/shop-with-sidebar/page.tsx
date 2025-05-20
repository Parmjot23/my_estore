// frontend/src/app/(site)/(pages)/shop-with-sidebar/page.tsx
import ShopWithSidebarComponent from "@/components/ShopWithSidebar"; // This should be the Suspense-wrapped one
import { Metadata } from "next";
import { Suspense } from 'react';

export const metadata: Metadata = { /* ... */ };

export default function ShopWithSidebarPage() {
  return (
    <Suspense fallback={<div>Loading Shop...</div>}>
      <ShopWithSidebarComponent />
    </Suspense>
  );
}