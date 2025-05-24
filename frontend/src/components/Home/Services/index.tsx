import React from "react";

const Services = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <h2 className="text-center font-bold text-2xl mb-8">Our Services</h2>
        <ul className="grid gap-6 sm:grid-cols-3 text-center">
          <li className="p-4 bg-white shadow rounded">Flatbed</li>
          <li className="p-4 bg-white shadow rounded">Dryvan</li>
          <li className="p-4 bg-white shadow rounded">Temperature Controlled</li>
        </ul>
      </div>
    </section>
  );
};

export default Services;
