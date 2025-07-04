"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { register, googleLogin } from "@/redux/features/authSlice";
import { toast } from "react-hot-toast";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import logo from "../../../public/artindex2.png";

export default function SignUpModal({ isOpen, onClose, onOpenLogin }) {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

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

    const handleNextStep = () => {
        if (!formData.name || !formData.email) {
            toast.error('Please fill in all fields');
            return;
        }
        if (!formData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        setStep(2);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        if (!formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (!acceptedTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            })).unwrap();
            
            toast.success(result.message || 'Registration successful!');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Registration failed');
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
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-2">Join our art community today</p>
                </div>

                {step === 1 ? (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                                disabled={loading}
                            />
                        </div>

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

                        <button
                            onClick={handleNextStep}
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                        >
                            Next
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                disabled={loading}
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                I agree to the <a href="#" className="text-black hover:underline">Terms and Conditions</a>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSignUp}
                                disabled={loading}
                                className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}

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
                    Already have an account?{' '}
                    <button
                        onClick={() => {
                            onClose();
                            onOpenLogin();
                        }}
                        className="text-black hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}