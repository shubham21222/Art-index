'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Carousel = () => {
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

  return (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Holographic Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-cyan-900/10 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Carousel */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        effect="fade"
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination, EffectFade]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        className="h-screen w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <motion.div
              className="relative h-full w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                width={1270}
                height={500}
                className="object-cover w-full h-full"
                priority={index === 0} // Priority for first slide only
              />

              {/* Content Overlay */}
              <motion.div
                className="absolute bottom-12 left-12 right-12 bg-black/70 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h2
                  className="text-4xl font-bold text-white mb-3 tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-200 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {slide.description}
                </motion.p>
                <motion.button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 text-white font-semibold rounded-full shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {slide.buttonText}
                </motion.button>
              </motion.div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;