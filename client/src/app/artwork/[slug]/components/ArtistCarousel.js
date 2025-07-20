'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Download,
  Share2,
  Heart
} from 'lucide-react';

export default function ArtistCarousel({ slug }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [zoomModalOpen, setZoomModalOpen] = useState(false);
    const [zoomModalImage, setZoomModalImage] = useState(null);
    const [zoomModalZoomed, setZoomModalZoomed] = useState(false);

    useEffect(() => {
        if (!slug) {
            console.log("Slug is not available yet.");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const artistResponse = await fetch("/api/artwork", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query ArtistDetailsQuery($slug: String!) {
                                artist(id: $slug) {
                                    artworks_connection: artworksConnection(first: 10, filter: IS_FOR_SALE, published: true) {
                                        edges {
                                            node {
                                                image {
                                                    large: url(version: "large")
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const artistResult = await artistResponse.json();
                if (artistResult.errors) {
                    console.error("GraphQL Errors (Artist):", artistResult.errors);
                    setError("Failed to fetch artist data.");
                    return;
                }

                const artworkImages = artistResult.data.artist.artworks_connection.edges.map(
                    (edge) => edge.node.image.large
                );
                const filteredImages = artworkImages.filter(Boolean);
                setImages(filteredImages);
                setSelectedImage(filteredImages[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An unexpected error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setSelectedImage(images[(currentIndex + 1) % images.length]);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setSelectedImage(images[(currentIndex - 1 + images.length) % images.length]);
    };

    const handleImageClick = (image, index) => {
        setSelectedImage(image);
        setCurrentIndex(index);
        setIsZoomed(false);
    };

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

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `artwork-${currentIndex + 1}.jpg`;
            link.click();
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Artwork',
                text: 'Check out this amazing artwork!',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            setIsFullscreen(false);
            setIsZoomed(false);
        } else if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, images.length]);

    const handleThumbnailClick = (image, index) => {
        setZoomModalImage(image);
        setZoomModalOpen(true);
        setZoomModalZoomed(false);
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading artwork...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-2">No images available.</p>
                    <p className="text-sm text-gray-400">Check back later for updates.</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full  ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl overflow-hidden'}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Main Image Container */}
            <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        ref={imageRef}
                        src={selectedImage}
                        alt={`Artwork ${currentIndex + 1}`}
                        className={`w-full h-full object-contain transition-transform duration-300 ${
                            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                        onClick={toggleZoom}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    />
                </AnimatePresence>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {currentIndex + 1} / {images.length}
                </div>

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

                {/* Navigation Controls */}
                <AnimatePresence>
                    {showControls && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                                disabled={images.length <= 1}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </motion.button>

                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                                disabled={images.length <= 1}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

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

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownload}
                                className="p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                className="p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Thumbnail Gallery */}
            {!isFullscreen && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                        {images.map((image, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                                    currentIndex === index 
                                        ? 'border-white shadow-lg' 
                                        : 'border-transparent hover:border-white/50'
                                }`}
                                onClick={() => handleThumbnailClick(image, index)}
                    >
                        <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                        {currentIndex === index && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/20"
                            />
                        )}
                    </motion.div>
                        ))}
                    </div>
            </div>
            )}

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

            {/* Zoom Modal for Thumbnails */}
            <AnimatePresence>
                {zoomModalOpen && zoomModalImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setZoomModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.img
                                src={zoomModalImage}
                                alt="Zoomed artwork thumbnail"
                                className={`w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${zoomModalZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                onClick={() => setZoomModalZoomed(z => !z)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            />
                            {/* Close Button */}
                            <button
                                onClick={() => setZoomModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}