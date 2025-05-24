// frontend/src/components/Header/Dropdown.tsx
"use client";

import Link from "next/link";
import React from "react";
import { Menu as MenuType } from "@/types/Menu";

interface DropdownProps {
  item: MenuType | undefined | null;
  stickyMenu?: boolean;
  openSubMenu?: number | null;
  handleSubMenuToggle?: (id: number) => void;
}

const Dropdown = ({
  item,
  stickyMenu,
  openSubMenu,
  handleSubMenuToggle
}: DropdownProps) => {

  // Stricter check: Ensure item exists and has a title of type string.
  if (!item || typeof item.title !== 'string' || item.title.trim() === '') {
    // console.warn("Dropdown: item is invalid or item.title is missing/empty.", JSON.stringify(item));
    return null;
  }

  const isSubMenuOpen = openSubMenu === item.id;

  const onToggleSubMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (handleSubMenuToggle && typeof item.id === 'number') {
      handleSubMenuToggle(item.id);
    }
  };

  return (
    <li className="group relative">
      <Link
        href={item.path || "#"}
        onClick={item.submenu && item.submenu.length > 0 ? onToggleSubMenu : undefined}
        className={`hover:text-blue text-custom-sm font-medium text-dark flex items-center justify-between w-full xl:w-auto ${
          stickyMenu ? "xl:py-4" : "xl:py-6"
        } ${isSubMenuOpen ? "text-blue" : ""}`}
      >
        {item.title} {/* Safe to access item.title here */}
        {item.submenu && item.submenu.length > 0 && (
          <svg
            className={`ml-1.5 fill-current transition-transform duration-200 ease-in-out transform ${
              isSubMenuOpen ? "rotate-180" : "rotate-0"
            } xl:group-hover:rotate-180`}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 7.08317L0.833336 2.9165L1.91667 1.83317L5 4.9165L8.08334 1.83317L9.16667 2.9165L5 7.08317Z" />
          </svg>
        )}
      </Link>

      {item.submenu && item.submenu.length > 0 && (
        <ul
          className={`xl:absolute xl:left-0 xl:top-full xl:w-[220px] rounded-md bg-white xl:shadow-nav xl:py-2 static mt-2 pl-4 xl:pl-0 ${
            isSubMenuOpen ? 'block' : 'hidden'
          } xl:hidden xl:group-hover:block`}
        >
          {item.submenu.map((subItem, index) => {
            // Stricter check for subItem as well
            if (!subItem || typeof subItem.title !== 'string' || subItem.title.trim() === '') {
                // console.warn("Dropdown submenu: subItem or subItem.title is invalid.", JSON.stringify(subItem));
                return null;
            }
            return (
              <li key={subItem.id || index}>
                <Link
                  href={subItem.path || "#"}
                  className="text-dark-4 hover:text-blue text-custom-sm font-medium block py-2.5 px-6 xl:px-4"
                >
                  {subItem.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default Dropdown;
