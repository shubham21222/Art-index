"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Eye, MousePointer } from "lucide-react";

const SponsorBanner = ({ placement, position = "middle", className = "" }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/sponsor-banner/active/${placement}?position=${position}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setBanner(data.data[0]); // Get the first active banner
          
          // Track impression
          if (data.data[0]._id) {
            fetch(`/api/sponsor-banner/track/impression/${data.data[0]._id}`, {
              method: 'POST',
            }).catch(console.error);
          }
        }
      } catch (error) {
        console.error("Error fetching sponsor banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [placement, position]);

  const handleClick = async () => {
    if (banner && banner._id) {
      try {
        // Track click
        await fetch(`/api/sponsor-banner/track/click/${banner._id}`, {
          method: 'POST',
        });
        
        // Open link in new tab
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error("Error tracking click:", error);
        // Still open the link even if tracking fails
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="h-32 bg-gray-300 rounded-lg"></div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className={`relative overflow-hidden rounded-lg shadow-lg bg-gradient-to-r from-gray-900 to-black ${className}`}>
        <div className="relative h-32 md:h-40">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          
          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Sponsored
                </span>
                <span className="text-xs opacity-80 text-gray-300">Your Banner Here</span>
              </div>
              
              <h3 className="text-lg font-semibold mb-1 text-white">
                Promote Your Art Business
              </h3>
              
              <p className="text-sm opacity-90 text-gray-300">
                Reach thousands of art enthusiasts and collectors. Get featured on our platform.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                onClick={() => window.open('/partnerships', '_blank')}
                size="sm"
                className="bg-white text-black hover:bg-gray-200 font-medium"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Want to advertise here?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/partnerships', '_blank')}
              className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Banner Image */}
      <div className="relative h-32 md:h-40">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        
        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                Sponsored
              </span>
              <span className="text-xs opacity-80 text-gray-300">by {banner.sponsorName}</span>
            </div>
            
            <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-white">
              {banner.title}
            </h3>
            
            <p className="text-sm opacity-90 line-clamp-2 text-gray-300">
              {banner.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              onClick={handleClick}
              size="sm"
              className="bg-white text-black hover:bg-gray-200 font-medium"
            >
              Visit Website
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            
            <div className="flex items-center gap-3 text-xs opacity-70 text-gray-300">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{banner.impressions?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3" />
                <span>{banner.clicks?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Us Button */}
      <div className="p-3 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Want to advertise here?
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/partnerships', '_blank')}
            className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorBanner; 