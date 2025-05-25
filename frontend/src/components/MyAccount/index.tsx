// src/components/MyAccount/index.tsx
"use client";
import React, { useState, useEffect, FormEvent } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders"; // Ensure Orders component is correctly implemented
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { logout, updateUserInState } from "@/redux/features/auth-slice";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getUserDetails,
  updateUserDetails,
  getUserAddresses,
  addAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  changePassword as apiChangePassword, // Import the new function
} from "@/lib/apiService";
import { User, Address, ChangePasswordData } from "@/types/user";
import { Eye, Edit3, Trash2, PlusCircle, ShoppingBag, LogOut, UserCircle2, KeyRound, Save } from 'lucide-react';
import Link from "next/link";

const MyAccount = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authIsLoading } = useAppSelector((state) => state.authReducer);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState<Partial<User>>({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({ // Use ChangePasswordData type
    old_password: "", // Changed from current_password to match typical DRF serializers
    new_password: "",
    new_password_confirm: "", // Changed from confirm_new_password
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pageIsLoading, setPageIsLoading] = useState(true); // Start true if auth is likely already loaded
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);


  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/signin");
      toast.info("Please sign in to access your account.");
    }
  }, [isAuthenticated, authIsLoading, router]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      setPageIsLoading(true);
      Promise.all([getUserDetails(), getUserAddresses()])
        .then(([userDetails, userAddresses]) => {
          setUserData({
            username: userDetails.username || "",
            first_name: userDetails.first_name || "",
            last_name: userDetails.last_name || "",
            email: userDetails.email || "",
          });
          setAddresses(userAddresses || []);
        })
        .catch((err) => {
          console.error("Failed to fetch account data:", err);
          toast.error("Could not load your account details.");
        })
        .finally(() => setPageIsLoading(false));
    } else if (!authIsLoading && !authUser) {
        // This case handles when auth is confirmed to be not loaded (e.g., no token)
        setPageIsLoading(false);
    }
  }, [isAuthenticated, authUser, authIsLoading]); // Rerun if authUser changes (e.g. after login elsewhere)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Renamed from handlePasswordChange
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!userData.first_name?.trim() || !userData.last_name?.trim()) {
        toast.error("First name and last name are required.");
        return;
    }
    setIsProfileUpdating(true);
    try {
      const updatePayload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
      };
      const updatedUser = await updateUserDetails(updatePayload);
      dispatch(updateUserInState(updatedUser)); // Update user in Redux state
      toast.success("Account details updated successfully!");
    } catch (err: any) {
      console.error("Failed to update details:", err);
      toast.error(err.data?.detail || (err.data && Object.values(err.data).flat().join(' ')) || err.message || "Failed to update details.");
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const handleSubmitChangePassword = async (e: FormEvent) => { // Renamed from handleChangePassword
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.new_password_confirm) {
        toast.error("All password fields are required.");
        return;
    }
    setIsPasswordChanging(true);
    try {
        // Assuming backend expects: old_password, new_password, new_password_confirm
        await apiChangePassword(passwordData);
        toast.success("Password changed successfully! Please log in again if prompted.");
        setPasswordData({ old_password: "", new_password: "", new_password_confirm: "" });
        // Optionally force re-login or token refresh here if backend invalidates old tokens
    } catch (err: any) {
        console.error("Password change failed:", err);
        // More specific error handling
        if (err.data) {
            if (err.data.old_password) toast.error(`Current Password: ${err.data.old_password.join(', ')}`);
            else if (err.data.new_password) toast.error(`New Password: ${err.data.new_password.join(', ')}`);
            else if (err.data.new_password_confirm) toast.error(`Confirm Password: ${err.data.new_password_confirm.join(', ')}`);
            else if (err.data.detail) toast.error(err.data.detail);
            else toast.error("Failed to change password. Please check your input.");
        } else {
            toast.error(err.message || "Failed to change password.");
        }
    } finally {
        setIsPasswordChanging(false);
    }
  };

  const openAddressModal = (address: Address | null = null) => {
    setAddressToEdit(address);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setAddressToEdit(null);
  };

  const handleSaveAddress = async (addressDataToSave: Omit<Address, 'id' | 'user' | 'created_at' | 'updated_at'>) => {
    try {
      let savedAddress;
      if (addressToEdit && typeof addressToEdit.id === 'number') {
        savedAddress = await apiUpdateAddress(addressToEdit.id, addressDataToSave);
        setAddresses(addresses.map(addr => addr.id === savedAddress.id ? savedAddress : addr));
        toast.success("Address updated successfully!");
      } else {
        savedAddress = await addAddress(addressDataToSave);
        setAddresses([...addresses, savedAddress]);
        toast.success("Address added successfully!");
      }
      closeAddressModal();
    } catch (err: any) {
      console.error("Failed to save address:", err);
      const errorMsg = err.data ? (Object.values(err.data).flat().join(' ') || "Failed to save address.") : (err.message || "Failed to save address.");
      toast.error(errorMsg);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await apiDeleteAddress(addressId);
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        toast.success("Address deleted successfully!");
      } catch (err: any) {
        console.error("Failed to delete address:", err);
        toast.error(err.data?.detail || err.message || "Failed to delete address.");
      }
    }
  };

