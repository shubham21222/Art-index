'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CalendarDays, 
  ExternalLink, 
  Newspaper, 
  TrendingUp, 
  Award,
  Palette 
} from 'lucide-react';

// Array of gradient classes for cards
const GRADIENT_CLASSES = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-blue-600',
  'bg-gradient-to-br from-rose-500 to-red-600',
  'bg-gradient-to-br from-teal-500 to-emerald-600',
  'bg-gradient-to-br from-fuchsia-500 to-purple-600',
  'bg-gradient-to-br from-cyan-500 to-blue-600',
];

// Get icon based on article content
const getArticleIcon = (title = '') => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('exhibition') || lowerTitle.includes('gallery')) {
    return <Palette className="w-6 h-6" />;
  } else if (lowerTitle.includes('award') || lowerTitle.includes('prize')) {
    return <Award className="w-6 h-6" />;
  } else if (lowerTitle.includes('market') || lowerTitle.includes('sale')) {
    return <TrendingUp className="w-6 h-6" />;
  }
  return <Newspaper className="w-6 h-6" />;
};

export default function FeaturedSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news articles');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Fetch news every 6 hours
    const interval = setInterval(fetchNews, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-[1500px] mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-6">
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Art News & Updates
        </h2>
        <span className="text-sm text-gray-500">Updated daily</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md bg-gray-100 p-6">
                <Skeleton className="h-6 w-6 rounded-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          : articles.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-lg transition-all duration-300 p-6 ${GRADIENT_CLASSES[index % GRADIENT_CLASSES.length]} hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="flex flex-col h-full text-white">
                  {/* Icon */}
                  <div className="mb-4">
                    {getArticleIcon(article.title)}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm mb-3 text-white/80">
                    <CalendarDays className="w-4 h-4" />
                    <time dateTime={new Date(article.pubDate).toISOString()}>
                      {new Date(article.pubDate).toLocaleDateString()}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold leading-tight mb-4 flex-grow">
                    {article.title}
                  </h3>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-sm text-white/80">{article.source}</span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </a>
            ))}
      </div>
    </section>
  );
}