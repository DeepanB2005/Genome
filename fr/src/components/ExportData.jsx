import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { MapPin, Search, Globe, Activity, Shield, Zap, TrendingUp, Download, Settings, Eye, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExportData() {
  const [coords, setCoords] = useState(null);
  const [announced, setAnnounced] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [searching, setSearching] = useState(false);
  const [pins, setPins] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Enhanced analytics data with trend information
  const analytics = {
    transmission: 0.62,
    drug_resistant: 0.38,
    mutation: 0.45,
    severity: 0.28,
    spread_rate: 0.71
  };

  // Trend data for line chart
  const trendData = [
    { month: 'Jan', transmission: 45, resistance: 25, mutation: 35 },
    { month: 'Feb', transmission: 52, resistance: 28, mutation: 38 },
    { month: 'Mar', transmission: 58, resistance: 32, mutation: 42 },
    { month: 'Apr', transmission: 62, resistance: 38, mutation: 45 },
    { month: 'May', transmission: 65, resistance: 35, mutation: 47 },
    { month: 'Jun', transmission: 62, resistance: 38, mutation: 45 }
  ];

  const barData = [
    { name: "Transmission", value: analytics.transmission, color: "#ff6b6b", icon: "🦠" },
    { name: "Drug Resistance", value: analytics.drug_resistant, color: "#ffa726", icon: "🛡️" },
    { name: "Mutation", value: analytics.mutation, color: "#66bb6a", icon: "🧬" },
    { name: "Severity", value: analytics.severity, color: "#ab47bc", icon: "⚠️" },
    { name: "Spread Rate", value: analytics.spread_rate, color: "#42a5f5", icon: "📈" }
  ];

  const pieData = [
    { name: "Transmission", value: analytics.transmission * 100, color: "#ff6b6b" },
    { name: "Drug Resistance", value: analytics.drug_resistant * 100, color: "#ffa726" },
    { name: "Mutation", value: analytics.mutation * 100, color: "#66bb6a" },
  ];

  // DNA Animation component
  const DNABackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-blue-400 to-purple-600 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              height: `${Math.random() * 200 + 50}px`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-cyan-50/20" />
    </div>
  );

  // Get current location with loading state
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
          setIsLoading(false);
        },
        () => {
          alert("Unable to retrieve your location.");
          setIsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Enhanced geocoding function
  const handleLocationSearch = async () => {
    if (!locationName.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("Location not found.");
      }
    } catch {
      alert("Failed to fetch coordinates.");
    }
    setSearching(false);
  };

  const handleAnnounceGlobally = () => {
    if (coords) {
      let color = "#66bb6a"; // low
      let riskLevel = "Low";
      if (analytics.mutation >= 0.7) {
        color = "#ff6b6b"; // high
        riskLevel = "High";
      } else if (analytics.mutation >= 0.3) {
        color = "#ffa726"; // medium
        riskLevel = "Medium";
      }
      
      setPins([
        ...pins,
        {
          coords,
          analytics: { ...analytics },
          color,
          riskLevel,
          timestamp: new Date().toLocaleString(),
          locationName: locationName || `Pinned @ ${coords[0].toFixed(2)}, ${coords[1].toFixed(2)}`
        }
      ]);
      setAnnounced(true);
      if (mapRef.current) {
        mapRef.current.setView(coords, 10);
      }
    }
  };

  // Scroll to top on mount (after redirect)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative">
      <DNABackground />
      
      {/* Header Section */}
      <div className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-pulse">
              🧬 Global Pathogen Analytics
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Advanced real-time pathogen surveillance and analysis platform. Monitor transmission rates, drug resistance patterns, and mutation trends across global locations.
            </p>
          </div>

          {/* Control Panel */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
              <button
                onClick={handleGetLocation}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50"
              >
                <MapPin size={20} />
                {isLoading ? "Locating..." : "Get Location"}
              </button>
              
              <button
                onClick={handleAnnounceGlobally}
                disabled={!coords}
                className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${!coords ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Globe size={20} />
                Announce Globally
              </button>
              
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <Download size={20} />
                Export Data
              </button>
            </div>

            {coords && (
              <div className="text-center mb-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl">
                <div className="text-lg font-semibold text-gray-800">
                  📍 Current Coordinates: <span className="font-mono text-blue-600">{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
                </div>
                {announced && (
                  <div className="text-green-600 font-medium mt-2 animate-pulse">
                    ✅ Location successfully announced to global network
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="🔍 Enter location (e.g., London, UK, New York, etc.)"
                className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-lg transition-all duration-200 bg-white/70 backdrop-blur-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <button
                onClick={handleLocationSearch}
                disabled={searching}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Search size={20} />
                {searching ? "Searching..." : "Find Location"}
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="text-blue-600" size={28} />
              Global Surveillance Map
            </h2>
            <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={coords || [20, 0]}
                zoom={coords ? 5 : 2}
                style={{ width: "100%", height: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {pins.map((pin, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      left: `${50 + (idx * 2)}%`, // This is a placeholder, see note below
                      top: `${50 + (idx * 2)}%`,  // You should convert lat/lng to pixel if you want accurate placement
                      zIndex: 1000,
                      pointerEvents: "auto"
                    }}
                    title={pin.locationName}
                  >
                    <MapPinned size={32} color={pin.color} className="drop-shadow-lg animate-bounce" />
                    {/* Tooltip-like info */}
                    <div className="bg-white/90 rounded-lg shadow-lg p-2 mt-1 text-xs font-medium text-gray-700">
                      <div>{pin.locationName}</div>
                      <div>🦠 {(pin.analytics.transmission * 100).toFixed(1)}%</div>
                      <div>🛡️ {(pin.analytics.drug_resistant * 100).toFixed(1)}%</div>
                      <div>🧬 {(pin.analytics.mutation * 100).toFixed(1)}%</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          pin.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                          pin.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pin.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {barData.map((item, idx) => (
                <div key={idx} className="bg-white backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-200">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {(item.value * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{item.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.value * 100}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div className="bg-gradient-to-l from-violet-100 to-yellow-100 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                6-Month Trend Analysis
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="transmission" stroke="#ff6b6b" strokeWidth={3} />
                  <Line type="monotone" dataKey="resistance" stroke="#ffa726" strokeWidth={3} />
                  <Line type="monotone" dataKey="mutation" stroke="#66bb6a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="bg-gradient-to-l from-red-100 to-blue-100 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="text-green-600" size={28} />
                Pathogen Analytics Results
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-gradient-to-r from-blue-100 to-green-100 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Eye className="text-purple-600" size={28} />
                Distribution Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-blue-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Analysis Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🦠 Transmission Risk</h4>
                <p className="text-gray-700">Current transmission rate indicates moderate risk levels with seasonal variations observed.</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🛡️ Drug Resistance</h4>
                <p className="text-gray-700">Low to moderate resistance patterns suggest current treatments remain effective.</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🧬 Mutation Tracking</h4>
                <p className="text-gray-700">Mutation rates are within expected parameters, requiring continued monitoring.</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-100/80 rounded-xl">
              <p className="text-blue-800 font-medium">
                <strong>🌍 Global Status:</strong> The analysis indicates manageable pathogen activity across monitored regions. 
                Enhanced surveillance protocols are active, and real-time data is being collected from {pins.length} pinned locations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          ← Back to Analysis
        </button>
      </div>
    </div>
  );
}