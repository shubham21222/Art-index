'use client';
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/artindex2.png";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";

export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
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

    const handleDropdown = (name) => {
        if (activeDropdown === name) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(name);
        }
    };

    const primaryLinks = [
        { name: "Buy", href: "/collect" },
        { name: "Price Database", href: "/price-database" },
        { name: "Editorial", href: "/articles" },
    ];

    const secondaryLinks = [
        { name: "Artists", href: "/artists" },
        { name: "Artworks", href: "/collect" },
        { name: "Auctions", href: "/auctions" },
        { name: "Galleries", href: "/galleries" },
        { name: "Fairs & Events", href: "/art-fairs" },
        { name: "Shows", href: "/shows" },
        { name: "Museums", href: "/institutions" },
    ];

    return (
        <>
            <header
                className={`fixed w-full  transition-all duration-500 z-50 
                ${isScrolled 
                    ? 'bg-black/60 backdrop-blur-md shadow-xl' 
                    : 'bg-white border-b'}`}
            >
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex flex-col">
                        {/* Primary navigation */}
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src={logo}
                                        alt="ArtIndex Logo"
                                        width={80}
                                        height={20}
                                        className={`transition-all duration-300 ${isScrolled ? 'brightness-0 invert' : ''}`}
                                    />
                                </Link>
                            </div>

                            {/* Desktop navigation */}
                            <div className="hidden lg:flex lg:items-center lg:justify-between lg:flex-1">
                                {/* Primary links */}
                                <div className="ml-10 flex items-baseline space-x-8">
                                    {primaryLinks.map((link) => (
                                        <Link 
                                            key={link.name}
                                            href={link.href}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300
                                            ${isScrolled
                                                ? 'text-white hover:bg-white/10'
                                                : 'text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Search bar */}
                                <div className="flex-1 mx-8 relative">
                                    <div className={`relative rounded-full overflow-hidden transition-all duration-300 ${isScrolled ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        <input
                                            type="text"
                                            placeholder="Search by artist, gallery, style, theme..."
                                            className={`w-full border-none rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2
                                            ${isScrolled 
                                                ? 'bg-transparent placeholder-white/70 text-white focus:ring-white/50' 
                                                : 'bg-transparent placeholder-gray-500 text-gray-900 focus:ring-black/30'
                                            }`}
                                        />
                                        <Search
                                            className={`absolute top-1/2 right-3 transform -translate-y-1/2 
                                            ${isScrolled ? 'text-white/70' : 'text-gray-500'}`}
                                            size={16}
                                        />
                                    </div>
                                </div>

                                {/* Auth buttons */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300
                                        ${isScrolled
                                            ? 'border border-white text-white hover:bg-white/10'
                                            : 'border border-black text-black hover:bg-gray-100'
                                        }`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300
                                        ${isScrolled
                                            ? 'bg-white text-black hover:bg-white/90'
                                            : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>

                            {/* Mobile menu button */}
                            <div className="lg:hidden">
                                <button 
                                    onClick={toggleMobileMenu}
                                    className={`p-2 rounded-md transition-colors duration-300
                                    ${isScrolled
                                        ? 'text-white hover:bg-white/10'
                                        : 'text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Secondary navigation - desktop */}
                        <div className={`hidden lg:block border-t transition-all duration-300 ${isScrolled ? 'border-white/10' : 'border-gray-200'}`}>
                            <div className="flex justify-center py-2">
                                <div className="flex space-x-6">
                                    {secondaryLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`text-sm font-medium transition-colors duration-300
                                            ${isScrolled
                                                ? 'text-white/90 hover:text-white'
                                                : 'text-gray-700 hover:text-black'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu, show/hide based on menu state */}
                        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 transition-colors duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-white'}`}>
                                {/* Mobile search */}
                                <div className="relative rounded-md mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className={`w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2
                                        ${isScrolled
                                            ? 'bg-white/10 border-white/20 placeholder-white/70 text-white focus:ring-white/50'
                                            : 'bg-gray-100 border-gray-200 placeholder-gray-500 text-gray-900 focus:ring-black/30'
                                        }`}
                                    />
                                    <Search
                                        className={`absolute top-1/2 right-3 transform -translate-y-1/2 ${isScrolled ? 'text-white/70' : 'text-gray-500'}`}
                                        size={16}
                                    />
                                </div>
                                
                                {/* Primary links + Secondary links */}
                                {[...primaryLinks, ...secondaryLinks].map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300
                                        ${isScrolled
                                            ? 'text-white hover:bg-white/10'
                                            : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                
                                {/* Mobile auth buttons */}
                                <div className="pt-4 pb-3 space-y-2">
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className={`w-full rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300
                                        ${isScrolled
                                            ? 'border border-white text-white hover:bg-white/10'
                                            : 'border border-black text-black hover:bg-gray-100'
                                        }`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className={`w-full rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300
                                        ${isScrolled
                                            ? 'bg-white text-black hover:bg-white/90'
                                            : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Push content down to account for fixed header */}
            <div className="lg:h-12 md:h-12 sm:h-12"></div>

            {/* Modals */}
            <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}