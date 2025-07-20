"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, SortAsc, SortDesc, Search, Globe, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the API endpoint
const API_URL = "/api/museums";

// Predefined city coordinates
const MAJOR_CITIES = [
  { name: "All Museums", coordinates: null, country: "Worldwide" },
  { name: "New York", coordinates: "40.7128,-74.0060", country: "USA" },
  { name: "London", coordinates: "51.5074,-0.1278", country: "UK" },
  { name: "Paris", coordinates: "48.8566,2.3522", country: "France" },
  { name: "Berlin", coordinates: "52.5200,13.4050", country: "Germany" },
  { name: "Miami", coordinates: "25.7617,-80.1918", country: "USA" },
  { name: "Los Angeles", coordinates: "34.0522,-118.2437", country: "USA" },
  { name: "Tokyo", coordinates: "35.6762,139.6503", country: "Japan" },
  { name: "Rome", coordinates: "41.9028,12.4964", country: "Italy" },
  { name: "Madrid", coordinates: "40.4168,-3.7038", country: "Spain" },
  { name: "Amsterdam", coordinates: "52.3676,4.9041", country: "Netherlands" },
  { name: "Vienna", coordinates: "48.2082,16.3738", country: "Austria" },
  { name: "Barcelona", coordinates: "41.3851,2.1734", country: "Spain" }
];

