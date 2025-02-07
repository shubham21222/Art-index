import { Facebook, Instagram, Twitter, BadgeCent, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className=" mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* About Us */}
        <div>
          <h3 className="font-semibold text-lg">About us</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li><a href="#">About</a></li>
            <li><a href="#">Jobs</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold text-lg">Resources</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li><a href="#">Open Source</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">The Art Genome Project</a></li>
          </ul>
        </div>

        {/* Partnerships */}
        <div>
          <h3 className="font-semibold text-lg">Partnerships</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li><a href="#">Artsy for Galleries</a></li>
            <li><a href="#">Artsy for Museums</a></li>
            <li><a href="#">Artsy for Auctions</a></li>
            <li><a href="#">Artsy for Fairs</a></li>
          </ul>
        </div>

        {/* Support & Apps */}
        <div>
          <h3 className="font-semibold text-lg">Support</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li><a href="#">Visit our Help Center</a></li>
            <li><a href="#">Buying on Artsy</a></li>
          </ul>
          <h3 className="font-semibold text-lg mt-4">Get the App</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li><a href="#">iOS App</a></li>
            <li><a href="#">Android App</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 py-6 px-6 flex flex-col md:flex-row justify-between items-center  mx-auto">
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
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
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-700"><Twitter size={20} /></a>
          <a href="#" className="hover:text-gray-700"><Facebook size={20} /></a>
          <a href="#" className="hover:text-gray-700"><Instagram size={20} /></a>
          <a href="#" className="hover:text-gray-700"><BadgeCent size={20} /></a>
          <a href="#" className="hover:text-gray-700"><Music size={20} /></a>
          </div>
      </div>
    </footer>
  );
}
