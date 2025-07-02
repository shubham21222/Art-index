"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Search, Filter, Globe, MapPin, SortAsc, SortDesc, ExternalLink, Database, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

export default function MuseumsPage() {
  const [artsyMuseums, setArtsyMuseums] = useState([]);
  const [wikipediaMuseums, setWikipediaMuseums] = useState([]);
  const [combinedMuseums, setCombinedMuseums] = useState([]);
  const [filteredMuseums, setFilteredMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wikipediaLoading, setWikipediaLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dataSource, setDataSource] = useState("all"); // all, artsy, wikipedia
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Get unique values for filters
  const countries = [...new Set([
    ...artsyMuseums.map(m => m.locations?.[0]?.country).filter(Boolean),
    ...wikipediaMuseums.map(m => m.location?.split(',').pop()?.trim()).filter(Boolean)
  ])].sort();

  const categories = [
    "Art Museums",
    "History Museums", 
    "Science Museums",
    "Natural History Museums",
    "Contemporary Art",
    "Modern Art",
    "Classical Art",
    "Archaeology",
    "Ethnography",
    "Technology",
    "Children's Museums",
    "Military Museums",
    "Maritime Museums",
    "Aviation Museums",
    "Railway Museums",
    "Automotive Museums",
    "Music Museums",
    "Film Museums",
    "Photography Museums",
    "Design Museums",
    "Fashion Museums",
    "Textile Museums",
    "Ceramic Museums",
    "Glass Museums",
    "Jewelry Museums",
    "Coin Museums",
    "Stamp Museums",
    "Toy Museums",
    "Doll Museums",
    "Sports Museums"
  ];

  // Fetch Artsy museums
  useEffect(() => {
    const fetchArtsyMuseums = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/museums");
        const data = await response.json();
        setArtsyMuseums(data.institutions || []);
      } catch (error) {
        console.error("Error fetching Artsy museums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtsyMuseums();
  }, []);

  // Fetch Wikipedia museums
  const fetchWikipediaMuseums = async (country = "", category = "") => {
    try {
      setWikipediaLoading(true);
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (category) params.append('category', category);
      
      const response = await fetch(`/api/wikipedia-museums?${params}`);
      const data = await response.json();
      setWikipediaMuseums(data.museums || []);
    } catch (error) {
      console.error("Error fetching Wikipedia museums:", error);
    } finally {
      setWikipediaLoading(false);
    }
  };

  // Combine and filter museums
  useEffect(() => {
    let museums = [];
    
    if (dataSource === "all" || dataSource === "artsy") {
      museums.push(...artsyMuseums.map(m => ({
        ...m,
        source: "Artsy",
        displayName: m.name,
        displayLocation: m.locations?.[0]?.city || m.locations?.[0]?.country || "Unknown",
        displayCountry: m.locations?.[0]?.country || "Unknown"
      })));
    }
    
    if (dataSource === "all" || dataSource === "wikipedia") {
      museums.push(...wikipediaMuseums.map(m => ({
        ...m,
        source: "Wikipedia",
        displayName: m.name,
        displayLocation: m.location || "Unknown",
        displayCountry: m.location?.split(',').pop()?.trim() || "Unknown",
        image: { src: "https://via.placeholder.com/400x300?text=Museum" }
      })));
    }

    setCombinedMuseums(museums);
  }, [artsyMuseums, wikipediaMuseums, dataSource]);

  // Filter and sort museums
  useEffect(() => {
    let filtered = combinedMuseums.filter(museum => {
      const matchesSearch = museum.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           museum.displayLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           museum.displayCountry.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === "all" || 
                            museum.displayCountry.toLowerCase().includes(selectedCountry.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
                             museum.categories?.some(cat => cat.name.includes(selectedCategory)) ||
                             museum.displayName.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCountry && matchesCategory;
    });

    // Sort museums
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.displayName;
          bValue = b.displayName;
          break;
        case "location":
          aValue = a.displayLocation;
          bValue = b.displayLocation;
          break;
        case "country":
          aValue = a.displayCountry;
          bValue = b.displayCountry;
          break;
        case "source":
          aValue = a.source;
          bValue = b.source;
          break;
        default:
          aValue = a.displayName;
          bValue = b.displayName;
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredMuseums(filtered);
  }, [combinedMuseums, searchTerm, selectedCountry, selectedCategory, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedCategory("all");
  };

  const loadWikipediaData = () => {
    fetchWikipediaMuseums(selectedCountry, selectedCategory);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Museums Directory</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore museums from around the world. Discover art institutions, history museums, 
              science centers, and cultural venues from multiple sources including Artsy and Wikipedia.
            </p>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Museums
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search museums by name, location, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dataSource} onValueChange={setDataSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Data Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="artsy">Artsy Only</SelectItem>
                    <SelectItem value="wikipedia">Wikipedia Only</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="source">Source</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadWikipediaData}
                  disabled={wikipediaLoading}
                >
                  {wikipediaLoading ? "Loading..." : "Load Wikipedia Data"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    size="sm"
                  >
                    Grid View
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    size="sm"
                  >
                    List View
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-center text-sm text-gray-600">
                Showing {filteredMuseums.length} of {combinedMuseums.length} museums
                {combinedMuseums.length > 0 && (
                  <span className="ml-4">
                    ({artsyMuseums.length} from Artsy, {wikipediaMuseums.length} from Wikipedia)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Museums Display */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <Card key={index}>
                  <Skeleton className="w-full h-48 rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMuseums.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMuseums.map((museum, index) => (
                  <Card key={`${museum.source}-${index}`} className="hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={museum.image?.src || "https://via.placeholder.com/400x300?text=Museum"}
                        alt={museum.displayName}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <Badge 
                        variant={museum.source === "Artsy" ? "default" : "secondary"}
                        className="absolute top-2 right-2"
                      >
                        {museum.source === "Artsy" ? <Database className="w-3 h-3 mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
                        {museum.source}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {museum.displayName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">
                          {museum.displayLocation}
                          {museum.displayCountry && museum.displayCountry !== museum.displayLocation && 
                           `, ${museum.displayCountry}`}
                        </span>
                      </div>
                      {museum.categories && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {museum.categories.slice(0, 2).map((cat, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {museum.source === "Artsy" ? (
                        <Link href={`/institution/${museum.slug}`}>
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          External Source
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMuseums.map((museum, index) => (
                  <Card key={`${museum.source}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={museum.image?.src || "https://via.placeholder.com/100x100?text=Museum"}
                            alt={museum.displayName}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Badge 
                            variant={museum.source === "Artsy" ? "default" : "secondary"}
                            className="absolute -top-1 -right-1 text-xs"
                          >
                            {museum.source}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {museum.displayName}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>
                              {museum.displayLocation}
                              {museum.displayCountry && museum.displayCountry !== museum.displayLocation && 
                               `, ${museum.displayCountry}`}
                            </span>
                          </div>
                          {museum.categories && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {museum.categories.map((cat, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {museum.source === "Artsy" ? (
                            <Link href={`/institution/${museum.slug}`}>
                              <Button size="sm">
                                View Details
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <ExternalLink className="w-4 h-4 mr-1" />
                              External
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 text-lg">No museums found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 