'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Palette
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AllArtistsPage() {
  const router = useRouter();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLetter, setCurrentLetter] = useState('a');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [pageCursors, setPageCursors] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArtists, setFilteredArtists] = useState([]);

  // Generate A-Z letters for filtering
  const alphabet = Array.from({ length: 26 }, (_, i) => 
    String.fromCharCode(97 + i).toUpperCase()
  );

  // GraphQL query for fetching artists
  const fetchArtists = async (letter, page = 1, size = 100) => {
    try {
      const query = `
        query artistsRoutes_ArtistsByLetterQuery(
          $letter: String!
          $page: Int
          $size: Int
        ) @cacheable {
          viewer {
            artistsConnection(letter: $letter, page: $page, size: $size) {
              pageInfo {
                endCursor
                hasNextPage
              }
              pageCursors {
                around {
                  cursor
                  page
                  isCurrent
                }
                first {
                  cursor
                  page
                  isCurrent
                }
                last {
                  cursor
                  page
                  isCurrent
                }
                previous {
                  cursor
                  page
                }
              }
              artists: edges {
                artist: node {
                  internalID
                  name
                  href
                  id
                }
              }
            }
          }
        }
      `;

      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            letter: letter.toLowerCase(),
            page,
            size
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }

      const data = await response.json();
      
      if (data.data?.viewer?.artistsConnection) {
        const connection = data.data.viewer.artistsConnection;
        setArtists(connection.artists || []);
        setPageInfo(connection.pageInfo);
        setPageCursors(connection.pageCursors);
        return connection;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists. Please try again.');
      return null;
    }
  };

  // Load artists when letter or page changes
  useEffect(() => {
    const loadArtists = async () => {
      setLoading(true);
      const result = await fetchArtists(currentLetter, currentPage);
      if (result) {
        toast.success(`Loaded artists starting with "${currentLetter.toUpperCase()}"`);
      }
      setLoading(false);
    };

    loadArtists();
  }, [currentLetter, currentPage]);

  // Filter artists based on search query and current letter
  useEffect(() => {
    let filtered = artists;
    
    // First filter by current letter (in case API doesn't filter properly)
    filtered = filtered.filter(artist => 
      artist.artist.name.toLowerCase().startsWith(currentLetter.toLowerCase())
    );
    
    // Then filter by search query if provided
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(artist => 
        artist.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArtists(filtered);
  }, [artists, searchQuery, currentLetter]);

  // Handle letter filter change
  const handleLetterChange = (letter) => {
    setCurrentLetter(letter.toLowerCase());
    setCurrentPage(1);
    setSearchQuery('');
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle artist click
  const handleArtistClick = (artist) => {
    const slug = artist.artist.href?.split('/').pop() || artist.artist.internalID;
    router.push(`/all-artists/${slug}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              All Artists
            </h1>
            <p className="text-lg text-gray-600">
              Discover and explore artists from around the world
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search artists by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>

            {/* Alphabet Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filter by Letter</h3>
              </div>
              <div className="grid grid-cols-7 md:grid-cols-13 gap-2">
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={currentLetter.toUpperCase() === letter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLetterChange(letter)}
                    className="w-10 h-10 p-0 text-sm font-medium"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-medium text-gray-900">
                      {searchQuery 
                        ? `Search results for "${searchQuery}" within artists starting with "${currentLetter.toUpperCase()}"`
                        : `Artists starting with "${currentLetter.toUpperCase()}"`
                      }
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {filteredArtists.length} artists
                    </Badge>
                  </div>
                </div>

                {/* Artists List */}
                {filteredArtists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArtists.map((artistItem) => (
                      <Card 
                        key={artistItem.artist.internalID} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => handleArtistClick(artistItem)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {artistItem.artist.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {artistItem.artist.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Artist
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No artists found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery 
                        ? `No artists found matching "${searchQuery}" within artists starting with "${currentLetter.toUpperCase()}"`
                        : `No artists found starting with "${currentLetter.toUpperCase()}"`
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {pageCursors && !loading && filteredArtists.length > 0 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Previous Page */}
              {pageCursors.previous && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageCursors.previous.page)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {pageCursors.around.map((cursor) => (
                  <Button
                    key={cursor.page}
                    variant={cursor.isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(cursor.page)}
                    className="w-10 h-10 p-0"
                  >
                    {cursor.page}
                  </Button>
                ))}
              </div>

              {/* Next Page */}
              {pageInfo?.hasNextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 