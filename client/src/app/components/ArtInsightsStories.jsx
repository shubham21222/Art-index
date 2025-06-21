'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, BookOpen, Palette, Camera, TrendingUp, MapPin } from 'lucide-react';

const ArtInsightsStories = () => {
  const [activeTab, setActiveTab] = useState('featured');

  const featuredArticles = [
    {
      id: 1,
      title: "The Evolution of Contemporary Art in the Digital Age",
      excerpt: "How technology is reshaping artistic expression and creating new mediums for creative exploration in the 21st century.",
      author: "Dr. Sarah Mitchell",
      authorImage: "https://d7hftxdivxxvm.cloudfront.net?height=40&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=40",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=300&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6pzQaRA5WB8-XtHWuAW4RA%2Fmain.jpg&width=400",
      category: "Contemporary",
      readTime: "8 min read",
      publishDate: "March 15, 2024",
      views: "2.4k"
    },
    {
      id: 2,
      title: "Photography as Fine Art: Breaking Traditional Boundaries",
      excerpt: "Exploring how photographers are pushing the boundaries of what constitutes fine art in modern galleries and museums.",
      author: "Marcus Chen",
      authorImage: "https://d7hftxdivxxvm.cloudfront.net?height=40&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=40",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=300&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPa-fblR2j-r-B_eSfm4ang%2Fmain.jpg&width=400",
      category: "Photography",
      readTime: "6 min read",
      publishDate: "March 12, 2024",
      views: "1.8k"
    },
    {
      id: 3,
      title: "The Rise of Digital Art and NFT Revolution",
      excerpt: "Understanding the impact of blockchain technology on art ownership and the democratization of digital art creation.",
      author: "Alexandra Kim",
      authorImage: "https://d7hftxdivxxvm.cloudfront.net?height=40&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FwwaLgcrlUyamFpiT6g_BRw%2Fwide.jpg&width=40",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=300&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=400",
      category: "Digital Art",
      readTime: "10 min read",
      publishDate: "March 10, 2024",
      views: "3.1k"
    }
  ];

  const artistSpotlights = [
    {
      id: 1,
      name: "Emma Rodriguez",
      specialty: "Abstract Expressionism",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FP2PBzTmhDlq2AD7D6G9S5g%2Fwide.jpg&width=200",
      story: "From corporate lawyer to full-time artist, Emma's journey explores themes of transformation and self-discovery through bold, emotional brushstrokes.",
      location: "New York, NY",
      followers: "12.5k"
    },
    {
      id: 2,
      name: "David Park",
      specialty: "Contemporary Sculpture",
      image: "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRYLtSPyYuHuL8P6xVaxK0g%2Fmain.jpg&width=200",
      story: "David's innovative use of recycled materials challenges our perception of waste and beauty, creating thought-provoking installations worldwide.",
      location: "Los Angeles, CA",
      followers: "8.9k"
    }
  ];

  const artTrends = [
    {
      id: 1,
      trend: "Sustainable Art Practices",
      description: "Artists embracing eco-friendly materials and processes",
      icon: TrendingUp,
      growth: "+45%"
    },
    {
      id: 2,
      trend: "Virtual Gallery Experiences",
      description: "Rise of immersive digital art exhibitions",
      icon: BookOpen,
      growth: "+67%"
    },
    {
      id: 3,
      trend: "Cross-Cultural Collaborations",
      description: "Artists from different backgrounds creating together",
      icon: Palette,
      growth: "+32%"
    }
  ];

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
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Art Insights & Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the latest trends, artist stories, and insights from the contemporary art world
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-full">
            {[
              { id: 'featured', label: 'Featured Articles', icon: BookOpen },
              { id: 'artists', label: 'Artist Spotlights', icon: User },
              { id: 'trends', label: 'Art Trends', icon: TrendingUp }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Featured Articles */}
          {activeTab === 'featured' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{article.publishDate}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{article.readTime}</span>
                      <span className="mx-2">•</span>
                      <span>{article.views} views</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
                          <Image
                            src={article.authorImage}
                            alt={article.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-black">{article.author}</span>
                      </div>
                      <motion.button
                        className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowRight className="w-4 h-4 text-black" />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* Artist Spotlights */}
          {activeTab === 'artists' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {artistSpotlights.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 overflow-hidden"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{artist.name}</h3>
                      <p className="text-white/90 text-sm mb-2">{artist.specialty}</p>
                      <div className="flex items-center text-white/80 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{artist.location}</span>
                        <span className="mx-2">•</span>
                        <span>{artist.followers} followers</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {artist.story}
                    </p>
                    <motion.button
                      className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Artist Profile
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Art Trends */}
          {activeTab === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {artTrends.map((trend, index) => {
                const IconComponent = trend.icon;
                return (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 p-8 text-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-200 transition-colors">
                      <IconComponent className="w-8 h-8 text-black" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-black mb-3">{trend.trend}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {trend.description}
                    </p>
                    
                    <div className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-semibold rounded-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {trend.growth} Growth
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/art-news">
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore More Content
              <BookOpen className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ArtInsightsStories; 