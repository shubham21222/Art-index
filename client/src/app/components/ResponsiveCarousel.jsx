'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import 'swiper/css/scrollbar';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index

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

  return (
    <div className="relative">
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
        loop={true} // Enable infinite loop
        // scrollbar={{ hide: false }} // Hide scrollbar
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // Update active index
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col md:flex-row items-center justify-center h-[400px] md:h-[500px] bg-gray-100">
              {/* Image on the left */}
              <div className="w-full md:w-1/2 h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content on the right */}
              <div className="w-full md:w-1/2 md:ml-[100px] ml-0 p-6 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{slide.title}</h2>
                <p className="text-gray-700 mb-6">{slide.description}</p>
                <button className="bg-blue-800 btn text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-300">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Lines (indicators) below the carousel */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-[1px] w-[300px] rounded-full transition-colors duration-300 ${
              index === activeIndex ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;