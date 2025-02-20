'use client';

import { useState } from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion
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

    const headingVariants = {
        hidden: { opacity: 0, y: -50 }, // Start off-screen and invisible
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1, ease: 'easeOut' } // Smooth transition
        },
    };

    return (
        <>
            <Header />

            {/* Animated Heading Section */}
            <motion.div
                className="flex justify-center items-center min-h-[30vh] bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                variants={headingVariants} // Apply animation variants
                initial="hidden" // Start in the hidden state
                animate="visible" // Animate to the visible state
            >
                <motion.h1
                    className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 drop-shadow-lg"
                    variants={headingVariants}
                >
                    Join the leading global platform for buying and selling art.
                </motion.h1>
            </motion.div>

            {/* Form Section */}
            <div className="flex justify-center items-center  bg-gray-100 p-4">
                <Card className="w-full max-w-md p-6 shadow-lg">
                    <CardContent className="space-y-4">
                        <Input type="text" placeholder="First Name" className="w-full" />
                        <Input type="text" placeholder="Last Name" className="w-full" />
                        <Input type="email" placeholder="Email Address" className="w-full" />
                        <Input type="tel" placeholder="Phone Number" className="w-full" />

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Location (Select...)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label className="text-sm pt-4">Why do you want to partner with Artsy?</Label>
                        <Select onValueChange={(value) => setSelectedPartnership(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auctions">For Auctions</SelectItem>
                                <SelectItem value="fairs">For Fairs</SelectItem>
                                <SelectItem value="museums">For Museums</SelectItem>
                                <SelectItem value="galleries">For Galleries</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="terms" />
                            <Label htmlFor="terms" className="text-sm">
                                I agree to Art Index{' '}
                                <a href="#" className="text-blue-500 underline">
                                    Terms of Use
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-blue-500 underline">
                                    Privacy Policy
                                </a>
                                , and to receive emails from Artsy.
                            </Label>
                        </div>

                        <Button className="w-full">Request a Quote</Button>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    );
};

export default PartnershipForm;