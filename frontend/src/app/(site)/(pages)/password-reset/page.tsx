import PasswordReset from "@/components/Auth/PasswordReset";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Password Reset | NextCommerce Nextjs E-commerce template",
  description: "Request a password reset link for your account.",
};

const PasswordResetPage = () => {
  return (
    <main>
      <PasswordReset />
    </main>
  );
};

export default PasswordResetPage;
