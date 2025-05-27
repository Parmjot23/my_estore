import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trips",
  description: "List of trips",
};

const TripsPage = () => {
  return (
    <main className="max-w-[1170px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      <p>This page will display trip information.</p>
    </main>
  );
};

export default TripsPage;
