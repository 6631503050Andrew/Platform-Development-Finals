import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "./components/NavigationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MFU Lost & Found",
  description: "Mae Fah Luang University Lost & Found System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationWrapper />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/mfu-logo.png" alt="MFU" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-lg font-bold">MFU Lost & Found</p>
                <p className="text-sm text-gray-400">Mae Fah Luang University</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Helping students and staff reunite with their belongings
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © {new Date().getFullYear()} Mae Fah Luang University. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
