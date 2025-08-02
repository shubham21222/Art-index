'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { BASE_URL } from '../../config/baseUrl';

const PartnershipForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        partnershipType: '',
        termsAccepted: false
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${BASE_URL}/partnership/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Partnership request submitted successfully! You will receive a confirmation email shortly.');
                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    location: '',
                    partnershipType: '',
                    termsAccepted: false
                });
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Form Section */}
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
                <Card className="w-full max-w-2xl p-8 shadow-2xl border border-gray-200">
                    <CardContent className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partner with Us</h2>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {success}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Input 
                                        type="text" 
                                        placeholder="First Name" 
                                        className="w-full bg-white border-gray-200 focus:border-gray-900"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        required
                                    />
                                    <Input 
                                        type="text" 
                                        placeholder="Last Name" 
                                        className="w-full bg-white border-gray-200 focus:border-gray-900"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        className="w-full bg-white border-gray-200 focus:border-gray-900"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                    <Input 
                                        type="tel" 
                                        placeholder="Phone Number" 
                                        className="w-full bg-white border-gray-200 focus:border-gray-900"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Select onValueChange={(value) => handleInputChange('location', value)}>
                                <SelectTrigger className="bg-white border-gray-200 focus:border-gray-900">
                                    <SelectValue placeholder="Location (Select...)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us">United States</SelectItem>
                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                    <SelectItem value="ca">Canada</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-900">Why do you want to partner with Art Index?</Label>
                                <Select onValueChange={(value) => handleInputChange('partnershipType', value)}>
                                    <SelectTrigger className="bg-white border-gray-200 focus:border-gray-900">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auctions">For Auctions</SelectItem>
                                        <SelectItem value="fairs">For Fairs</SelectItem>
                                        <SelectItem value="museums">For Museums</SelectItem>
                                        <SelectItem value="galleries">For Galleries</SelectItem>
                                        <SelectItem value="sponsors">For Sponsors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-start space-x-2 pt-4">
                                <Checkbox 
                                    id="terms" 
                                    className="mt-1"
                                    checked={formData.termsAccepted}
                                    onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                                />
                                <Label htmlFor="terms" className="text-sm text-gray-600">
                                    I agree to Art Index{' '}
                                    <a href="#" className="text-gray-900 underline hover:text-gray-700">
                                        Terms of Use
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-gray-900 underline hover:text-gray-700">
                                        Privacy Policy
                                    </a>
                                    , and to receive emails from Artsy.
                                </Label>
                            </div>

                            <Button 
                                type="submit"
                                disabled={loading || !formData.termsAccepted}
                                className="w-full bg-black hover:bg-gray-900 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Request Partnership'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default PartnershipForm;