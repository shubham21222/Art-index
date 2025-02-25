'use client';
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo2.png";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";

export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const primaryLinks = [
        { name: "Artists", href: "/artists" },
    ];

    const secondaryLinks = [
        { name: "Fairs & Events", href: "/art-fairs" },
        { name: "Museums", href: "/institutions" },
        { name: "Auctions", href: "/auctions" },
        { name: "Shows", href: "/shows" },
        { name: "Buy", href: "/collect" },
        { name: "Galleries", href: "/galleries" },
        { name: "Artworks", href: "/collect" },
        { name: "Price Database", href: "/price-database" },

    ];

    return (
        <>
            <header
                className={`fixed top-2 left-0 right-0 z-[9999] transition-all duration-300 w-full max-w-screen-2xl mx-auto
                    ${isScrolled 
                        ? "bg-white/5 shadow-lg rounded-2xl md:rounded-full border md:border-white/18 md:backdrop-blur-2xl"
                        : ""
                    }`}
                style={{
                    padding: isScrolled
                        ? isMobile
                            ? "3px"
                            : "18px"
                        : isMobile
                            ? "5px"
                            : "20px",
                    boxShadow: isScrolled ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" : "none",
                    backdropFilter: isScrolled ? "blur(20px)" : "none",
                    WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
                }}
            >
                <div className="container mx-auto px-6">
                    <nav className="flex flex-col">
                        <div className="flex items-center justify-between">
                            {/* Empty div for mobile layout balance */}
                            <div className="w-10 lg:hidden"></div>

                            {/* Logo - Centered on mobile, left-aligned on desktop */}
                            <div className="flex-1 lg:flex-initial flex justify-center lg:justify-start">
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src={logo}
                                        alt="Logo"
                                        width={60}
                                        height={10}
                                        className="h-10 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex lg:items-center lg:space-x-8 flex-1 ml-10">
                                {/* Primary Links */}
                                <div className="flex items-baseline space-x-8">
                                    {primaryLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`text-sm font-medium transition-colors duration-300
                                                ${isScrolled ? 'text-black' : 'text-gray-900'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Secondary Links */}
                                <div className="flex items-baseline space-x-6">
                                    {secondaryLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`text-sm font-medium transition-colors duration-300
                                                ${isScrolled ? 'text-black' : 'text-gray-700'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Search Bar */}
                                <div className="flex-1 mx-8 relative">
                                    <div className="relative rounded-full overflow-hidden bg-gray-100">
                                        <input
                                            type="text"
                                            placeholder="Search by artist, gallery, style, theme..."
                                            className="w-full border-none rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent"
                                        />
                                        <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" size={16} />
                                    </div>
                                </div>

                                {/* Auth Buttons */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="rounded-full px-4 py-2 text-sm font-medium border border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors duration-300"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className="rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Menu Button (Right) */}
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-gray-900"
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="lg:hidden mt-2 bg-white rounded-lg shadow-lg">
                                <div className="px-4 pt-2 pb-3 space-y-1">
                                    {/* Mobile Search */}
                                    <div className="relative rounded-md mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100"
                                        />
                                        <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" size={16} />
                                    </div>

                                    {/* Mobile Links */}
                                    {[...primaryLinks, ...secondaryLinks].map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

                                    {/* Mobile Auth Buttons */}
                                    <div className="pt-4 space-y-2">
                                        <button
                                            onClick={() => setIsLoginModalOpen(true)}
                                            className="w-full rounded-full px-4 py-2 text-sm font-medium border border-purple-600 text-purple-600 hover:bg-purple-50"
                                        >
                                            Log In
                                        </button>
                                        <button
                                            onClick={() => setIsSignUpModalOpen(true)}
                                            className="w-full rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Push content down */}
            <div className="h-24"></div>

            {/* Modals */}
            <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}