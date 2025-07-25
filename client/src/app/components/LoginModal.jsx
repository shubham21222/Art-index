"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, googleLogin, forgotPassword } from "@/redux/features/authSlice";
import { toast } from "react-hot-toast";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import logo from "../../../public/artindex2.png";

export default function LoginModal({ isOpen, onClose, onOpenSignUp }) {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    useEffect(() => {
        // Check for Google auth token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            handleGoogleLogin(token);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!formData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(login({
                email: formData.email,
                password: formData.password
            })).unwrap();
            
            toast.success(result.message || 'Login successful!');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (token) => {
        setLoading(true);
        try {
            const result = await dispatch(googleLogin(token)).unwrap();
            toast.success(result.message || 'Google login successful!');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const initiateGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/googleAuth/google`;
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setForgotPasswordLoading(true);
        try {
            const result = await dispatch(forgotPassword(forgotPasswordEmail)).unwrap();
            toast.success(result.message || 'Password reset email sent successfully!');
            setShowForgotPassword(false);
            setForgotPasswordEmail('');
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300]">
            <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center mb-8">
                    <Image
                        src={logo}
                        alt="ArtIndex Logo"
                        width={60}
                        height={60}
                        className="mb-4"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>
                        <button 
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-black hover:underline font-medium"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={initiateGoogleLogin}
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <FaGoogle className="h-5 w-5 mr-2" />
                            Google
                        </button>
                        {/* <button
                            type="button"
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <FaFacebook className="h-5 w-5 mr-2" />
                            Facebook
                        </button> */}
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={() => {
                            onClose();
                            onOpenSignUp();
                        }}
                        className="text-black hover:underline font-medium"
                    >
                        Sign up
                    </button>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[400]">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] relative shadow-2xl">
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setForgotPasswordEmail('');
                            }}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col items-center mb-8">
                            <Image
                                src={logo}
                                alt="ArtIndex Logo"
                                width={60}
                                height={60}
                                className="mb-4"
                            />
                            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-gray-500 text-sm mt-2">Enter your email to receive reset instructions</p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                    disabled={forgotPasswordLoading}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={forgotPasswordLoading}
                                className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                            >
                                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordEmail('');
                                }}
                                className="text-black hover:underline font-medium"
                            >
                                Back to login
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}