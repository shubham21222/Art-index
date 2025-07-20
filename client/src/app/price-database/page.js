"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Loader2 } from 'lucide-react';

export default function ArtsyPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [aggregations, setAggregations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const searchArtworks = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setAggregations([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/artwork', {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query SearchBarInputSuggestQuery(
                            $term: String!
                            $hasTerm: Boolean!
                            $entities: [SearchEntity]
                        ) {
                            viewer {
                                searchConnectionAggregation: searchConnection(first: 0, mode: AUTOSUGGEST, query: $term, aggregations: [TYPE]) {
                                    aggregations {
                                        counts {
                                            count
                                            name
                                        }
                                    }
                                }
                                searchConnection(query: $term, entities: $entities, mode: AUTOSUGGEST, first: 7) @include(if: $hasTerm) {
                                    edges {
                                        node {
                                            displayLabel
                                            href
                                            imageUrl
                                            __typename
                                            ... on SearchableItem {
                                                displayType
                                                slug
                                            }
                                            ... on Artist {
                                                statuses {
                                                    artworks
                                                    auctionLots
                                                }
                                                coverArtwork {
                                                    image {
                                                        src: url(version: ["square"])
                                                    }
                                                    id
                                                }
                                            }
                                            ... on Node {
                                                __isNode: __typename
                                                id
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        term: term,
                        hasTerm: true,
                        entities: ["ARTWORK"]
                    }
                })
            });

            const data = await response.json();
            
            if (data.data?.viewer) {
                setSearchResults(data.data.viewer.searchConnection?.edges || []);
                setAggregations(data.data.viewer.searchConnectionAggregation?.aggregations?.[0]?.counts || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                searchArtworks(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        searchArtworks(searchTerm);
        setShowSuggestions(false);
    };

    const handleArtworkClick = (result) => {
        if (result.node.__typename === 'SearchableItem' && result.node.displayType === 'Artwork' && result.node.slug) {
            router.push(`/artwork/${result.node.slug}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (result) => {
        setSearchTerm(result.node.displayLabel);
        setShowSuggestions(false);
        
        // If it's an artwork, navigate to it
        if (result.node.displayType === 'Artwork' && result.node.slug) {
            router.push(`/artwork/${result.node.slug}`);
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-[1500px] mx-auto md:mt-0 mt-8 min-h-screen text-black">
                <div className="max-w-7xl mx-auto py-10 text-center">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Artist Name or Artwork Title"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full p-4 pr-12 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Search Suggestions */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleSuggestionClick(result)}
                                    >
                                        {result.node.imageUrl && (
                                            <div className="w-12 h-12 mr-3 flex-shrink-0">
                                                <Image
                                                    src={result.node.imageUrl}
                                                    alt={result.node.displayLabel}
                                                    width={48}
                                                    height={48}
                                                    className="rounded object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 text-left">
                                            <div className="font-medium text-gray-900">
                                                {result.node.displayLabel}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {result.node.displayType || result.node.__typename}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>

                    {/* Search Filters */}
                    {/* <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                        <select className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                            <option>All Mediums</option>
                            <option>Painting</option>
                            <option>Sculpture</option>
                            <option>Photography</option>
                            <option>Print</option>
                        </select>
                        <select className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                            <option>All Sizes</option>
                            <option>Small (under 40cm)</option>
                            <option>Medium (40-100cm)</option>
                            <option>Large (over 100cm)</option>
                        </select>
                    </div> */}

                    {/* Search Results Summary */}
                    {aggregations.length > 0 && (
                        <div className="mt-6">
                            <div className="flex flex-wrap justify-center gap-4">
                                {aggregations.slice(0, 5).map((agg, index) => (
                                    <div key={index} className="bg-gray-100 px-4 py-2 rounded-full text-sm">
                                        <span className="font-semibold">{agg.count.toLocaleString()}</span> {agg.name.replace('_', ' ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mx-auto px-4 mb-12">
                        <h2 className="text-2xl font-bold mb-6">Search Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((result, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleArtworkClick(result)}
                                >
                                    {result.node.imageUrl && (
                                        <div className="relative h-64">
                                            <Image
                                                src={result.node.imageUrl}
                                                alt={result.node.displayLabel}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                            {result.node.displayLabel}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3">
                                            {result.node.displayType}
                                        </p>
                                        <button 
                                            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleArtworkClick(result);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="mx-auto px-4">
                    <h1 className="text-3xl font-bold">Auction records from 300,000 artists — and counting</h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
                        {[
                            { name: 'Banksy', img: 'https://files.artsy.net/images/banksy.png' },
                            { name: 'David Hockney', img: 'https://files.artsy.net/images/david_hockney.png' },
                            { name: 'KAWS', img: 'https://files.artsy.net/images/kaws.png' },
                            { name: 'Takashi Murakami', img: 'https://files.artsy.net/images/takashi_murakami.png' },
                        ].map((artist) => (
                            <div key={artist.name} className="text-center">
                                <div className="relative w-20 h-20 mx-auto mb-2">
                                    <Image
                                        src={artist.img}
                                        alt={artist.name}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-full"
                                    />
                                </div>
                                <p className="text-lg font-semibold">{artist.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Section 1: Image on Right, Content on Left */}
                    <div className="flex flex-col md:flex-row gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Research and validate prices</h2>
                            <p>Access the data you need to make the right decisions for your collection.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}>
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fkehinde_wiley_portrait_of_nelly_moudime_ii.png&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Section 2: Image on Left, Content on Right (Reversed Layout) */}
                    <div className="flex flex-col md:flex-row-reverse gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Search for free</h2>
                            <p>The Art Index Price Database is for every collector—no subscriptions, no limits.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}>
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fdamien_hirst_kindness.jpg&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Section 3: Image on Right, Content on Left */}
                    <div className="flex flex-col md:flex-row gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Track artists and their markets</h2>
                            <p>Get insights into artists you follow with a personalized feed in the Art Index app.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}>
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fmatthew_wong_morning.jpg&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}