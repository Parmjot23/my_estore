// src/components/Auth/Signin/index.tsx
"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getUserDetails } from "@/lib/apiService";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/redux/store";
import { setAuthState } from "@/redux/features/auth-slice";
import { AuthTokens } from "@/types/user";

const Signin = () => {
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!emailInput.trim()) {
      const msg = "Email (as username) is required.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      const msg = "Password is required.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const tokens: AuthTokens = await loginUser({ username: emailInput, password: password });

      if (!tokens || !tokens.access) {
        // If tokens or access token is missing, throw an error before proceeding
        const noTokenMsg = "Login successful but access token was not received.";
        console.error("[Signin] " + noTokenMsg, tokens);
        setError(noTokenMsg);
        toast.error(noTokenMsg);
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokens.access);
        if (tokens.refresh) {
          localStorage.setItem("refresh_token", tokens.refresh);
        }
      }

      // Now, attempt to get user details
      const userDetails = await getUserDetails();


      dispatch(setAuthState({ user: userDetails, tokens }));

      toast.success("Logged in successfully!");
      router.push("/my-account");
    } catch (err: any) {
      console.error("[Signin] Login failed:", err);
      // Log the full error object for more details
      console.error("[Signin] Full error object:", err);
      const errorMessage = err.data?.detail || err.data?.message || err.message || "Failed to login. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName={"Signin"} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="emailOrUsername" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="emailOrUsername"
                  id="emailOrUsername"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="rounded-lg border border-black bg-white placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 hover:border-blue focus:border-blue focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg border border-black bg-white placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 hover:border-blue focus:border-blue focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="text-right mb-5">
                <Link href="/password-reset" className="text-sm text-blue hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign in to account"}
              </button>
            </form>
            <p className="text-center mt-6">
              Don&apos;t have an account?
              <Link
                href="/signup"
                className="text-dark ease-out duration-200 hover:text-blue pl-2"
              >
                Sign Up Now!
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
