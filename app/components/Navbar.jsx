"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current route

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Helper function to check if link is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-[#034053] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="">
            <h1 className="text-2xl font-bold text-[#0cc0cb]">
              Booking<span className="text-[#e93d18]">O</span>pro
            </h1>{" "}
          </div>

          <div className="hidden md:flex space-x-8 text-white">
            <Link
              href="/"
              className={`text-white hover:text-cyan-600 transition pb-1 ${
                isActive("/")
                  ? "border-b-2 border-[#e93d18]"
                  : "border-b-2 border-transparent"
              }`}
            >
              Home
            </Link>
            <Link
              href="/Hotels"
              className={`text-white hover:text-cyan-600 transition pb-1 ${
                isActive("/Hotels")
                  ? "border-b-2 border-[#e93d18]"
                  : "border-b-2 border-transparent"
              }`}
            >
              Hotels
            </Link>
            <Link
              href="/Flights"
              className={`text-white hover:text-cyan-600 transition pb-1 ${
                isActive("/Flights")
                  ? "border-b-2 border-[#e93d18]"
                  : "border-b-2 border-transparent"
              }`}
            >
              Flights
            </Link>
            <Link
              href="/Cars"
              className={`text-white hover:text-cyan-600 transition pb-1 ${
                isActive("/Cars")
                  ? "border-b-2 border-[#e93d18]"
                  : "border-b-2 border-transparent"
              }`}
            >
              Car
            </Link>
            <Link
              href="/Contact"
              className={`text-white hover:text-cyan-600 transition pb-1 ${
                isActive("/Contact")
                  ? "border-b-2 border-[#e93d18]"
                  : "border-b-2 border-transparent"
              }`}
            >
              Contact Us
            </Link>
          </div>

          <div className="hidden md:flex items-center bg-linear-to-l from-[#db6c53] to-[#e93d18]  text-white h-10 px-4 rounded-md space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7c1.5 3 4 5.5 7 7v-1a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z"
              />
            </svg>

            <button className="text-sm leading-tight text-left">
              <p className="text-xs">For phone exclusive deals call us</p>
              <p className="font-semibold">+1 (855) 568-3704</p>
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#e93d18] hover:text-cyan-600 focus:outline-none focus:text-cyan-600"
            >
              <svg
                className="h-6 w-6 text-[#e93d18]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md transition ${
                isActive("/")
                  ? "text-[#e93d18] bg-cyan-50 border-l-4 border-[#e93d18]"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/Hotels"
              className={`block px-3 py-2 rounded-md transition ${
                isActive("/Hotels")
                  ? "text-[#e93d18] bg-cyan-50 border-l-4 border-[#e93d18]"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
            >
              Hotels
            </Link>
            <Link
              href="/Flights"
              className={`block px-3 py-2 rounded-md transition ${
                isActive("/Flights")
                  ? "text-[#e93d18] bg-cyan-50 border-l-4 border-[#e93d18]"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
            >
              Flights
            </Link>
            <Link
              href="/Cars"
              className={`block px-3 py-2 rounded-md transition ${
                isActive("/Cars")
                  ? "text-[#e93d18] bg-cyan-50 border-l-4 border-[#e93d18]"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
            >
              Car
            </Link>
            <Link
              href="/Contact"
              className={`block px-3 py-2 rounded-md transition ${
                isActive("/Contact")
                  ? "text-[#e93d18] bg-cyan-50 border-l-4 border-[#e93d18]"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
            >
              Contact Us
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link
                href="tel:+18555683704"
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-md bg-[#e93d18] text-white hover:bg-teal-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7c1.5 3 4 5.5 7 7v-1a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z"
                  />
                </svg>

                <div className="text-left leading-tight">
                  <p className="text-xs opacity-90">
                    Call us for exclusive deals
                  </p>
                  <p className="font-semibold">+1 (855) 568-3704</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
