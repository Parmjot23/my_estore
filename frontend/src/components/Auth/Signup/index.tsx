"use client"; // Add this if not present
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/apiService"; // Import
import { toast } from "react-toastify";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      toast.success("Registration successful! Please sign in.");
      router.push("/signin"); // Redirect to signin page
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.data && typeof err.data === 'object' && !err.data.detail) {
        // Handle DRF validation errors (field-specific)
        setValidationErrors(err.data);
        setError("Please correct the errors below.");
      } else {
        // Handle general errors (e.g., network error, non-field error from backend)
        setError(err.data?.detail || err.message || "Failed to register. Please try again.");
      }
      toast.error(err.data?.detail || err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Breadcrumb pageName={"Signup"} /> {/* Updated Breadcrumb call */}
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-7"> {/* Reduced bottom margin */}
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your details below</p>
            </div>

            {error && !Object.keys(validationErrors).length && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            {/* ... Social signup buttons ... */}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="username" className="block mb-2.5">
                  Username <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
                {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username.join(', ')}</p>}
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
                 {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email.join(', ')}</p>}
              </div>
               <div className="mb-5">
                <label htmlFor="first_name" className="block mb-2.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
               <div className="mb-5">
                <label htmlFor="last_name" className="block mb-2.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
                 {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password.join(', ')}</p>}
              </div>

              <div className="mb-5.5">
                <label htmlFor="password2" className="block mb-2.5">
                  Re-type Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="password2"
                  id="password2"
                  placeholder="Re-type your password"
                  autoComplete="new-password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
                 {validationErrors.password2 && <p className="text-red-500 text-xs mt-1">{validationErrors.password2.join(', ')}</p>}
              </div>
                {validationErrors.non_field_errors && <p className="text-red-500 text-xs mt-1 text-center">{validationErrors.non_field_errors.join(', ')}</p>}


              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-70"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-center mt-6">
                Already have an account?
                <Link
                  href="/signin" // Corrected path
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Sign in Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;