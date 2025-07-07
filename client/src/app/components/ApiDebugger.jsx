"use client";
import { useState, useEffect } from "react";

export default function ApiDebugger() {
  const [galleriesStatus, setGalleriesStatus] = useState("idle");
  const [auctionsStatus, setAuctionsStatus] = useState("idle");
  const [dbStatus, setDbStatus] = useState("idle");
  const [galleriesData, setGalleriesData] = useState(null);
  const [auctionsData, setAuctionsData] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [galleriesError, setGalleriesError] = useState(null);
  const [auctionsError, setAuctionsError] = useState(null);
  const [dbError, setDbError] = useState(null);

  const testGalleriesApi = async () => {
    setGalleriesStatus("loading");
    setGalleriesError(null);
    
    try {
      const response = await fetch("/api/galleries");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }
      
      setGalleriesData(data);
      setGalleriesStatus("success");
    } catch (error) {
      console.error("Galleries API error:", error);
      setGalleriesError(error.message);
      setGalleriesStatus("error");
    }
  };

  const testAuctionsApi = async () => {
    setAuctionsStatus("loading");
    setAuctionsError(null);
    
    try {
      const response = await fetch("/api/auction_lots");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }
      
      setAuctionsData(data);
      setAuctionsStatus("success");
    } catch (error) {
      console.error("Auctions API error:", error);
      setAuctionsError(error.message);
      setAuctionsStatus("error");
    }
  };

  const testDatabaseConnection = async () => {
    setDbStatus("loading");
    setDbError(null);
    
    try {
      const response = await fetch("/api/test-db");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }
      
      setDbData(data);
      setDbStatus("success");
    } catch (error) {
      console.error("Database connection error:", error);
      setDbError(error.message);
      setDbStatus("error");
    }
  };

  useEffect(() => {
    // Auto-test all APIs on component mount
    testDatabaseConnection();
    testGalleriesApi();
    testAuctionsApi();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-3">API Debugger</h3>
      
      <div className="space-y-3">
        {/* Galleries API */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Galleries API:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              galleriesStatus === "success" ? "bg-green-100 text-green-800" :
              galleriesStatus === "error" ? "bg-red-100 text-red-800" :
              galleriesStatus === "loading" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {galleriesStatus}
            </span>
          </div>
          {galleriesError && (
            <p className="text-xs text-red-600 mb-1">{galleriesError}</p>
          )}
          {galleriesData && (
            <p className="text-xs text-gray-600">
              Found {galleriesData.galleries?.length || 0} galleries
            </p>
          )}
          <button
            onClick={testGalleriesApi}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Retest
          </button>
        </div>

        {/* Auctions API */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Auctions API:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              auctionsStatus === "success" ? "bg-green-100 text-green-800" :
              auctionsStatus === "error" ? "bg-red-100 text-red-800" :
              auctionsStatus === "loading" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {auctionsStatus}
            </span>
          </div>
          {auctionsError && (
            <p className="text-xs text-red-600 mb-1">{auctionsError}</p>
          )}
          {auctionsData && (
            <p className="text-xs text-gray-600">
              Found {auctionsData.auctionLots?.length || 0} auction lots
            </p>
          )}
          <button
            onClick={testAuctionsApi}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Retest
          </button>
        </div>

        {/* Database Connection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Database:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              dbStatus === "success" ? "bg-green-100 text-green-800" :
              dbStatus === "error" ? "bg-red-100 text-red-800" :
              dbStatus === "loading" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {dbStatus}
            </span>
          </div>
          {dbError && (
            <p className="text-xs text-red-600 mb-1">{dbError}</p>
          )}
          {dbData && (
            <div className="text-xs text-gray-600 mb-1">
              <p>Collections: {dbData.collections?.length || 0}</p>
              <p>Galleries: {dbData.counts?.galleries || 0}</p>
              <p>Auctions: {dbData.counts?.auctions || 0}</p>
            </div>
          )}
          <button
            onClick={testDatabaseConnection}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Retest
          </button>
        </div>

        {/* Environment Check */}
        <div className="border-t pt-2">
          <p className="text-xs text-gray-600">
            MONGODB_URI: {process.env.MONGODB_URI ? "✅ Set" : "❌ Missing"}
          </p>
        </div>
      </div>
    </div>
  );
} 