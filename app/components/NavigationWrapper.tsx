"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-red-700 to-red-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link href="/landing" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <img src="/mfu-logo.png" alt="MFU" className="h-12 w-12 object-contain" />
              <span className="text-xl font-bold">MFU Lost & Found</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/user"
                className="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Report Item
              </Link>
              <Link
                href="/user/dashboard"
                className="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AdminNavigation() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link href="/landing" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <img src="/mfu-logo.png" alt="MFU" className="h-12 w-12 object-contain" />
              <div>
                <div className="text-xl font-bold">MFU Lost & Found</div>
                <div className="text-xs text-purple-200">Admin Dashboard</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function NavigationWrapper() {
  const pathname = usePathname();

  // Don't show nav on landing page
  if (pathname === "/landing" || pathname === "/") {
    return null;
  }

  // Show admin nav on admin pages
  if (pathname?.startsWith("/admin")) {
    return <AdminNavigation />;
  }

  // Show regular nav on other pages
  return <Navigation />;
}
