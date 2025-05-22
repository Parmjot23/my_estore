// src/components/Header/index.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import { menuData as headerMenuDataImport } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector, useAppDispatch } from "@/redux/store"; // Import useAppDispatch
import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCategories, refreshToken as callRefreshTokenApi } from "@/lib/apiService"; // Import refreshToken
import { Category as CategoryType } from "@/types/category";
import { Menu as MenuType } from "@/types/Menu";
import { logout, setAuthState, loadUserFromStorage } from "@/redux/features/auth-slice"; // Import auth actions
import { User, AuthTokens } from "@/types/user"; // Import User and AuthTokens types
import { toast } from "react-toastify";
import { LogOut, UserCircle2, ShoppingBag, Search, Menu as MenuIcon, X } from 'lucide-react';


const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Auth state from Redux
  const { isAuthenticated, user, isLoading: authIsLoading } = useAppSelector((state) => state.authReducer);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [selectedSearchCategorySlug, setSelectedSearchCategorySlug] = useState<string | null>(null);

  // Mobile navigation state
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
  const mobileMenuTrigger = useRef<HTMLButtonElement>(null);
  const mobileMenuDropdown = useRef<HTMLDivElement>(null);

  // Sticky header state
  const [stickyMenu, setStickyMenu] = useState(false);

  // Cart state
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const { openCartModal } = useCartModalContext();

  const headerMenuData: MenuType[] = Array.isArray(headerMenuDataImport)
    ? headerMenuDataImport.filter(item => item && typeof item.title !== 'undefined')
    : [];

  const businessName = "Celtrix Wireless Ltd";

  useEffect(() => {
    const handleStickyMenu = () => {
      if (window.scrollY >= 80) setStickyMenu(true);
      else setStickyMenu(false);
    };
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories || []);
      } catch (err) {
        console.error("Header: Failed to fetch categories for search", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!mobileMenuDropdown.current || !mobileMenuTrigger.current) return;
      if (
        !navigationOpen ||
        mobileMenuDropdown.current.contains(target as Node) ||
        mobileMenuTrigger.current.contains(target as Node)
      )
        return;
      setNavigationOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [navigationOpen]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.append("search", searchQuery.trim());
    }
    if (selectedSearchCategorySlug) {
      queryParams.append("category__slug", selectedSearchCategorySlug); // Ensure backend filter uses category__slug
    }
    router.push(`/shop-with-sidebar?${queryParams.toString()}`);
    if (navigationOpen) setNavigationOpen(false);
  };

  const handleSubMenuToggle = (id: number) => {
    setOpenSubMenu(openSubMenu === id ? null : id);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(removeAllItemsFromCart());
    toast.info("You have been logged out.");
    router.push("/"); // Redirect to home or login page
    if (navigationOpen) setNavigationOpen(false);
  };


  // Attempt to refresh token periodically or on specific triggers (e.g., API error)
  // This is a simplified example. Robust token refresh logic can be more complex.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (typeof window !== "undefined") {
        const currentRefreshToken = localStorage.getItem("refresh_token");
        if (currentRefreshToken) {
          try {
            const response = await callRefreshTokenApi(currentRefreshToken); // Ensure callRefreshTokenApi is defined in apiService
            const newAccessToken = response.access;
            localStorage.setItem("access_token", newAccessToken);
            // If user data is also refreshed, dispatch setAuthState again
            // For this example, we assume user data doesn't change on token refresh
            // or is refetched when needed.
            // To update Redux state with new access token if needed:
            const currentUserString = localStorage.getItem("user");
            if(currentUserString){
              const currentUser = JSON.parse(currentUserString) as User;
              const newTokens: AuthTokens = { access: newAccessToken, refresh: currentRefreshToken };
              dispatch(setAuthState({ user: currentUser, tokens: newTokens }));
            }
            console.log("Token refreshed successfully.");
          } catch (error) {
            console.error("Failed to refresh token:", error);
            // If refresh fails (e.g., refresh token expired), log out user
            dispatch(logout());
            dispatch(removeAllItemsFromCart());
            router.push('/signin'); // Redirect to sign-in
          }
        }
      }
    }, 1000 * 60 * 25); // Refresh every 25 minutes, adjust as needed

    return () => clearInterval(interval);
  }, [dispatch, router]);


  if (authIsLoading && typeof window !== "undefined" && localStorage.getItem("access_token")) {
    // Potentially show a minimal loading state or rely on the main app preloader
    return <div className="h-[70px] sm:h-[80px] bg-white"></div>; // Placeholder height
  }


  return (
    <header
      className={`fixed left-0 top-0 w-full z-[9999] bg-gradient-to-r from-blue-50 via-white to-blue-50 backdrop-blur-sm transition-all ease-in-out duration-300 ${
        stickyMenu ? "shadow-nav animate-stickyBackground" : "shadow-md"
      }`}
    >
      <div className={`max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0 ${stickyMenu ? "py-3 lg:py-3.5" : "py-4 lg:py-5"}`}> {/* Adjusted padding for sticky */}
        <div className="flex items-center justify-between gap-4">
          <Link className="flex-shrink-0 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity" href="/">
            {businessName}
          </Link>

          <div className="hidden lg:flex flex-grow max-w-[550px] w-full">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="flex items-center w-full">
                <CustomSelect
                  categories={allCategories}
                  selectedCategorySlug={selectedSearchCategorySlug}
                  onCategoryChange={setSelectedSearchCategorySlug}
                />
                <div className="relative flex-grow">
                  <input
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    type="search"
                    name="search"
                    placeholder="I am shopping for..."
                    autoComplete="off"
                    className="custom-search w-full rounded-r-md bg-gray-100 border-l-0 border border-gray-300 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/my-account" className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue transition-colors">
                  <UserCircle2 size={22} />
                  <div className="text-left">
                    <span className="block text-xs text-gray-500 uppercase">Welcome</span>
                    <p className="font-medium text-sm text-dark truncate max-w-[100px]">{user.first_name || user.username}</p>
                  </div>
                </Link>
                 <button onClick={handleLogout} title="Logout" className="text-gray-600 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/signin" className="hidden sm:flex items-center gap-2 text-sm text-gray-700 hover:text-blue transition-colors">
                <UserCircle2 size={22} />
                <div className="text-left">
                  <span className="block text-xs text-gray-500 uppercase">Account</span>
                  <p className="font-medium text-sm text-dark">Sign In</p>
                </div>
              </Link>
            )}

            <button onClick={openCartModal} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue transition-colors relative" aria-label="Open cart">
              <span className="relative">
                <ShoppingBag size={22} />
                <span className={`flex items-center justify-center text-xs absolute -right-2.5 -top-2.5 bg-blue w-5 h-5 rounded-full text-white shadow-sm ${cartItems.length === 0 ? 'hidden' : ''}`}>
                  {cartItems.length}
                </span>
              </span>
              <div className="hidden sm:block text-left">
                <span className="block text-xs text-gray-500 uppercase">Cart</span>
                <p className="font-medium text-sm text-dark">${totalPrice.toFixed(2)}</p>
              </div>
            </button>

            <button
              ref={mobileMenuTrigger}
              aria-label="Toggle mobile menu"
              aria-expanded={navigationOpen}
              aria-controls="mobile-menu-panel"
              className="xl:hidden block focus:outline-none text-gray-700 hover:text-blue"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              {navigationOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            <nav className="hidden xl:flex">
              <ul className="flex items-center gap-x-8">
                {headerMenuData.map((menuItem, i) => (
                  menuItem.submenu ? (
                    <Dropdown key={i} item={menuItem} stickyMenu={stickyMenu} openSubMenu={openSubMenu} handleSubMenuToggle={handleSubMenuToggle} />
                  ) : (
                    <li key={i} className="group relative">
                      <Link href={menuItem.path || "#"} className={`text-sm font-medium text-gray-700 hover:text-blue transition-colors duration-200 flex items-center ${stickyMenu ? "py-3.5" : "py-5"}`}> {/* Adjusted padding */}
                        {menuItem.title}
                      </Link>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                    </li>
                  )
                ))}
              </ul>
            </nav>

            <div className="hidden xl:flex items-center gap-x-6">
              <Link href="/shop-with-sidebar?ordering=-view_count" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue transition-colors">
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16"><path d="M2.45313 7.55556H1.70313V7.55556L2.45313 7.55556ZM2.45313 8.66667L1.92488 9.19908C2.21729 9.4892 2.68896 9.4892 2.98137 9.19908L2.45313 8.66667ZM4.10124 8.08797C4.39528 7.79623 4.39715 7.32135 4.10541 7.02731C3.81367 6.73327 3.3388 6.73141 3.04476 7.02315L4.10124 8.08797ZM1.86149 7.02315C1.56745 6.73141 1.09258 6.73327 0.800843 7.02731C0.509102 7.32135 0.510968 7.79623 0.805009 8.08797L1.86149 7.02315ZM12.1973 5.05946C12.4143 5.41232 12.8762 5.52252 13.229 5.30558C13.5819 5.08865 13.6921 4.62674 13.4752 4.27388L12.1973 5.05946ZM8.0525 1.25C4.5514 1.25 1.70313 4.06755 1.70313 7.55556H3.20313C3.20313 4.90706 5.3687 2.75 8.0525 2.75V1.25ZM1.70313 7.55556L1.70313 8.66667L3.20313 8.66667L3.20313 7.55556L1.70313 7.55556ZM2.98137 9.19908L4.10124 8.08797L3.04476 7.02315L1.92488 8.13426L2.98137 9.19908ZM2.98137 8.13426L1.86149 7.02315L0.805009 8.08797L1.92488 9.19908L2.98137 8.13426ZM13.4752 4.27388C12.3603 2.46049 10.3479 1.25 8.0525 1.25V2.75C9.80904 2.75 11.346 3.67466 12.1973 5.05946L13.4752 4.27388Z" fill="currentColor"/><path d="M13.5427 7.33337L14.0699 6.79996C13.7777 6.51118 13.3076 6.51118 13.0155 6.79996L13.5427 7.33337ZM11.8913 7.91107C11.5967 8.20225 11.5939 8.67711 11.8851 8.97171C12.1763 9.26631 12.6512 9.26908 12.9458 8.9779L11.8913 7.91107ZM14.1396 8.9779C14.4342 9.26908 14.9091 9.26631 15.2003 8.97171C15.4914 8.67711 15.4887 8.20225 15.1941 7.91107L14.1396 8.9779ZM3.75812 10.9395C3.54059 10.587 3.07849 10.4776 2.72599 10.6951C2.3735 10.9127 2.26409 11.3748 2.48163 11.7273L3.75812 10.9395ZM7.9219 14.75C11.4321 14.75 14.2927 11.9352 14.2927 8.44449H12.7927C12.7927 11.0903 10.6202 13.25 7.9219 13.25V14.75ZM14.2927 8.44449V7.33337H12.7927V8.44449H14.2927ZM13.0155 6.79996L11.8913 7.91107L12.9458 8.9779L14.0699 7.86679L13.0155 6.79996ZM13.0155 7.86679L14.1396 8.9779L15.1941 7.91107L14.0699 6.79996L13.0155 7.86679ZM2.48163 11.7273C3.60082 13.5408 5.62007 14.75 7.9219 14.75V13.25C6.15627 13.25 4.61261 12.3241 3.75812 10.9395L2.48163 11.7273Z" fill="currentColor"/></svg>
                Recently Viewed
              </Link>
              <Link href="/wishlist" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue transition-colors">
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16"><path d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z" fill="currentColor"/></svg>
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={mobileMenuDropdown}
        id="mobile-menu-panel"
        className={`xl:hidden fixed inset-x-0 top-0 mt-[70px] sm:mt-[80px] w-full h-[calc(100vh-70px)] sm:h-[calc(100vh-80px)] bg-white shadow-lg border-t border-gray-200 transform transition-transform duration-300 ease-in-out ${
          navigationOpen ? "translate-x-0" : "translate-x-full"
        } p-5 overflow-y-auto`}
      >
        <nav className="flex flex-col gap-y-2">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex items-center w-full">
              <CustomSelect
                categories={allCategories}
                selectedCategorySlug={selectedSearchCategorySlug}
                onCategoryChange={setSelectedSearchCategorySlug}
              />
              <div className="relative flex-grow">
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  type="search"
                  name="mobile-search"
                  placeholder="Search products..."
                  autoComplete="off"
                  className="custom-search w-full rounded-r-md bg-gray-100 border-l-0 border border-gray-300 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </form>

          {headerMenuData.map((menuItem) => (
            menuItem.submenu ? (
              <div key={menuItem.id} className="py-1 border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => handleSubMenuToggle(menuItem.id)}
                  className="w-full flex justify-between items-center text-gray-700 hover:text-blue py-2.5 transition-colors"
                  aria-expanded={openSubMenu === menuItem.id}
                >
                  <span className="font-medium">{menuItem.title}</span>
                  <svg className={`fill-current transform transition-transform duration-200 ${openSubMenu === menuItem.id ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 16 16"><path d="M7.99992 10.5332C7.83325 10.5332 7.66659 10.4665 7.53325 10.3332L3.53325 6.33317C3.26659 6.0665 3.26659 5.63317 3.53325 5.3665C3.79992 5.09984 4.23325 5.09984 4.49992 5.3665L7.99992 8.8665L11.4999 5.3665C11.7666 5.09984 12.1999 5.09984 12.4666 5.3665C12.7333 5.63317 12.7333 6.0665 12.4666 6.33317L8.46659 10.3332C8.33325 10.4665 8.16659 10.5332 7.99992 10.5332Z" /></svg>
                </button>
                {openSubMenu === menuItem.id && menuItem.submenu && (
                  <div className="pl-4 mt-1 flex flex-col gap-y-1">
                    {menuItem.submenu.map(subItem => (
                      <Link key={subItem.id} href={subItem.path || '#'} className="block text-sm text-gray-600 hover:text-blue py-1.5 transition-colors" onClick={() => setNavigationOpen(false)}>
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={menuItem.id} className="py-1 border-b border-gray-100 last:border-b-0">
                <Link href={menuItem.path || "#"} className="block text-gray-700 hover:text-blue py-2.5 font-medium transition-colors" onClick={() => setNavigationOpen(false)}>
                  {menuItem.title}
                </Link>
              </div>
            )
          ))}
          {isAuthenticated ? (
            <>
              <div className="py-1 border-b border-gray-100">
                <Link href="/my-account" className="block text-gray-700 hover:text-blue py-2.5 font-medium transition-colors" onClick={() => setNavigationOpen(false)}>My Account</Link>
              </div>
              <div className="py-1">
                <button onClick={handleLogout} className="block w-full text-left text-gray-700 hover:text-red-500 py-2.5 font-medium transition-colors">Logout</button>
              </div>
            </>
          ) : (
            <div className="py-1 border-b border-gray-100">
              <Link href="/signin" className="block text-gray-700 hover:text-blue py-2.5 font-medium transition-colors" onClick={() => setNavigationOpen(false)}>Sign In</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

// Wrap Header with Suspense for useSearchParams in CustomSelect
const HeaderWithSuspense = () => (
  <React.Suspense fallback={<div>Loading Header...</div>}>
    <Header />
  </React.Suspense>
);


export default HeaderWithSuspense;
