import { Facebook, Instagram, Twitter, BadgeCent, Music } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/artindex.png";

export default function Footer() {
  return (
    <footer className="max-w-[1500px] mx-auto border-t border-gray-200 mt-12">
      {/* Main Footer Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* About Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About Us</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/about" className="hover:text-gray-900 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Partnerships */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Partnerships</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/partnerships" className="hover:text-gray-900 transition-colors">
                Partnerships
                </a>
              </li>
              {/* <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Art Index for Museums
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Art Index for Auctions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Art Index for Fairs
                </a>
              </li> */}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Visit our Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Buying on Art Index
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Logo and Legal Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-gray-500 text-sm">
              <Image
                src={logo}
                alt="ArtIndex Logo"
                width={120}
                height={120}
                className="rounded"
              />
              <p>© 2025 Art Index</p>
              <a href="#" className="hover:underline">Terms and Conditions</a>
              <a href="#" className="hover:underline">Auction Supplement</a>
              <a href="#" className="hover:underline">Buyer Guarantee</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Security</a>
              <a href="#" className="hover:underline">Do not sell my personal information</a>
              <a href="#" className="hover:underline">Theme</a>
            </div>

            {/* Social Media Icons */}
            {/* <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <BadgeCent size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Music size={20} />
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}