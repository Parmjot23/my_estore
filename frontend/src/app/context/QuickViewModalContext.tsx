// frontend/src/app/context/QuickViewModalContext.tsx
"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/types/product"; // Import Product type

interface QuickViewModalContextType {
  isQuickViewModalOpen: boolean;
  productSlug: string | null; // Slug of the product to display
  openModal: () => void;
  closeModal: () => void;
  setProductSlug: (slug: string | null) => void; 
}

const defaultModalContextValue: QuickViewModalContextType = {
  isQuickViewModalOpen: false,
  productSlug: null,
  openModal: () => {},
  closeModal: () => {},
  setProductSlug: () => {},
};

const QuickViewModalContext = createContext<QuickViewModalContextType>(defaultModalContextValue);

// This is the hook that should be imported and used by components
export const useQuickViewModalContext = () => {
  const context = useContext(QuickViewModalContext);
  if (context === undefined) {
    throw new Error("useQuickViewModalContext must be used within a QuickViewModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const QuickViewModalProvider = ({ children }: ModalProviderProps) => {
  const [isQuickViewModalOpen, setIsQuickViewModalOpen] = useState(false);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  const openModal = () => {
    setIsQuickViewModalOpen(true);
  };

  const closeModal = () => {
    setIsQuickViewModalOpen(false);
    setProductSlug(null); 
  };
  
  const contextValue: QuickViewModalContextType = {
    isQuickViewModalOpen,
    productSlug,
    openModal,
    closeModal,
    setProductSlug,
  };

  return (
    <QuickViewModalContext.Provider value={contextValue}>
      {children}
    </QuickViewModalContext.Provider>
  );
};