import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from "recharts";

export default function ExportData() {
  const [coords, setCoords] = useState(null);
  const [announced, setAnnounced] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [searching, setSearching] = useState(false);
  const [pins, setPins] = useState([]);
  const mapRef = useRef(null);

  // Example analytics data (replace with real data as needed)
  const analytics = {
    transmission: 0.62,
    drug_resistant: 0.38,
    mutation: 0.45,
  };

  const barData = [
    { name: "Transmission", value: analytics.transmission, color: "#ef4444" },
    { name: "Drug Resistance", value: analytics.drug_resistant, color: "#f59e0b" },
    { name: "Mutation", value: analytics.mutation, color: "#10b981" },
  ];

  const pieData = [
    { name: "Transmission", value: analytics.transmission * 100, color: "#ef4444" },
    { name: "Drug Resistance", value: analytics.drug_resistant * 100, color: "#f59e0b" },
    { name: "Mutation", value: analytics.mutation * 100, color: "#10b981" },
  ];

  // Get current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Geocoding function using OpenStreetMap Nominatim API
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Export Data Globally</h1>
      <p className="mb-6 text-lg text-gray-700 max-w-2xl text-center">
        This page provides a global overview of the pathogen analytics results, including transmission, drug resistance, and mutation rates. You can pin your current location on the map and visualize the analysis with interactive graphs.
      </p>
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleGetLocation}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Get Current Location
        </button>
        <button
          onClick={() => {
            if (coords) {
              // Determine color by mutation level
              let color = "#10b981"; // low
              if (analytics.mutation >= 0.7) color = "#ef4444"; // high
              else if (analytics.mutation >= 0.3) color = "#f59e0b"; // medium
              setPins([
                ...pins,
                {
                  coords,
                  analytics: { ...analytics },
                  color,
                  locationName: locationName || `Pinned @ ${coords[0].toFixed(2)}, ${coords[1].toFixed(2)}`
                }
              ]);
              setAnnounced(false); // reset announce state
              if (mapRef.current) {
                mapRef.current.setView(coords, 10); // zoom to level 10 on pin
              }
            }
          }}
          disabled={!coords}
          className={`bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 ${!coords ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Announce Globally
        </button>
      </div>
      {coords && (
        <div className="mb-4 text-lg">
          Your Coordinates: <span className="font-mono">{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
        </div>
      )}
      <div className="w-full max-w-2xl mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          value={locationName}
          onChange={e => setLocationName(e.target.value)}
          placeholder="Enter location name (e.g. London, UK)"
          className="border rounded-lg px-4 py-2 w-full md:w-2/3"
        />
        <button
          onClick={handleLocationSearch}
          disabled={searching}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700"
        >
          {searching ? "Searching..." : "Find Coordinates"}
        </button>
      </div>
      <div className="w-full max-w-2xl h-96 mb-8">
        <MapContainer
          center={coords || [20, 0]}
          zoom={coords ? 5 : 2}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((pin, idx) => (
            <Marker key={idx} position={pin.coords}>
              <Tooltip>
                <div className="p-2" style={{ color: pin.color }}>
                  <div className="font-bold mb-1">{pin.locationName}</div>
                  <div><strong>Transmission:</strong> {(pin.analytics.transmission) * 100}%</div>
                  <div><strong>Drug Resistance:</strong> {(pin.analytics.drug_resistant) * 100}%</div>
                  <div><strong>Mutation:</strong> {(pin.analytics.mutation) * 100}%</div>
                  <div>
                    <strong>Mutation Level:</strong>{" "}
                    {pin.analytics.mutation >= 0.7
                      ? "High"
                      : pin.analytics.mutation >= 0.3
                      ? "Medium"
                      : "Low"}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">Pathogen Analytics Results</h2>
          <BarChart width={350} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="value">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
          <div className="mt-6 text-lg text-gray-700">
            <p><strong>Transmission Ratio:</strong> {(analytics.transmission)*100}%</p>
            <p><strong>Drug Resistance Ratio:</strong> {(analytics.drug_resistant)*100}%</p>
            <p><strong>Mutation Ratio:</strong> {(analytics.mutation)*100}%</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Distribution Overview</h2>
          <PieChart width={350} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-blue-800">
            <strong>Summary:</strong> The analysis indicates a moderate transmission rate, low drug resistance, and average mutation rate for the pathogen. The current location has been pinned on the map for global surveillance.
          </div>
        </div>
      </div>
    </div>
  );
}