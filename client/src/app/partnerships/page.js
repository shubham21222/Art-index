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

const PartnershipForm = () => {
    const [selectedPartnership, setSelectedPartnership] = useState('');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Form Section */}
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
                <Card className="w-full max-w-2xl p-8 shadow-2xl border border-gray-200">
                    <CardContent className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partner with Us</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input 
                                    type="text" 
                                    placeholder="First Name" 
                                    className="w-full bg-white border-gray-200 focus:border-gray-900" 
                                />
                                <Input 
                                    type="text" 
                                    placeholder="Last Name" 
                                    className="w-full bg-white border-gray-200 focus:border-gray-900" 
                                />
                            </div>
                            <div className="space-y-4">
                                <Input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    className="w-full bg-white border-gray-200 focus:border-gray-900" 
                                />
                                <Input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    className="w-full bg-white border-gray-200 focus:border-gray-900" 
                                />
                            </div>
                        </div>

                        <Select>
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
                            <Select onValueChange={(value) => setSelectedPartnership(value)}>
                                <SelectTrigger className="bg-white border-gray-200 focus:border-gray-900">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auctions">For Auctions</SelectItem>
                                    <SelectItem value="fairs">For Fairs</SelectItem>
                                    <SelectItem value="museums">For Museums</SelectItem>
                                    <SelectItem value="galleries">For Galleries</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-start space-x-2 pt-4">
                            <Checkbox id="terms" className="mt-1" />
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

                        <Button className="w-full bg-black hover:bg-gray-900 text-white py-6 text-lg">
                            Request a Quote
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default PartnershipForm;