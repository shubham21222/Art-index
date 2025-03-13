'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Carousel = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className="relative mt-2 w-full h-[60vh] sm:h-[50vh] md:h-[70vh] lg:h-[80vh] bg-black overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(147,51,234,0.2), rgba(59,130,246,0.2), rgba(6,182,212,0.2))",
            "linear-gradient(45deg, rgba(6,182,212,0.2), rgba(147,51,234,0.2), rgba(59,130,246,0.2))",
            "linear-gradient(45deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2), rgba(147,51,234,0.2))",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

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
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <motion.div
              className="relative h-full w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Image with Parallax Effect */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: isHovering ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </motion.div>

              {/* Content Overlay */}
              <motion.div
                className="absolute bottom-4 md:bottom-12 left-4 md:left-12 right-4 md:right-12 bg-black/70 backdrop-blur-md p-4 md:p-8 rounded-xl shadow-xl border border-white/10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl"
                  animate={{
                    opacity: isHovering ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.h2
                  className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  className="text-sm md:text-lg text-gray-200 mb-3 md:mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {slide.description}
                </motion.p>
                <motion.button
                  className="relative bg-gradient-to-r from-cyan-500 to-blue-500 px-4 md:px-6 py-2 text-white text-sm md:text-base font-semibold rounded-full shadow-lg overflow-hidden group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">{slide.buttonText}</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
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