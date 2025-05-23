"use client";
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero/hero-01.png')" }}
    >
      <div className="absolute inset-0 bg-white/70"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-dark-base">
          Premium Wine Gear
        </h1>
        <p className="text-lg md:text-xl mb-6 text-dark-base">
          Discover curated accessories for wine enthusiasts.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-accent text-white py-3 px-6 rounded-md hover:bg-[#b88d4f] transition"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default Hero;
