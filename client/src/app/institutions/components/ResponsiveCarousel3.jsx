'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import 'swiper/css/scrollbar';

const Carousel3 = () => {
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index

  const slides = [
    {
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=height&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F89SS-X2hYpJUKpuPXQdNlQ%2Fnormalized.jpg",
      title: "Connecting Myanmar",
      description: "Aung Myint",
      buttonText: "Follow",
    },
    {
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=height&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F_4UDb3ZJhoG6T0umuubcZg%2Fnormalized.jpg",
      title: "Ruth Borchard Collection",
      description: "Self-Portrait Prize 2023",
      buttonText: "Follow",
    },
    {
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=height&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6a3GNQWNslfwyKeAxRZ9vw%2Flarger.jpg",
      title: "Noguchi Museum",
      description: "Koho Yamamoto: Under a Dark Moon",
      buttonText: "Follow",
    },
  ];

  return (
    <div className="relative">
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
        loop={true} // Enable infinite loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // Update active index
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col md:flex-row items-center justify-center h-[400px] md:h-[500px]">
              {/* Image on the left */}
              <div className="w-full md:w-1/2 h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text content on the right */}
              <div className="w-full md:w-1/2 md:ml-[100px] ml-0 p-6 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl mb-4">{slide.title}</h2>
                <p className="text-gray-700 mb-6">{slide.description}</p>
                {/* <button className="bg-blue-800 btn text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-300">
                  {slide.buttonText}
                </button> */}
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
            className={`h-[1px] w-[30px] md:w-[300px] rounded-full transition-colors duration-300 ${index === activeIndex ? 'bg-black' : 'bg-gray-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel3;