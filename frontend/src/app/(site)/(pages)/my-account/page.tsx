import AccountDashboard from "@/components/AccountDashboard";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
  // other metadata
};

const MyAccountPage = () => {
  return (
    <main>
      <AccountDashboard />
    </main>
  );
};

export default MyAccountPage;
