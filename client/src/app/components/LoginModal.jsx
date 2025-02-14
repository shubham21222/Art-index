"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image"; // Import the Image component
import logo from "../../../public/artindex2.png"; // Ensure this path is correct

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false); // State for Terms & Conditions checkbox

  // Function to handle form submission
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    if (!isChecked) {
      alert("Please accept the Terms and Conditions to proceed.");
      return;
    }
    // Perform login logic here (e.g., API call)
    console.log("Logging in with:", { email, password });
    onClose(); // Close the modal after successful login
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
          <DialogTitle className="text-lg font-semibold mt-3">Log in to your account</DialogTitle>
        </div>

        {/* Email Input */}
        <div className="mt-4">
          <Input
            type="email"
            placeholder="Email"
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="bg-black text-white rounded-full w-full mt-3 hover:bg-gray-800 transition-colors"
            onClick={handleLogin} // Handle login logic
          >
            Log In
          </Button>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <p className="text-xs text-gray-500">
            By logging in, you agree to Artsy’s{" "}
            <a href="#" className="underline text-gray-700 hover:text-black">Terms and Conditions</a> and{" "}
            <a href="#" className="underline text-gray-700 hover:text-black">Privacy Policy</a>.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-4 text-center justify-center">
          <span className="mx-2 text-gray-500 text-sm text-center">Or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" /> {/* Example icon for social login */}
          </Button>
          <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" /> {/* Example icon for social login */}
          </Button>
          <Button variant="outline" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" /> {/* Example icon for social login */}
          </Button>
        </div>

        {/* Forgot Password Link */}
        <p className="text-xs text-gray-500 text-center mt-4">
          <a href="#" className="underline text-gray-700 hover:text-black">Forgot your password?</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}