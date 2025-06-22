'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BASE_URL } from '../../../config/baseUrl';

export default function VerifyEmailPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const params = useParams();
    const token = params.token;

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`${BASE_URL}/auth/verify-email/${token}`, {
                    method: 'GET',
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess(true);
                } else {
                    setError(data.message || 'Email verification failed');
                }
            } catch (err) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    const handleCreatePassword = () => {
        // Redirect to password creation page with the same token
        router.push(`/create-password/${token}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                    {success ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Email Verified!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Your email has been successfully verified. You can now create your password to complete your account setup.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={handleCreatePassword}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Create Password
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Verification Failed
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {error || 'Something went wrong with email verification. Please try again or contact support.'}
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Go to Homepage
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 