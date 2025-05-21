"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { requestPasswordReset } from "@/lib/apiService";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      const msg = "Email is required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      toast.success("If an account exists for this email, a reset link has been sent.");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to submit password reset request.");
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName={"Password Reset"} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-7">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Forgot your password?
              </h2>
              <p>Enter your email below and we\'ll send you a reset link.</p>
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="reset_email" className="block mb-2.5">Email Address</label>
                <input
                  type="email"
                  id="reset_email"
                  name="reset_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center mt-6">
              Remembered your password?
              <Link href="/signin" className="text-dark ease-out duration-200 hover:text-blue pl-2">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default PasswordReset;
