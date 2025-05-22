// src/app/(site)/layout.tsx
"use client";
import { useState, useEffect, ReactNode } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import HeaderWithSuspense from "../../components/Header"; // Corrected: Assuming HeaderWithSuspense is the intended component name
import Footer from "../../components/Footer";

import { QuickViewModalProvider } from "@/app/context/QuickViewModalContext";
import { CartModalProvider } from "@/app/context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "@/app/context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store } from "@/redux/store"; // Import the store
import { loadUserFromStorage } from "@/redux/features/auth-slice"; // Import the action
import CartInitializer from "@/components/Common/CartInitializer";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load user from storage on initial app load
    store.dispatch(loadUserFromStorage());
    setTimeout(() => setLoading(false), 1000); // Simulating asset loading
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <ReduxProvider> {/* ReduxProvider wraps everything */}
              <CartInitializer />
              <CartModalProvider>
                <QuickViewModalProvider>
                  <PreviewSliderProvider>
                    <HeaderWithSuspense />
                    {children}
                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                  </PreviewSliderProvider>
                </QuickViewModalProvider>
              </CartModalProvider>
            </ReduxProvider>
            <ScrollToTop />
            <Footer />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </>
        )}
      </body>
    </html>
  );
}
