"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Globe, MapPin, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the API endpoint
const API_URL = "/api/museums";

export default function Museums() {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("carousel"); // carousel or list
  const [currentIndex, setCurrentIndex] = useState(null);

  // Get unique values for filters
  const countries = [...new Set(institutions.map(inst => inst.locations?.[0]?.country).filter(Boolean))].sort();
  const states = [...new Set(institutions.map(inst => inst.locations?.[0]?.state).filter(Boolean))].sort();
  const cities = [...new Set(institutions.map(inst => inst.locations?.[0]?.city).filter(Boolean))].sort();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const { institutions } = await response.json();
        setInstitutions(institutions || []);
        setFilteredInstitutions(institutions || []);
        setCurrentIndex(Math.floor((institutions || []).length / 2));
      } catch (error) {
        console.error("Error fetching museums institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort institutions
  useEffect(() => {
    let filtered = institutions.filter(institution => {
      const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           institution.locations?.[0]?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           institution.locations?.[0]?.country?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === "all" || institution.locations?.[0]?.country === selectedCountry;
      const matchesState = selectedState === "all" || institution.locations?.[0]?.state === selectedState;
      const matchesCity = selectedCity === "all" || institution.locations?.[0]?.city === selectedCity;

      return matchesSearch && matchesCountry && matchesState && matchesCity;
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
          aValue = a.locations?.[0]?.city || "";
          bValue = b.locations?.[0]?.city || "";
          break;
        case "country":
          aValue = a.locations?.[0]?.country || "";
          bValue = b.locations?.[0]?.country || "";
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredInstitutions(filtered);
    setCurrentIndex(Math.floor(filtered.length / 2));
  }, [institutions, searchTerm, selectedCountry, selectedState, selectedCity, sortBy, sortOrder]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredInstitutions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === filteredInstitutions.length - 1 ? 0 : prev + 1));
  };

  const getSlideStyle = (index) => {
    const total = filteredInstitutions.length || 6;
    const angle = (360 / total) * (index - currentIndex);
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
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedState("all");
    setSelectedCity("all");
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[1500px] mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between w-full mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Museums</h2>
          <p className="text-gray-900 text-lg mt-2">Discover leading museums and cultural institutions</p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button
            variant={viewMode === "carousel" ? "default" : "outline"}
            onClick={() => setViewMode("carousel")}
            size="sm"
          >
            Carousel View
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

      {/* Search and Filter Section */}
      <div className="w-full mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search museums by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="country">Country</SelectItem>
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

        {/* Clear Filters */}
        {(searchTerm || selectedCountry !== "all" || selectedState !== "all" || selectedCity !== "all") && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center text-sm text-gray-600">
          Showing {filteredInstitutions.length} of {institutions.length} museums
        </div>
      </div>

      {/* Content Display */}
      {viewMode === "carousel" ? (
        /* 3D Carousel View */
        <div className="relative h-[500px] w-full perspective-[1200px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  style={getSlideStyle(index)}
                  className="w-[400px] h-[400px] rounded-lg overflow-hidden"
                >
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
              ))
            ) : filteredInstitutions.length > 0 ? (
              filteredInstitutions.map((institution, index) => (
                <div
                  key={institution.internalID}
                  style={getSlideStyle(index)}
                  className="group w-[400px] h-[400px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  <Link href={`/institution/${institution.slug}`} className="block h-full">
                    <div className="relative w-full h-full">
                      <Image
                        src={institution.image.src}
                        alt={institution.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full rounded-lg shadow-md transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-10">
                      <h3 className="text-lg font-semibold drop-shadow-md">{institution.name}</h3>
                      <p className="text-sm drop-shadow-md">{institution.locations[0]?.city || "N/A"}</p>
                      <p className="text-xs drop-shadow-md">
                        {institution.categories.map(cat => cat.name).join(", ") || "N/A"}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No museums found matching your criteria.</p>
            )}
          </div>

          {/* Navigation Buttons */}
          {currentIndex !== null && filteredInstitutions.length > 0 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-3 sm:p-2 rounded-full z-[50] transition-transform duration-300 hover:scale-110 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      ) : (
        /* List View */
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                  <Skeleton className="w-full h-48 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredInstitutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution) => (
                <div key={institution.internalID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/institution/${institution.slug}`}>
                    <div className="relative h-48">
                      <Image
                        src={institution.image.src}
                        alt={institution.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{institution.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {institution.locations[0]?.city || "N/A"}
                        {institution.locations[0]?.country && `, ${institution.locations[0].country}`}
                      </div>
                      <p className="text-xs text-gray-500">
                        {institution.categories.map(cat => cat.name).join(", ") || "N/A"}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No museums found matching your criteria.</p>
          )}
        </div>
      )}

      {/* Indicators for Carousel */}
      {viewMode === "carousel" && currentIndex !== null && filteredInstitutions.length > 0 && (
        <div className="hidden sm:flex justify-center mt-6 space-x-2">
          {filteredInstitutions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-black scale-150" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Link
          href="/institutions/museums"
          className="text-black text-sm font-medium hover:underline transition-colors duration-300"
        >
          View All Museums
        </Link>
      </div>
    </div>
  );
}