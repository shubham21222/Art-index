"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Apple, Facebook, CircleDot } from "lucide-react";
import Image from "next/image"; // Import the Image component
import logo from "../../../public/artindex2.png"; // Ensure this path is correct

export default function SignUpModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: Name & Password
    const [email, setEmail] = useState("");
    const [name, setName] = useState(""); // State for Name
    const [password, setPassword] = useState("");

    // Function to handle back button
    const handleBack = () => {
        if (step === 2) {
            setStep(1); // Go back to the email step
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Modal Content */}
            <DialogContent className="max-w-md p-6 rounded-lg shadow-lg bg-white">
                {/* Header with Logo */}
                <div className="flex flex-col items-center justify-center mb-4">
                    <Image
                        src={logo} // Pass the imported logo
                        alt="ArtIndex Logo"
                        width={80}
                        height={80}
                        className=""
                    />
                    <DialogTitle className="text-lg font-semibold mt-3">
                        {step === 1 ? "Sign up or log in" : "Create an account"}
                    </DialogTitle>
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <div className="mt-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            className="bg-black text-white rounded-full w-full mt-3 hover:bg-gray-800 transition-colors"
                            onClick={() => setStep(2)} // Move to Step 2
                        >
                            Continue with Email
                        </Button>
                    </div>
                )}

                {/* Step 2: Name and Password Input */}
                {step === 2 && (
                    <div className="mt-4">
                        <p className="text-md text-gray-700 mb-2">Welcome to Art Index — Create an account</p>
                        <Input
                            type="text"
                            placeholder="Full Name"
                            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black mb-2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black mb-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mb-4">
                            Password must be at least 8 characters and include a lowercase letter, uppercase letter, and digit.
                        </p>
                        <Button className="bg-black text-white rounded-full w-full mt-3 hover:bg-gray-800 transition-colors">
                            Sign Up
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full mt-3 hover:bg-gray-100 transition-colors"
                            onClick={handleBack} // Go back to Step 1
                        >
                            Back
                        </Button>
                    </div>
                )}

                {/* Divider */}
                {step === 1 && (
                    <div className="relative flex items-center my-4 text-center justify-center">
                        <span className="mx-2 text-gray-500 text-sm text-center">Or continue with</span>
                    </div>
                )}

                {/* Social Login Buttons */}
                {step === 1 && (
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                            <Apple className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                            <CircleDot className="w-5 h-5" /> {/* Google */}
                        </Button>
                        <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                {/* Terms & Privacy */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    By clicking Sign Up or Continue with Email, Apple, Google, or Facebook, you agree to Artsy’s{" "}
                    <a href="#" className="underline text-gray-700 hover:text-black">Terms and Conditions</a> and{" "}
                    <a href="#" className="underline text-gray-700 hover:text-black">Privacy Policy</a>, and to receiving emails
                    from Artsy.
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                    This site is protected by reCAPTCHA and the{" "}
                    <a href="https://policies.google.com/privacy" className="underline text-gray-700 hover:text-black">
                        Google Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="https://policies.google.com/terms" className="underline text-gray-700 hover:text-black">
                        Terms of Service
                    </a>{" "}
                    apply.
                </p>
            </DialogContent>
        </Dialog>
    );
}