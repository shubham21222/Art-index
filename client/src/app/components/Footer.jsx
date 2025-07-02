"use client";
import { Facebook, Instagram, Twitter } from "lucide-react"; // Removed unused icons
import Image from "next/image";
import logo from "../../../public/logo2.png";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src={logo}
              alt="ArtIndex Logo"
              width={70}
              height={60}
              className="rounded mb-4"
            />
            <p className="text-xs text-gray-600">© 2025 Art Index</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 uppercase">
              <li>
                <a href="/about" className="hover:text-gray-900 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/art-news" className="hover:text-gray-900 transition-colors">
                  Art News
                </a>
              </li>
              <li>
                <a href="/galleries" className="hover:text-gray-900 transition-colors">
                  Galleries
                </a>
              </li>
              <li>
                <a href="/institutions" className="hover:text-gray-900 transition-colors">
                  Museums
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/partnerships" className="hover:text-gray-900 transition-colors">
                  Partnerships
                </a>
              </li>
             
            </ul>
          </div>

          {/* Newsletter Signup and Social Media */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Stay Connected
            </h3>
            <form className="flex w-full max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-r-md hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </button>
            </form>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}