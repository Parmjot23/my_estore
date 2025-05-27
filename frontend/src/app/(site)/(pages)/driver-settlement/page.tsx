import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Settlement",
  description: "Settlement details for drivers",
};

const DriverSettlementPage = () => {
  return (
    <main className="max-w-[1170px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Settlement</h1>
      <p>This page will cover driver settlement information.</p>
    </main>
  );
};

export default DriverSettlementPage;
