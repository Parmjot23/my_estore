// src/components/MyAccount/AddressModal.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { Address } from "@/types/user"; // Assuming Address type is defined here

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: (addressData: Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>) => Promise<void>;
  addressToEdit?: Address | null;
}

const initialAddressState: Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'> = {
  street_address: "",
  apartment_address: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "Canada", // Default country
  address_type: "SHIPPING", // Default type
  is_default: false,
};

const AddressModal = ({ isOpen, closeModal, onSave, addressToEdit }: AddressModalProps) => {
  const [addressData, setAddressData] = useState(initialAddressState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setAddressData({
        street_address: addressToEdit.street_address,
        apartment_address: addressToEdit.apartment_address || "",
        city: addressToEdit.city,
        state_province: addressToEdit.state_province || "",
        postal_code: addressToEdit.postal_code,
        country: addressToEdit.country,
        address_type: addressToEdit.address_type,
        is_default: addressToEdit.is_default,
      });
    } else {
      setAddressData(initialAddressState);
    }
  }, [addressToEdit, isOpen]); // Reset form when modal opens or addressToEdit changes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? e.target.checked : undefined;
    setAddressData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Basic validation (can be expanded)
    if (!addressData.street_address || !addressData.city || !addressData.postal_code || !addressData.country) {
        alert("Please fill in all required fields."); // Replace with toast or better UI
        setIsLoading(false);
        return;
    }
    await onSave(addressData);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-70 p-4 overflow-y-auto">
      <div className="modal-content relative w-full max-w-2xl rounded-lg bg-white dark:bg-dark shadow-xl p-6 md:p-8 transform transition-all">
        <button
          onClick={closeModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-semibold text-dark dark:text-white mb-6">
          {addressToEdit ? "Edit Address" : "Add New Address"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Street Address */}
          <div>
            <label htmlFor="street_address" className="form-label">Street Address <span className="text-red-500">*</span></label>
            <input type="text" name="street_address" id="street_address" value={addressData.street_address} onChange={handleChange} required className="form-input"/>
          </div>

          {/* Apartment Address */}
          <div>
            <label htmlFor="apartment_address" className="form-label">Apartment, suite, etc. (optional)</label>
            <input type="text" name="apartment_address" id="apartment_address" value={addressData.apartment_address} onChange={handleChange} className="form-input"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* City */}
            <div>
              <label htmlFor="city" className="form-label">City <span className="text-red-500">*</span></label>
              <input type="text" name="city" id="city" value={addressData.city} onChange={handleChange} required className="form-input"/>
            </div>
            {/* State/Province */}
            <div>
              <label htmlFor="state_province" className="form-label">State/Province</label>
              <input type="text" name="state_province" id="state_province" value={addressData.state_province} onChange={handleChange} className="form-input"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Postal Code */}
            <div>
              <label htmlFor="postal_code" className="form-label">Postal Code <span className="text-red-500">*</span></label>
              <input type="text" name="postal_code" id="postal_code" value={addressData.postal_code} onChange={handleChange} required className="form-input"/>
            </div>
            {/* Country */}
            <div>
              <label htmlFor="country" className="form-label">Country <span className="text-red-500">*</span></label>
              <select name="country" id="country" value={addressData.country} onChange={handleChange} required className="form-input">
                {/* Add more countries as needed */}
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Address Type */}
          <div>
            <label htmlFor="address_type" className="form-label">Address Type <span className="text-red-500">*</span></label>
            <select name="address_type" id="address_type" value={addressData.address_type} onChange={handleChange} required className="form-input">
              <option value="SHIPPING">Shipping</option>
              <option value="BILLING">Billing</option>
            </select>
          </div>

          {/* Is Default */}
          <div className="flex items-center">
            <input type="checkbox" name="is_default" id="is_default" checked={addressData.is_default} onChange={handleChange} className="h-4 w-4 text-blue border-black rounded focus:ring-blue mr-2"/>
            <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">Set as default address</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-300 dark:bg-dark-3 dark:hover:bg-dark-4 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue hover:bg-blue-dark rounded-md disabled:opacity-70 transition-colors">
              {isLoading ? (addressToEdit ? "Saving..." : "Adding...") : (addressToEdit ? "Save Changes" : "Add Address")}
            </button>
          </div>
        </form>
      </div>
       <style jsx>{`
        .form-label {
          @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
        }
        .form-input {
          @apply block w-full px-3 py-2 text-sm text-dark dark:text-white bg-white dark:bg-dark-2 border border-black dark:border-dark-3 rounded-md shadow-sm focus:outline-none hover:border-blue focus:border-blue focus:ring-blue transition-colors;
        }
      `}</style>
    </div>
  );
};

export default AddressModal;
