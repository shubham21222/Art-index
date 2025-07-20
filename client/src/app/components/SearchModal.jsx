"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchModal({ isOpen, onClose }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef(null);
    const modalRef = useRef(null);

    const searchArtworks = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
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
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        if (isOpen) {
            searchInputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            searchArtworks(searchTerm);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (result) => {
        setSearchTerm(result.node.displayLabel);
        setShowSuggestions(false);
        
        // Navigate based on type
        if (result.node.__typename === 'SearchableItem' && result.node.displayType === 'Artwork' && result.node.slug) {
            router.push(`/artwork/${result.node.slug}`);
            onClose();
        } else if (result.node.__typename === 'Artist' && result.node.href) {
            const artistSlug = result.node.href.split('/').pop();
            router.push(`/artist/${artistSlug}`);
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Search</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-2"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by Artwork Title"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
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
                    </form>

                    {/* Search Suggestions */}
                    {showSuggestions && searchResults.filter(result => result.node.__typename === 'SearchableItem' && result.node.displayType === 'Artwork' && result.node.slug).length > 0 && (
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            {searchResults.filter(result => result.node.__typename === 'SearchableItem' && result.node.displayType === 'Artwork' && result.node.slug).map((result, index) => (
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

                    {/* No Results */}
                    {searchTerm && !loading && searchResults.filter(result => result.node.__typename === 'SearchableItem' && result.node.displayType === 'Artwork' && result.node.slug).length === 0 && (
                        <div className="mt-4 text-center text-gray-500">
                            No artworks found for "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 