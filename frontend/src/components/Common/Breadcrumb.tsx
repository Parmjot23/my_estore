// frontend/src/components/Common/Breadcrumb.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Common hook for breadcrumbs

interface BreadcrumbProps {
  pageName: string;
  // You might have other props like custom breadcrumb paths
  // customPaths?: Array<{ name: string; href: string }>;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const pathname = usePathname(); // Get current path

  // Generate path segments if not using customPaths
  // Ensure pathname is not null or undefined before splitting
  const pathSegments = pathname ? pathname.split("/").filter((segment) => segment) : [];

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-1 p-4 rounded-md">
      <h2 className="text-title-md2 font-semibold text-dark">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Home /
            </Link>
          </li>
          {/* Render intermediate path segments if needed */}
          {/* This is a simplified example; a more complex one might map pathSegments */}
          {/* For example, if pathSegments was ['shop', 'category', 'product-name'] */}
          {/* You might render links for 'shop' and 'category' */}

          {/* Example of rendering path segments (customize as needed) */}
          {pathSegments && pathSegments.length > 0 && pathSegments.map((segment, index) => {
            // Avoid rendering the current page name if it's the last segment
            // and pageName prop is already handling it.
            // Or, if pageName is meant to be the last item, adjust logic.
            if (index < pathSegments.length -1 ) { // Simple check to avoid duplicating last part
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              // Capitalize segment for display
              const displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
              return (
                <li key={href}>
                  <Link className="font-medium" href={href}>
                    {displayName} /
                  </Link>
                </li>
              );
            }
            return null;
          })}

          <li className="font-medium text-blue">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
