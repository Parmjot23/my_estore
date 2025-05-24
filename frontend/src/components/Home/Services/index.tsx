import React from "react";
import Image from "next/image";

const serviceItems = [
  { icon: "/images/icons/icon-05.svg", title: "Flatbed" },
  { icon: "/images/icons/icon-06.svg", title: "Dryvan" },
  { icon: "/images/icons/icon-07.svg", title: "Temperature Controlled" },
];

const Services = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <h2 className="text-center font-bold text-2xl mb-8">Our Services</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {serviceItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center bg-white p-6 rounded shadow"
            >
              <Image
                src={item.icon}
                alt={item.title}
                width={40}
                height={40}
                className="mb-3"
              />
              <span className="font-medium text-lg text-dark-base text-center">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
