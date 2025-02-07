import { Facebook, Instagram, Twitter, BadgeCent, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
        {/* About Us */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">About us</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Jobs</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Press</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Resources</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900 transition-colors">Open Source</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">The Art Genome Project</a></li>
          </ul>
        </div>

        {/* Partnerships */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Partnerships</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900 transition-colors">Artsy for Galleries</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Artsy for Museums</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Artsy for Auctions</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Artsy for Fairs</a></li>
          </ul>
        </div>

        {/* Support & Apps */}
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Visit our Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Buying on Artsy</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Get the App</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">iOS App</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Android App</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-gray-500 text-sm text-center sm:text-left">
            <span className="border px-2 py-1 text-xs font-semibold">A</span>
            <p>© 2025 Artsy</p>
            <a href="#" className="hover:underline">Terms and Conditions</a>
            <a href="#" className="hover:underline">Auction Supplement</a>
            <a href="#" className="hover:underline">Buyer Guarantee</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Security</a>
            <a href="#" className="hover:underline">Do not sell my personal information</a>
            <a href="#" className="hover:underline">Theme</a>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors"><BadgeCent size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors"><Music size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}