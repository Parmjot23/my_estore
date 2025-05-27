import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "List of orders",
};

const OrdersPage = () => {
  return (
    <main className="max-w-[1170px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <p>This page will show order workflow information.</p>
    </main>
  );
};

export default OrdersPage;
