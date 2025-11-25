"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/mfu-logo.png" 
              alt="Mae Fah Luang University" 
              className="h-24 w-24 object-contain drop-shadow-lg animate-pulse"
            />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent mb-4">
            MFU Lost & Found
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Mae Fah Luang University Lost & Found System
          </p>
          <p className="text-sm text-gray-500">
            Help reunite lost items with their owners
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* I Found Something Card */}
          <Link
            href="/user"
            className="group block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-red-600 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-full mb-6 group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I Found Something
              </h2>
              <p className="text-gray-600 mb-6">
                Report a found item and help someone recover what they lost
              </p>
              <div className="flex items-center text-red-700 font-semibold group-hover:text-red-800">
                Submit Found Item
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* I Lost Something Card */}
          <Link
            href="/user/dashboard"
            className="group block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-full mb-6 group-hover:from-green-500 group-hover:to-green-600 transition-all duration-300 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I Lost Something
              </h2>
              <p className="text-gray-600 mb-6">
                Browse found items and see if your lost item has been reported
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                Search Found Items
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* Admin/Staff Card */}
          <Link
            href="/admin"
            className="group block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-full mb-6 group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-purple-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Staff Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Manage and review all reported found items
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                Manage Items
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Found items are stored securely and can be claimed by their rightful owners
          </p>
        </div>
      </div>
    </div>
  );
}
