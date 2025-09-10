'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  X,
  Heart
} from 'lucide-react';

export default function ArtworkImage({ artwork }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    if (!artwork || !artwork.image) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                    <p className="text-gray-500 mb-2">No image available</p>
                    <p className="text-sm text-gray-400">Image not found for this artwork</p>
                </div>
            </div>
        );
    }

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            setIsFullscreen(false);
            setIsZoomed(false);
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl overflow-hidden'}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onKeyDown={handleKeyPress}
            tabIndex={0}
        >
            {/* Main Image Container */}
            <div className="relative w-full h-full overflow-hidden bg-white">
                <motion.img
                    ref={imageRef}
                    src={artwork.image.large || artwork.image.small}
                    alt={artwork.title || 'Artwork'}
                    className={`w-full h-full object-contain transition-transform duration-300 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                    onClick={toggleZoom}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Like Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors ${
                        isLiked 
                            ? 'bg-red-500 text-white' 
                            : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>

                {/* Action Controls */}
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleZoom}
                                className="p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                            >
                                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleFullscreen}
                                className="p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fullscreen Close Button */}
            {isFullscreen && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                        document.exitFullscreen();
                        setIsFullscreen(false);
                    }}
                    className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </motion.button>
            )}
        </div>
    );
}
