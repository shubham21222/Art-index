'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Star, Calendar, MapPin } from 'lucide-react';

const FeaturedArtworksShowcase = () => {
  const [hoveredArtwork, setHoveredArtwork] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const featuredArtworks = [
    {
      id: 1,
      title: "Abstract Harmony",
      artist: "Sarah Chen",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6pzQaRA5WB8-XtHWuAW4RA%2Fmain.jpg&width=600",
      category: "Contemporary",
      year: "2024",
      location: "New York",
      rating: 4.8,
      reviews: 24,
      isNew: true,
      dimensions: "120 x 80 cm",
      medium: "Oil on Canvas"
    },
    {
      id: 2,
      title: "Urban Reflections",
      artist: "Marcus Rodriguez",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPa-fblR2j-r-B_eSfm4ang%2Fmain.jpg&width=600",
      category: "Modern",
      year: "2023",
      location: "Los Angeles",
      rating: 4.9,
      reviews: 31,
      isNew: false,
      dimensions: "100 x 70 cm",
      medium: "Acrylic on Canvas"
    },
    {
      id: 3,
      title: "Nature's Symphony",
      artist: "Emma Thompson",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FwwaLgcrlUyamFpiT6g_BRw%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=600",
      category: "Abstract",
      year: "2024",
      location: "London",
      rating: 4.7,
      reviews: 18,
      isNew: true,
      dimensions: "150 x 100 cm",
      medium: "Mixed Media"
    },
    {
      id: 4,
      title: "Digital Dreams",
      artist: "Alex Kim",
      artistImage: "https://d7hftxdivxxvm.cloudfront.net?height=60&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FP2PBzTmhDlq2AD7D6G9S5g%2Fwide.jpg&width=60",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=500&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=600",
      category: "Digital Art",
      year: "2024",
      location: "Tokyo",
      rating: 4.6,
      reviews: 42,
      isNew: false,
      dimensions: "80 x 60 cm",
      medium: "Digital Print"
    }
  ];

  const toggleFavorite = (artworkId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(artworkId)) {
        newFavorites.delete(artworkId);
      } else {
        newFavorites.add(artworkId);
      }
      return newFavorites;
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-4">
            <Star className="w-4 h-4 text-black mr-2" />
            <span className="text-sm font-medium text-black">Featured Collection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Featured Artworks
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exceptional pieces from talented artists around the world
          </p>
        </motion.div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredArtworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
              onMouseEnter={() => setHoveredArtwork(artwork.id)}
              onMouseLeave={() => setHoveredArtwork(null)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200">
                {/* Image Container */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay with Actions */}
                  <AnimatePresence>
                    {hoveredArtwork === artwork.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                      >
                        <div className="flex space-x-4">
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                            onClick={() => toggleFavorite(artwork.id)}
                          >
                            <Heart 
                              className={`w-5 h-5 ${favorites.has(artwork.id) ? 'text-black fill-current' : 'text-black'}`} 
                            />
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                          >
                            <Eye className="w-5 h-5 text-black" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {artwork.isNew && (
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                        New
                      </span>
                    )}
                    {/* <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full">
                      {artwork.category}
                    </span> */}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Artist Info */}
                  <div className="flex items-center mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={artwork.artistImage}
                        alt={artwork.artist}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black">{artwork.artist}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 text-black mr-1" />
                        <span>{artwork.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{artwork.reviews} reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* Artwork Title */}
                  <h3 className="text-lg font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                    {artwork.title}
                  </h3>

                  {/* Artwork Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{artwork.year}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{artwork.location}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {artwork.dimensions} • {artwork.medium}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-end">
                    <motion.button
                      className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/collect">
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Artworks
              <Eye className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedArtworksShowcase; 