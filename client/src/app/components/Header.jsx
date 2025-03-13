'use client';
import { Search, User, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo2.png";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout } from "@/redux/features/authSlice";
import toast from 'react-hot-toast';

export default function Header() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
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
        { name: "Fairs & Events", href: "/art-fairs" },
        { name: "Museums", href: "/institutions" },
    ];

    const mainSecondaryLinks = [];
    const subSecondaryLinks = [
        { name: "Shows", href: "/shows" },
        { name: "Buy", href: "/collect" },
        { name: "Galleries", href: "/galleries" },
        { name: "Artworks", href: "/collect" },
        { name: "Price Database", href: "/price-database" },
    ];

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error(error.message || 'Logout failed');
        }
    };

    return (
        <>
            {/* Main Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                    isScrolled 
                        ? "bg-white shadow-md" 
                        : "bg-transparent"
                }`}
            >
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-between">
                        {/* Left Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            {primaryLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Centered Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <Link href="/">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    width={100}
                                    height={40}
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>

                        {/* Right Side - Main Secondary Links + Auth */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6">
                                {mainSecondaryLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <button className="p-2 hidden md:block">
                                <Search className="h-5 w-5 text-gray-900" />
                            </button>
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <User className="w-5 h-5" />
                                        <span className="text-sm">{user?.name}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="flex items-center space-x-2"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="hidden md:block text-sm font-medium text-gray-900 hover:text-gray-600"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className="hidden md:block text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-900" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-900" />
                                )}
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Secondary Header */}
            <div
                className={`fixed top-[69px] left-0 right-0 z-30 transition-all duration-300 ${
                    isScrolled 
                        ? "bg-gray-50/95 shadow-sm" 
                        : "bg-gray-100/95"
                }`}
            >
                <div className="container mx-auto px-4 py-2">
                    <div className="hidden md:flex justify-center space-x-8">
                        {subSecondaryLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2 relative group"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-[72px] left-0 right-0 z-20 bg-white py-4 shadow-lg">
                    <div className="container mx-auto px-4 space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full border rounded-md px-4 py-2 text-sm"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        </div>
                        {[...primaryLinks, ...mainSecondaryLinks, ...subSecondaryLinks].map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-sm font-medium text-gray-900 hover:text-gray-600 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="space-y-2 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-2 py-2">
                                        <User className="w-5 h-5" />
                                        <span className="text-sm">{user?.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="w-full text-sm font-medium text-gray-900 py-2"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUpModalOpen(true)}
                                        className="w-full text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Push content down */}
            <div className="h-36 md:h-28"></div>

            {/* Modals */}
            <SignUpModal 
                isOpen={isSignUpModalOpen} 
                onClose={() => setIsSignUpModalOpen(false)}
                onOpenLogin={() => {
                    setIsSignUpModalOpen(false);
                    setIsLoginModalOpen(true);
                }}
            />
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)}
                onOpenSignUp={() => {
                    setIsLoginModalOpen(false);
                    setIsSignUpModalOpen(true);
                }}
            />
        </>
    );
}