const handleLogout = () => {
  dispatch(logout());
  dispatch(removeAllItemsFromCart());
  toast.info("You have been logged out.");
  router.push("/");
};

  if (authIsLoading || (isAuthenticated && pageIsLoading)) {
    return (
      <>
        <Breadcrumb pageName={"My Account"} />
        <section className="overflow-hidden py-20 bg-gray-100 dark:bg-dark-2">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto my-8"></div>
            Loading account details...
          </div>
        </section>
      </>
    );
  }

  // This check is important. If after loading, user is still not authenticated, redirect.
  if (!authIsLoading && !isAuthenticated) {
    // The useEffect above should already handle redirect, but this is a safeguard.
    return (
        <>
            <Breadcrumb pageName={"My Account"} />
            <section className="overflow-hidden py-20 bg-gray-100 dark:bg-dark-2">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg">Redirecting to sign in...</p>
                </div>
            </section>
        </>
    );
  }

  if (!authUser) {
    // This case means isAuthenticated might be true (e.g. token exists) but user object is null in Redux
    // This might happen if loadUserFromStorage fails to parse or if there's an issue post-login.
    return (
         <>
            <Breadcrumb pageName={"My Account"} />
            <section className="overflow-hidden py-20 bg-gray-100 dark:bg-dark-2">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg text-red-500">Could not load user details.</p>
                    <p className="mt-2">Please try to <button onClick={handleLogout} className="text-blue hover:underline">sign out</button> and sign in again.</p>
                </div>
            </section>
        </>
    );
  }


  return (
    <>
      <Breadcrumb pageName={"My Account"} />
      <section className="overflow-hidden py-10 md:py-16 lg:py-20 bg-gray-100 dark:bg-dark-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="xl:w-1/4 bg-white dark:bg-dark shadow-lg rounded-xl p-6 self-start">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-dark-3">
                <Image
                  src={authUser?.profile_image || "/images/users/user-04.jpg"}
                  alt={authUser?.username || "User"}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-lg text-dark dark:text-white truncate max-w-[150px]">
                    {authUser?.first_name && authUser?.last_name ? `${authUser.first_name} ${authUser.last_name}`: authUser?.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all truncate max-w-[150px]">{authUser?.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                {[
                  { id: "dashboard", label: "Dashboard", icon: <Eye size={18}/> },
                  { id: "orders", label: "Orders", icon: <ShoppingBag size={18}/> },
                  { id: "addresses", label: "Addresses", icon: <UserCircle2 size={18}/> },
                  { id: "account-details", label: "Account Details", icon: <Edit3 size={18}/> },
                  { id: "logout", label: "Logout", icon: <LogOut size={18}/> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.id === 'logout' ? handleLogout() : setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                      ${activeTab === tab.id
                        ? "bg-blue text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-3"
                      }
                      ${tab.id === 'logout' ? 'hover:bg-red-500 hover:text-white dark:hover:bg-red-600' : ''}
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="xl:w-3/4">
              {/* Dashboard */}
              <div className={`${activeTab === "dashboard" ? "block" : "hidden"} bg-white dark:bg-dark shadow-lg rounded-xl p-6 md:p-10`}>
                <h3 className="text-2xl font-semibold text-dark dark:text-white mb-6">Dashboard</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hello <span className="font-medium">{authUser?.first_name || authUser?.username}</span> (not {authUser?.username}?{" "}
                  <button onClick={handleLogout} className="text-blue hover:underline">Log Out</button>)
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  From your account dashboard you can view your recent orders,
                  manage your shipping and billing addresses, and update your
                  password and account details.
                </p>
              </div>

              {/* Orders */}
              <div className={`${activeTab === "orders" ? "block" : "hidden"} bg-white dark:bg-dark shadow-lg rounded-xl`}>
                 <h3 className="text-2xl font-semibold text-dark dark:text-white mb-0 p-6 md:p-10 pb-4 border-b border-gray-200 dark:border-dark-3">My Orders</h3>
                <Orders />
              </div>

              {/* Addresses */}
              <div className={`${activeTab === "addresses" ? "block" : "hidden"} bg-white dark:bg-dark shadow-lg rounded-xl p-6 md:p-10`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h3 className="text-2xl font-semibold text-dark dark:text-white mb-4 sm:mb-0">My Addresses</h3>
                    <button
                        onClick={() => openAddressModal()}
                        className="btn-primary flex items-center gap-2 self-start sm:self-center"
                    >
                        <PlusCircle size={18} /> Add New Address
                    </button>
                </div>
                {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border border-gray-200 dark:border-dark-3 rounded-xl p-6 bg-gray-50 dark:bg-dark-input shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-semibold text-lg text-dark dark:text-white mb-2 capitalize flex justify-between items-center">
                                    {addr.address_type.toLowerCase()} Address
                                    {addr.is_default && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium dark:bg-green-700/20 dark:text-green-300">Default</span>}
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <p>{addr.street_address}</p>
                                    {addr.apartment_address && <p>{addr.apartment_address}</p>}
                                    <p>{addr.city}{addr.state_province ? `, ${addr.state_province}` : ''} {addr.postal_code}</p>
                                    <p>{addr.country}</p>
                                </div>
                                <div className="mt-5 flex gap-3 border-t border-gray-200 dark:border-dark-4 pt-4">
                                    <button onClick={() => openAddressModal(addr)} className="text-blue hover:underline text-sm font-medium flex items-center gap-1.5 transition-colors"><Edit3 size={16}/> Edit</button>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:underline text-sm font-medium flex items-center gap-1.5 transition-colors"><Trash2 size={16}/> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <UserCircle2 size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4"/>
                        <p className="text-gray-600 dark:text-gray-400">You have not saved any addresses yet.</p>
                        <button
                            onClick={() => openAddressModal()}
                            className="btn-secondary mt-6 flex items-center gap-2 mx-auto"
                        >
                            <PlusCircle size={18} /> Add Your First Address
                        </button>
                    </div>
                )}
              </div>

              {/* Account Details Tab Content */}
              <div className={`${activeTab === "account-details" ? "block" : "hidden"} bg-white dark:bg-dark shadow-lg rounded-xl p-6 md:p-10`}>
                <div className="mb-10">
                    <h3 className="text-2xl font-semibold text-dark dark:text-white mb-2">Account Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal details.</p>
                </div>
                <form onSubmit={handleUpdateDetails} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                      <label htmlFor="first_name" className="form-label">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="first_name" id="first_name" value={userData.first_name || ""} onChange={handleInputChange} required className="form-input"/>
                    </div>
                    <div>
                      <label htmlFor="last_name" className="form-label">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="last_name" id="last_name" value={userData.last_name || ""} onChange={handleInputChange} required className="form-input"/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email_display" className="form-label">Email Address</label>
                    <input type="email" name="email_display" id="email_display" value={userData.email || ""} readOnly className="form-input bg-gray-100 dark:bg-dark-3 cursor-not-allowed opacity-70"/>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email address cannot be changed from this page.</p>
                  </div>
                   <div className="space-y-1.5">
                    <label htmlFor="username_display" className="form-label">Username</label>
                    <input type="text" name="username_display" id="username_display" value={userData.username || ""} readOnly className="form-input bg-gray-100 dark:bg-dark-3 cursor-not-allowed opacity-70"/>
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={isProfileUpdating}>
                      {isProfileUpdating ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : <Save size={18}/>}
                      {isProfileUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>

                <hr className="my-10 border-gray-200 dark:border-dark-3"/>

                <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-dark dark:text-white mb-2">Change Password</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <form onSubmit={handleSubmitChangePassword} className="space-y-6">
                  <div>
                    <label htmlFor="old_password" className="form-label">Current Password</label>
                    <input type="password" name="old_password" id="old_password" value={passwordData.old_password} onChange={handlePasswordInputChange} required className="form-input" autoComplete="current-password"/>
                  </div>
                  <div>
                    <label htmlFor="new_password" className="form-label">New Password</label>
                    <input type="password" name="new_password" id="new_password" value={passwordData.new_password} onChange={handlePasswordInputChange} required className="form-input" autoComplete="new-password"/>
                  </div>
                  <div>
                    <label htmlFor="new_password_confirm" className="form-label">Confirm New Password</label>
                    <input type="password" name="new_password_confirm" id="new_password_confirm" value={passwordData.new_password_confirm} onChange={handlePasswordInputChange} required className="form-input" autoComplete="new-password"/>
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={isPasswordChanging}>
                       {isPasswordChanging ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : <KeyRound size={18}/>}
                      {isPasswordChanging ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          closeModal={closeAddressModal}
          onSave={handleSaveAddress}
          addressToEdit={addressToEdit}
        />
      )}
      <style jsx>{`
        .form-label {
          @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
        }
        .form-input {
          @apply block w-full px-4 py-3 text-sm text-dark dark:text-white bg-white dark:bg-dark-2 border border-black dark:border-dark-3 rounded-lg shadow-sm focus:outline-none hover:border-blue focus:border-blue focus:ring-2 focus:ring-blue transition-colors placeholder-gray-400 dark:placeholder-gray-500;
        }
        .form-input:read-only {
            @apply bg-gray-200 dark:bg-dark-3 cursor-not-allowed opacity-70;
        }
        .btn-primary {
          @apply inline-flex items-center justify-center px-6 py-2.5 bg-blue text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue dark:focus:ring-offset-dark transition-all duration-150 ease-in-out disabled:opacity-70;
        }
        .btn-secondary {
            @apply inline-flex items-center justify-center px-6 py-2.5 bg-gray-200 text-gray-700 dark:bg-dark-3 dark:text-gray-300 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-dark-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-dark transition-all duration-150 ease-in-out;
        }
      `}</style>
    </>
  );
};

export default MyAccount;