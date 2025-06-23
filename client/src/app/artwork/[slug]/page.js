'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ArtistCarousel from './components/ArtistCarousel';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import OtherWorks from './components/OtherWorks';
import { Skeleton } from '@/components/ui/skeleton';
import ArtistInfo from './components/ArtistInfo';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GalleryVertical, 
  ArrowRight, 
  ArrowLeft, 
  Heart,
  Share2,
  Download,
  Calendar,
  MapPin,
  Palette,
  Ruler,
  User,
  Eye,
  Clock,
  Star,
  Tag,
  Info,
  ExternalLink
} from "lucide-react";
import ContactModal from "@/app/components/ContactModal";

export default function ArtworkPage() {
    const params = useParams();
    const slug = params?.slug;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const [artwork, setArtwork] = useState(null);
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) {
            console.log("Slug is not available yet.");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch Artwork Details
                const artworkResponse = await fetch("/api/artwork", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query ArtworkDetailsQuery($slug: String!) {
                                artwork(id: $slug) {
                                    id
                                    title
                                    image {
                                        small: url(version: "small")
                                        large: url(version: "large")
                                    }
                                    artist {
                                        internalID
                                        slug
                                        name
                                    }
                                    description(format: HTML)
                                    category
                                    medium
                                    dimensions {
                                        in
                                        cm
                                    }
                                    publisher
                                    image_rights: imageRights
                                    articles {
                                        slug
                                        id
                                    }
                                }
                            }
                        `,
                        variables: { slug },
                    }),
                });

                const artworkResult = await artworkResponse.json();
                if (artworkResult.errors) {
                    console.error("GraphQL Errors (Artwork):", artworkResult.errors);
                    setError("Failed to fetch artwork data.");
                    return;
                }

                console.log("Artwork Data Fetched:", artworkResult.data.artwork);
                setArtwork(artworkResult.data.artwork);

                // Fetch Artist Details
                const artistID = artworkResult.data.artwork.artist.internalID;
                const artistResponse = await fetch("/api/artwork", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                            query artistRoutes_ArtistAppQuery($artistID: String!) @cacheable {
                                artist(id: $artistID) @principalField {
                                    internalID
                                    slug
                                    name
                                    formattedNationalityAndBirthday
                                    biographyBlurb(format: HTML, partnerBio: false) {
                                        text
                                        credit
                                    }
                                    coverArtwork {
                                        title
                                        href
                                        image {
                                            src: url(version: ["larger", "larger"])
                                            width
                                            height
                                        }
                                        id
                                    }
                                }
                            }
                        `,
                        variables: { artistID },
                    }),
                });

                const artistResult = await artistResponse.json();
                if (artistResult.errors) {
                    console.error("GraphQL Errors (Artist):", artistResult.errors);
                    setError("Failed to fetch artist data.");
                    return;
                }

                console.log("Artist Data Fetched:", artistResult.data.artist);
                setArtist(artistResult.data.artist);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An unexpected error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const handleContactClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: artwork?.title || 'Artwork',
                text: `Check out this amazing artwork by ${artist?.name}!`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        }
        setShowShareMenu(false);
    };

    const handleDownload = () => {
        if (artwork?.image?.large) {
            const link = document.createElement('a');
            link.href = artwork.image.large;
            link.download = `${artwork.title || 'artwork'}.jpg`;
            link.click();
        }
    };

    // Fallback UI for Loading State
    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Header Skeleton */}
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-2/3" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>

                            {/* Main Content Skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Image Skeleton */}
                                <div className="space-y-4">
                                    <Skeleton className="aspect-square w-full rounded-2xl" />
                                    <div className="flex space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="h-16 w-16 rounded-lg" />
                                        ))}
                                    </div>
                                </div>

                                {/* Content Skeleton */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Skeleton className="h-8 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>

                                    <div className="space-y-4">
                                        <Skeleton className="h-8 w-1/4" />
                                        <Skeleton className="h-20 w-full" />
                                    </div>

                                    <div className="space-y-4">
                                        <Skeleton className="h-8 w-1/3" />
                                        <div className="grid grid-cols-2 gap-4">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="space-y-2">
                                                    <Skeleton className="h-4 w-1/2" />
                                                    <Skeleton className="h-6 w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Fallback UI for Error State
    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                            <Info className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
                            <p className="text-gray-600">{error}</p>
                        </div>
                        <Button 
                            onClick={() => window.location.reload()}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            Try Again
                        </Button>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    // Fallback UI for Missing Data
    if (!artwork || !artist) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <Eye className="w-12 h-12 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Artwork Not Found</h2>
                            <p className="text-gray-600">The artwork you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-4 lg:space-y-0"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Tag className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 uppercase tracking-wide">
                                    {artwork.category || 'Artwork'}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                {artwork.title || 'Untitled Artwork'}
                            </h1>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{artist.name}</span>
                                </div>
                                {artist.formattedNationalityAndBirthday && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{artist.formattedNationalityAndBirthday}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-3 rounded-full transition-colors ${
                                    isLiked 
                                        ? 'bg-red-500 text-white shadow-lg' 
                                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-full shadow-md transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownload}
                                className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-full shadow-md transition-colors"
                            >
                                <Download className="w-5 h-5" />
                            </motion.button>

                            <Button 
                                onClick={handleContactClick}
                                className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-full shadow-lg"
                            >
                                I&apos;m Interested
                            </Button>
                        </div>
                    </motion.div>

                    {/* Share Menu */}
                    <AnimatePresence>
                        {showShareMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-20 bg-white rounded-xl shadow-xl border p-4 z-10"
                            >
                                <div className="space-y-2">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Enhanced Carousel */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <div className="w-full h-[70vh] bg-white rounded-2xl shadow-xl overflow-hidden">
                                <ArtistCarousel slug={artist.slug} />
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                                    <div className="text-2xl font-bold text-gray-900">4.9</div>
                                    <div className="text-sm text-gray-600">Rating</div>
                                    <div className="flex justify-center mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                                    <div className="text-2xl font-bold text-gray-900">127</div>
                                    <div className="text-sm text-gray-600">Views</div>
                                    <div className="flex justify-center mt-1">
                                        <Eye className="w-3 h-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                                    <div className="text-2xl font-bold text-gray-900">23</div>
                                    <div className="text-sm text-gray-600">Likes</div>
                                    <div className="flex justify-center mt-1">
                                        <Heart className="w-3 h-3 text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Enhanced Content */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Artist Section */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-8 rounded-2xl shadow-xl"
                            >
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{artist.name}</h2>
                                        <p className="text-gray-600">{artist.formattedNationalityAndBirthday}</p>
                                    </div>
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: artist.biographyBlurb?.text || "<p>No biography available.</p>",
                                    }}
                                    className="text-gray-700 prose prose-lg max-w-none leading-relaxed"
                                />
                            </motion.div>

                            {/* Artwork Details */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white p-8 rounded-2xl shadow-xl"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                    <Info className="w-6 h-6 text-blue-500" />
                                    <span>Artwork Details</span>
                                </h2>
                                
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: artwork.description || "<p>No description available.</p>",
                                    }}
                                    className="text-gray-700 prose prose-lg max-w-none mb-8 leading-relaxed"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <Tag className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-semibold text-gray-900">{artwork.category || "N/A"}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <Palette className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Medium</p>
                                            <p className="font-semibold text-gray-900">{artwork.medium || "N/A"}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <Ruler className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Dimensions</p>
                                            <p className="font-semibold text-gray-900">
                                                {artwork.dimensions ? `${artwork.dimensions.in} / ${artwork.dimensions.cm}` : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <Calendar className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Publisher</p>
                                            <p className="font-semibold text-gray-900">{artwork.publisher || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Related Articles */}
                            {artwork.articles && artwork.articles.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white p-8 rounded-2xl shadow-xl"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                        <ExternalLink className="w-6 h-6 text-indigo-500" />
                                        <span>Related Articles</span>
                                    </h2>
                                    <div className="space-y-4">
                                        {artwork.articles.map((article) => (
                                            <a
                                                key={article.id}
                                                href={`/articles/${article.slug}`}
                                                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {article.slug}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            
            <OtherWorks slug={slug} />
            <Footer />

            {/* Contact Modal */}
            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                artwork={artwork ? {
                    title: artwork.title,
                    artistNames: artist.name,
                    price: "I'm Interested",
                    id: artwork.id
                } : null}
            />
        </>
    );
}