export default function Museums() {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCity, setSelectedCity] = useState(MAJOR_CITIES[0]); // Default to "All Museums"
  const [searchRadius, setSearchRadius] = useState(50);
  const [currentFilters, setCurrentFilters] = useState({});

  // Get unique values for filters
  const cities = [...new Set(institutions.map(institution => institution.city))].filter(Boolean).sort();
  const countries = [...new Set(institutions.map(institution => institution.country))].filter(Boolean).sort();
  const categories = [...new Set(
    institutions.flatMap(institution => 
      institution.categories?.map(cat => cat.name) || []
    )
  )].sort();

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Only add near parameter if a specific city is selected (not "All Museums")
      if (selectedCity && selectedCity.coordinates) {
        params.append('near', selectedCity.coordinates);
      }
      
      if (searchTerm) params.append('category', searchTerm);
      params.append('type', 'INSTITUTION');

      const response = await fetch(`${API_URL}?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      console.log("Artsy API Response:", data);
      console.log("Institutions found:", data.data?.viewer?.partnersConnection?.totalCount || 0);
      
      // Extract institutions from Artsy API response format
      const institutions = data.data?.viewer?.partnersConnection?.edges?.map(edge => {
        console.log("Processing institution:", edge.node.name, "Profile:", edge.node.profile);
        return {
          ...edge.node,
          // Extract city from locationsConnection
          city: edge.node.locationsConnection?.edges?.[0]?.node?.city || 'Unknown',
          country: 'Unknown', // Artsy doesn't provide country in this query
          // Add distance calculation for display
          distance: selectedCity && selectedCity.coordinates ? calculateDistance(
            parseFloat(selectedCity.coordinates.split(',')[0]),
            parseFloat(selectedCity.coordinates.split(',')[1]),
            // Use approximate coordinates for major cities
            getCityCoordinates(edge.node.locationsConnection?.edges?.[0]?.node?.city)
          ) : null,
          // Ensure profile data is properly structured
          profile: {
            ...edge.node.profile,
            bio: edge.node.profile?.bio || '',
            image: edge.node.profile?.image || null
          },
          // Ensure categories are properly structured
          categories: edge.node.categories || []
        };
      }) || [];
      
      setInstitutions(institutions);
      setFilteredInstitutions(institutions);
      setCurrentFilters({
        city: selectedCity?.name,
        coordinates: selectedCity?.coordinates,
        radius: searchRadius
      });
    } catch (error) {
      console.error("Error fetching museums:", error);
      setInstitutions([]);
      setFilteredInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get city coordinates
  const getCityCoordinates = (cityName) => {
    const cityCoords = {
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'New York': { lat: 40.7128, lng: -74.0060 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'Miami': { lat: 25.7617, lng: -80.1918 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 }
    };
    
    return cityCoords[cityName] || { lat: 0, lng: 0 };
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1, lon1, cityCoords) => {
    if (!cityCoords || cityCoords.lat === 0) return null;
    
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (cityCoords.lat - lat1) * Math.PI / 180;
    const dLon = (cityCoords.lng - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(cityCoords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  useEffect(() => {
    fetchInstitutions();
  }, [selectedCity, searchTerm]);

  // Filter and sort institutions
  useEffect(() => {
    let filtered = institutions.filter(institution => {
      // Search filter
      const matchesSearch = !searchTerm || 
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.country.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort institutions
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "city":
          aValue = a.city || "";
          bValue = b.city || "";
          break;
        case "country":
          aValue = a.country || "";
          bValue = b.country || "";
          break;
        case "distance":
          aValue = a.distance || Infinity;
          bValue = b.distance || Infinity;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortBy === "distance") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });

    setFilteredInstitutions(filtered);
  }, [institutions, searchTerm, sortBy, sortOrder]);

  const handlePrev = () => {
    // This function is no longer needed for carousel view, but kept for now.
    // The carousel logic was removed in the new_code, but this function remains.
    // If carousel view is re-introduced, this function will need to be re-evaluated.
  };

  const handleNext = () => {
    // This function is no longer needed for carousel view, but kept for now.
    // The carousel logic was removed in the new_code, but this function remains.
    // If carousel view is re-introduced, this function will need to be re-evaluated.
  };

  const getSlideStyle = (index) => {
    // This function is no longer needed for carousel view, but kept for now.
    // The carousel logic was removed in the new_code, but this function remains.
    // If carousel view is re-introduced, this function will need to be re-evaluated.
    const total = filteredInstitutions.length || 6;
    const angle = (360 / total) * (index - 0); // Assuming currentIndex is 0 for carousel
    const radius = 700;
    const translateZ = -radius;
    const rotateY = angle;
    const opacity = Math.abs(angle) > 90 ? 0 : 1 - Math.abs(angle) / 120;
    const scale = 1 - Math.abs(angle) / 180;

    return {
      transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      transition: "transform 0.8s ease, opacity 0.8s ease",
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      zIndex: Math.round(10 - Math.abs(angle)),
      marginLeft: "-200px",
      marginTop: "-200px",
    };
  };

  const clearFilters = () => {
    setSelectedCity(MAJOR_CITIES[0]); // Reset to "All Museums"
    setSearchTerm("");
    setSearchRadius(50);
    setCurrentFilters({});
    fetchInstitutions();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCity({ name: "Current Location", coordinates: `${latitude},${longitude}`, country: "N/A" });
          setSearchRadius(100); // Set a default radius for current location
          setCurrentFilters({ city: "Current Location", coordinates: `${latitude},${longitude}`, radius: 100 });
          fetchInstitutions();
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      // Only add near parameter if a specific city is selected (not "All Museums")
      if (city.coordinates) {
        params.append('near', city.coordinates);
      }
      
      params.append('type', 'INSTITUTION');
      
      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();
      
      // Extract institutions from Artsy API response format
      const institutions = data.data?.viewer?.partnersConnection?.edges?.map(edge => ({
        ...edge.node,
        // Extract city from locationsConnection
        city: edge.node.locationsConnection?.edges?.[0]?.node?.city || 'Unknown',
        country: 'Unknown', // Artsy doesn't provide country in this query
        // Add distance calculation for display
        distance: city.coordinates ? calculateDistance(
          parseFloat(city.coordinates.split(',')[0]),
          parseFloat(city.coordinates.split(',')[1]),
          // Use approximate coordinates for major cities
          getCityCoordinates(edge.node.locationsConnection?.edges?.[0]?.node?.city)
        ) : null,
        // Ensure profile data is properly structured
        profile: {
          ...edge.node.profile,
          bio: edge.node.profile?.bio || '',
          image: edge.node.profile?.image || null
        },
        // Ensure categories are properly structured
        categories: edge.node.categories || []
      })) || [];
      
      setInstitutions(institutions);
      setFilteredInstitutions(institutions);
      setCurrentFilters({
        city: city.name,
        coordinates: city.coordinates,
        radius: searchRadius
      });
    } catch (error) {
      console.error("Error fetching museums for city:", error);
      setInstitutions([]);
      setFilteredInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCityFilter = () => {
    setSelectedCity(MAJOR_CITIES[0]); // Reset to "All Museums"
    setCurrentFilters({});
    fetchInstitutions();
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Museums & Institutions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover world-class museums, galleries, and cultural institutions from around the globe
          </p>
        </div>

        {/* Current Filter Display */}
        {selectedCity && selectedCity.name !== "All Museums" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Showing museums near {selectedCity.name}, {selectedCity.country}
                </span>
                <span className="text-blue-700 text-sm">
                  (within {searchRadius}km)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCityFilter}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search museums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Filter */}
            <Select 
              value={selectedCity?.name || "All Museums"} 
              onValueChange={(value) => {
                const city = MAJOR_CITIES.find(c => c.name === value);
                if (city) handleCityClick(city);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {MAJOR_CITIES.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {city.name}
                      {city.country !== "Worldwide" && (
                        <span className="text-gray-500 text-xs">({city.country})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="country">Country</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    Ascending
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center gap-2">
                    <SortDesc className="w-4 h-4" />
                    Descending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? "Loading..." : `${filteredInstitutions.length} museums found`}
          </p>
          {currentFilters.city && currentFilters.city !== "All Museums" && (
            <p className="text-sm text-blue-600">
              Filtered by: {currentFilters.city} ({currentFilters.radius}km radius)
            </p>
          )}
          {selectedCity?.name === "All Museums" && (
            <p className="text-sm text-green-600">
              Showing museums from all locations
            </p>
          )}
        </div>

        {/* Museums Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((institution) => (
              <div
                key={institution.internalID || institution._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-48">
                  <Image
                    src={institution.profile?.image?.cropped?.src || "/placeholder.jpeg"}
                    alt={institution.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpeg";
                    }}
                  />
                  {institution.distance && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {institution.distance.toFixed(1)}km away
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {institution.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {institution.city || 'Unknown location'}, {institution.country || 'Unknown'}
                  </div>
                  {institution.profile?.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {institution.profile.bio}
                    </p>
                  )}
                  {institution.categories && institution.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {institution.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={category.id || index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/institution/${institution.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Learn More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredInstitutions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No museums found</h3>
            <p className="text-gray-600">
              {selectedCity 
                ? `No museums found within ${searchRadius}km of ${selectedCity.name}. Try increasing the search radius or selecting a different city.`
                : "Try adjusting your search criteria or browse all museums."
              }
            </p>
            {selectedCity && (
              <Button
                onClick={clearCityFilter}
                className="mt-4"
                variant="outline"
              >
                View All Museums
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}