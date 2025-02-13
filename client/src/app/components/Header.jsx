'use client'
import { Search, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component
import logo from "../../../public/artindex2.png"; // Ensure this path is correct

export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll event to toggle glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header
            className={`w-full border-b transition-all duration-300 ${
                isScrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-white"
            } sticky top-0 z-50`}
        >
            <nav className="mx-auto flex flex-col items-center justify-between h-auto">
                {/* Row 1: Logo and Search Bar */}
                <div className="w-full flex items-center justify-between py-1 gap-3">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center text-xl font-bold">
                            {/* Use the Image component for the logo */}
                            <Image
                                src={logo} // Pass the imported logo
                                alt="ArtIndex Logo" // Add an appropriate alt text
                                width={100} // Set the width (adjust as needed)
                                height={100} // Set the height (adjust as needed)
                                className="rounded" // Optional: Add styling if needed
                            />
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 hidden lg:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by artist, gallery, style, theme, tag, etc."
                                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" size={16} />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/collect" className="hover:text-blue-700">Buy</Link>
                        {/* <Link href="/sell" className="hover:text-blue-700">Sell</Link> */}
                        <Link href="/price-database" className="hover:text-blue-700">Price Database</Link>
                        <Link href="/editorial" className="hover:text-blue-700">Editorial</Link>
                    </div>

                    {/* Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <button className="btn2 hover:text-white hover:bg-blue-800 border border-black rounded-full px-4 py-1 text-sm font-medium">Log In</button>
                        <button className="bg-black text-white rounded-full hover:bg-blue-800 px-4 py-1 text-sm font-medium">Sign Up</button>
                    </div>

                    {/* Hamburger Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button onClick={toggleMobileMenu} className="p-2">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Row 2: Secondary Links (Desktop View) */}
                <div className="hidden px-6 lg:flex w-full flex-wrap items-center justify-between py-1 text-md font-medium">
                    <div className="flex items-center space-x-6">
                        <Link href="/collection/new-this-week" className="hover:text-blue-700">What's New</Link>
                        <Link href="/artists" className="hover:text-blue-700">Artists</Link>
                        <Link href="/collect" className="hover:text-blue-700">Artworks</Link>
                        <Link href="/auctions" className="hover:text-blue-700">Auctions</Link>
                        <Link href="/viewing-rooms" className="hover:text-blue-700">Viewing Rooms</Link>
                        <Link href="/galleries" className="hover:text-blue-700">Galleries</Link>
                        <Link href="/art-fairs" className="hover:text-blue-700">Fairs & Events</Link>
                        <Link href="/shows" className="hover:text-blue-700">Shows</Link>
                        <Link href="/institutions" className="hover:text-blue-700">Museums</Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="w-full bg-white border-t lg:hidden">
                        <div className="px-4 py-2">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Primary Links */}
                                <Link href="/buy" className="hover:text-blue-700">Buy</Link>
                                <Link href="/sell" className="hover:text-blue-700">Sell</Link>
                                <Link href="/price-database" className="hover:text-blue-700">Price Database</Link>
                                <Link href="/editorial" className="hover:text-blue-700">Editorial</Link>

                                {/* Secondary Links */}
                                <Link href="/collection/new-this-week" className="hover:text-blue-700">What's New</Link>
                                <Link href="/artists" className="hover:text-blue-700">Artists</Link>
                                <Link href="/artworks" className="hover:text-blue-700">Artworks</Link>
                                <Link href="/auctions" className="hover:text-blue-700">Auctions</Link>
                                <Link href="/viewing-rooms" className="hover:text-blue-700">Viewing Rooms</Link>
                                <Link href="/galleries" className="hover:text-blue-700">Galleries</Link>
                                <Link href="/fairs-events" className="hover:text-blue-700">Fairs & Events</Link>
                                <Link href="/shows" className="hover:text-blue-700">Shows</Link>
                                <Link href="/museums" className="hover:text-blue-700">Museums</Link>
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <button className="border border-black rounded-full px-4 py-1 text-sm font-medium w-full">Log In</button>
                                <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-medium w-full">Sign Up</button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}