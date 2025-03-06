"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const slides = [
        {
            image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6pzQaRA5WB8-XtHWuAW4RA%2Fmain.jpg&width=1270",
            title: "FOG Design+Art",
            description: "San Francisco's annual fair for art and design is back for its 11th edition.",
            buttonText: "Explore Fair",
        },
        {
            image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=1270",
            title: "Modern Art Fair",
            description: "A unique exhibition featuring works from modern artists.",
            buttonText: "Learn More",
        },
        {
            image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPa-fblR2j-r-B_eSfm4ang%2Fmain.jpg&width=1270",
            title: "Contemporary Showcase",
            description: "Explore the finest contemporary art pieces.",
            buttonText: "Discover More",
        },
    ];

    // Navigation handlers
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    // Auto-rotation effect
    useEffect(() => {
        if (!isHovering) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
            }, 4000); // Rotate every 4 seconds
            return () => clearInterval(interval);
        }
    }, [isHovering, slides.length]);

    // Calculate holographic prism positions
    const getSlideStyle = (index) => {
        const offset = index - currentIndex;
        const translateY = offset * 200; // Vertical spacing
        const translateX = offset * 100; // Asymmetrical horizontal shift
        const rotateZ = offset * 5; // Slight tilt for prism effect
        const scale = 1 - Math.abs(offset) * 0.15; // Scale down as it moves away
        const opacity = 1 - Math.abs(offset) * 0.25; // Fade as it moves away
        const zIndex = slides.length - Math.abs(offset); // Closer slides on top

        return {
            transform: `translateY(${translateY}px) translateX(${translateX}px) rotateZ(${rotateZ}deg) scale(${scale})`,
            opacity: Math.max(opacity, 0),
            zIndex,
            transition: "transform 0.8s ease, opacity 0.8s ease",
            position: "absolute",
            top: "50%",
            left: "50%",
            transformOrigin: "center center",
            marginLeft: "-450px", // Half of slide width (900px / 2)
            marginTop: "-250px", // Half of slide height (500px / 2)
        };
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-12 overflow-hidden relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Holographic Background Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-cyan-900/10 blur-3xl"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Header */}
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-6xl font-extrabold text-white mb-12 text-center tracking-tight z-10 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
                Art Prism
            </motion.h1>

            {/* Holographic Prism Carousel */}
            <div className="relative w-full h-[700px] perspective-[1200px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    {slides.map((slide, index) => (
                        <motion.div
                            key={index}
                            style={getSlideStyle(index)}
                            className="group w-[900px] h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            whileHover={{ rotateZ: 0, scale: 1.05, transition: { duration: 0.3 } }}
                        >
                            <div className="relative w-full h-full">
                                {/* Holographic Image */}
                                <motion.div
                                    className="absolute inset-0"
                                    animate={{
                                        scale: currentIndex === index ? 1.1 : 1,
                                        filter: currentIndex === index ? "blur(0px)" : "blur(2px)",
                                    }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        width={900} // Increased width
                                        height={500}
                                        className="object-cover w-full h-full transition-transform duration-500"
                                    />
                                </motion.div>

                                {/* Holographic Glow */}
                                <div className="absolute inset-0 border-4 border-transparent group-hover:border-cyan-400/50 transition-all duration-500 rounded-3xl shadow-[0_0_25px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"></div>

                                {/* Floating Content Panel */}
                                <motion.div
                                    className="absolute bottom-8 left-8 right-8 bg-black/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/10 z-10"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{
                                        opacity: currentIndex === index ? 1 : 0.6,
                                        y: currentIndex === index ? 0 : 20,
                                    }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <motion.h2
                                        className="text-4xl font-bold text-white mb-3 tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <motion.p
                                        className="text-lg text-gray-200 mb-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        {slide.description}
                                    </motion.p>
                                    <motion.button
                                        className="relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 text-white font-semibold shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, delay: 0.6 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {slide.buttonText}
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-1/2 top-4 transform -translate-x-1/2 bg-black/50 p-3 rounded-full shadow-lg z-20 transition-all duration-300 hover:bg-cyan-500/50 hover:scale-110"
                >
                    <ChevronUp size={28} className="text-white" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute left-1/2 bottom-4 transform -translate-x-1/2 bg-black/50 p-3 rounded-full shadow-lg z-20 transition-all duration-300 hover:bg-cyan-500/50 hover:scale-110"
                >
                    <ChevronDown size={28} className="text-white" />
                </button>
            </div>

            {/* Indicators */}
            <div className="flex justify-center mt-8 space-x-4 z-10">
                {slides.map((_, index) => (
                    <motion.div
                        key={index}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-500 ${
                            index === currentIndex ? "bg-cyan-500 scale-150" : "bg-white/20"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        whileHover={{ scale: 1.2 }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;