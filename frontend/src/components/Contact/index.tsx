"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { sendContactMessage } from "@/lib/apiService";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendContactMessage({ name, email, message });
      toast.success("Message sent!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send message", err);
      toast.error(err.data?.detail || err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Contact"} pages={["contact"]} />
      <section className="py-20">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-2.5">Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-gray-300 w-full p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-gray-300 w-full p-2"
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-2.5">Message</label>
              <textarea
                id="message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-md border border-gray-300 w-full p-2"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex font-medium text-white bg-blue py-2.5 px-7 rounded-md hover:bg-blue-dark disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
