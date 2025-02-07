"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import artworks from "@/data/artworks";

export default function CuratorsPicks() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0); // Track active slide index

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
        }
    };

    // Update activeIndex based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (carouselRef.current) {
                const scrollPosition = carouselRef.current.scrollLeft;
                const totalWidth = carouselRef.current.scrollWidth;
                const visibleWidth = carouselRef.current.clientWidth;

                // Determine which half of the carousel is active
                const index = scrollPosition > totalWidth / 2 - visibleWidth ? 1 : 0;
                setActiveIndex(index);
            }
        };

        const carouselElement = carouselRef.current;
        if (carouselElement) {
            carouselElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (carouselElement) {
                carouselElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <div className="px-6 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl">Curators Picks</h2>
                    <p className="text-gray-500 text-2xl">
                        The best works by rising talents on Artsy, all available now.
                    </p>
                </div>
                <a href="#" className="text-black text-sm font-medium hover:underline">
                    View All Works
                </a>
            </div>

            {/* Carousel with Buttons */}
            <div className="relative">
                {/* Left Button */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Artwork Carousel */}
                <div
                    ref={carouselRef}
                    className="overflow-x-auto scrollbar-hide pt-8 flex space-x-4 scroll-smooth px-2"
                >
                    {artworks.map((art) => (
                        <div key={art.id} className="group flex-shrink-0 flex flex-col justify-end min-w-[220px] p-2 rounded-md">
                            {/* Image */}
                            <div className="rounded-md overflow-hidden">
                                <Image
                                    src={art.image}
                                    alt={art.title}
                                    width={220}
                                    height={240}
                                    className="object-cover transition-transform duration-300 transform group-hover:scale-105"
                                />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold">{art.artist}</h3>

                            {/* Artwork Details */}
                            <div className="relative">
                                {/* Artwork Details */}
                                <p className="text-gray-500 italic text-xs">{art.title}, {art.year}</p>
                                <p className="text-gray-500 text-xs">{art.gallery}</p>

                                {/* Hover Buttons */}
                                <div className="absolute left-0 bottom-[1px] mt-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity duration-300 space-x-2 bg-white p-1 ">
                                    <button className="btn2 px-3 py-1 bg-black text-white text-xs font-medium rounded-md">
                                        Unique
                                    </button>
                                    <button className="btn2 px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md">
                                        Painting
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <p className="text-black font-medium">{art.price}</p>
                        </div>
                    ))}
                </div>

                {/* Right Button */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hidden md:flex"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Line Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
                {[0, 1].map((index) => (
                    <div
                        key={index}
                        className={`h-[1px] w-[300px] rounded-full transition-colors duration-300 ${index === activeIndex ? 'bg-black' : 'bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}