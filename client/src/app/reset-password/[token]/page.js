"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/redux/features/authSlice";
import { toast } from "react-hot-toast";
import Image from "next/image";
import logo from "../../../../public/artindex2.png";

export default function ResetPasswordPage({ params }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { token } = params;
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsValidToken(false);
            toast.error('Invalid reset token');
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetPassword = async (e) => {
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

        setLoading(true);
        try {
            const result = await dispatch(resetPassword({
                token: token,
                password: formData.password
            })).unwrap();
            
            toast.success(result.message || 'Password reset successfully!');
            router.push('/');
        } catch (error) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!isValidToken) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <Image
                            src={logo}
                            alt="ArtIndex Logo"
                            width={60}
                            height={60}
                            className="mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-900">Invalid Token</h2>
                        <p className="text-gray-500 text-sm mt-2 text-center">
                            The password reset link is invalid or has expired. Please request a new one.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors font-medium"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-[420px] shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src={logo}
                        alt="ArtIndex Logo"
                        width={60}
                        height={60}
                        className="mb-4"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter your new password</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="Enter your new password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="Confirm your new password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                        onClick={() => router.push('/')}
                        className="text-black hover:underline font-medium"
                    >
                        Back to login
                    </button>
                </p>
            </div>
        </div>
    );
} 