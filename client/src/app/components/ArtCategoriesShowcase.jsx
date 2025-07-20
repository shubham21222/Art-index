'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Camera, Brush, Box } from 'lucide-react';

const ArtCategoriesShowcase = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 1,
      name: "Old Masters",
      description: "Explore cutting-edge contemporary artworks from emerging and established artists",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6pzQaRA5WB8-XtHWuAW4RA%2Fmain.jpg&width=600",
      icon: Palette,
      link: "/galleries/old-masters"
    },
    {
      id: 2,
      name: "Photography",
      description: "Discover stunning photographic works capturing moments in time",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=600",
      icon: Camera,
      link: "/galleries/photography"
    },
    {
      id: 3,
      name: "Modern Art",
      description: "Experience the evolution of modern artistic expression",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPa-fblR2j-r-B_eSfm4ang%2Fmain.jpg&width=600",
      icon: Brush,
      link: "/galleries/modern"
    },
    {
      id: 4,
      name: "Sculpture",
      description: "Three-dimensional artworks that bring space and form to life",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=600",
      icon: Box,
      link: "/galleries/emerging-art"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Explore Art Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover diverse artistic expressions across different mediums and styles
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={category.link}>
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Icon */}
                      <div className="absolute top-4 right-4">
                        <div className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg group-hover:bg-white transition-all duration-300">
                          <IconComponent className="w-6 h-6 text-black" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* CTA Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                          Explore Collection
                        </span>
                        <motion.div
                          className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowRight className="w-4 h-4 text-black" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/galleries">
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ArtCategoriesShowcase; 