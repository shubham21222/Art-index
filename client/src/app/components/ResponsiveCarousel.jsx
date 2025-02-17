'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import Lucide icons
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
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

  useEffect(() => {
    const swiperEl = document.querySelector('.swiper-container');
    if (swiperEl && swiperEl.swiper) {
      if (isHovering) {
        swiperEl.swiper.autoplay.stop();
      } else {
        swiperEl.swiper.autoplay.start();
      }
    }
  }, [isHovering]);

  return (
    <div 
      className="relative overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Swiper Carousel */}
      <Swiper
        effect={'fade'}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        modules={[Navigation, Autoplay, EffectFade]}
        className="swiper-container"
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        speed={1000}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-[500px] md:h-[600px] overflow-hidden">
              {/* Background Image with Gradient Overlay */}
              <div className="absolute inset-0 w-full h-full">
                <motion.div
                  initial={{ scale: 1.1 }}
                  animate={{ 
                    scale: activeIndex === index ? 1 : 1.1,
                    filter: activeIndex === index ? 'blur(0px)' : 'blur(5px)'
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 flex flex-col justify-center h-full w-full px-8 md:px-16 lg:px-24">
                <div className="max-w-2xl mx-auto"> {/* Added mx-auto for centering */}
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ 
                          duration: 0.8,
                          staggerChildren: 0.1,
                        }}
                      >
                       
                        
                        <motion.h2
                          className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight text-center" // Centered text
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {slide.title}
                        </motion.h2>

                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '40%' }}
                          transition={{ duration: 0.8 }}
                          className="h-[3px] bg-blue-500 mb-6 mx-auto" // Centered line
                        />
                        
                        <motion.p
                          className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg mx-auto text-center" // Centered text
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          {slide.description}
                        </motion.p>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex justify-center" // Centered button
                        >
                          <button
                            className="group relative overflow-hidden rounded-lg bg-blue-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/30"
                          >
                            <span className="relative z-10">{slide.buttonText}</span>
                            <span className="absolute inset-0 -translate-y-full bg-blue-800 transition-transform duration-300 group-hover:translate-y-0"></span>
                            <span className="absolute inset-0 translate-y-full bg-blue-400 transition-transform duration-300 group-hover:translate-y-0"></span>
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows with Lucide Icons */}
      <button className="swiper-button-prev w-12 h-12 flex items-center justify-center ">
        <ChevronLeft size={24} className="text-white group-hover:scale-110 transition-transform duration-200" />
      </button>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
        <button className="swiper-button-next w-12 h-12 flex items-center justify-center ">
          <ChevronRight size={24} className="text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Interactive Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const swiper = document.querySelector('.swiper-container').swiper;
              swiper.slideTo(index + 1);
            }}
            className="group flex flex-col items-center"
          >
            <span 
              className={`block h-1 w-6 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-white w-12' 
                  : 'bg-white/30 group-hover:bg-white/50'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};


export default Carousel;