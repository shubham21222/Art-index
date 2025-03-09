'use client';

import Image from "next/image";
import FeaturedSection from "./featuredArticles";
import CuratorsPicks from "./CuratorsPicks";
import AuctionCarousel from "./AuctionItems";
import CurrentFairs from "./CurrentFairs";
import FeaturedGalleries from "./FeaturedGalleries";
import TrendingArtists from "./TrendingArtists";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Renamed component to MainContent
const MainContent = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2, // Slightly higher threshold for smoother trigger
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Reduced stagger for smoother sequence
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20, // Slight upward movement for smooth entry
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6, // Smooth, moderate duration
        ease: "easeInOut", // Smooth in and out
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <FeaturedSection />
      </motion.div>
      <motion.div variants={itemVariants}>
        <CuratorsPicks />
      </motion.div>
      <motion.div variants={itemVariants}>
        <AuctionCarousel />
      </motion.div>
      <motion.div variants={itemVariants}>
        <CurrentFairs />
      </motion.div>
      <motion.div variants={itemVariants}>
        <FeaturedGalleries />
      </motion.div>
      <motion.div variants={itemVariants}>
        <TrendingArtists />
      </motion.div>
    </motion.div>
  );
};

export default MainContent;