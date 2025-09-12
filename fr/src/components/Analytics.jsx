import React, { useState, useRef, useEffect } from "react";
import { Dna, Activity, AlertCircle, Upload, CheckCircle2, BarChart3, TrendingUp, Eye, Download, Share2, Zap, Shield, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts";


// Enhanced Analytics Component
function Analytics({ result }) {
  if (!result) return null;

  const mutation = (result.transmission + result.drug_resistant + 0.1) / 2;
  
  const barData = [
    { name: "Transmission", value: result.transmission, color: "#ff6b6b", icon: "🦠" },
    { name: "Drug Resistance", value: result.drug_resistant, color: "#ffa726", icon: "🛡️" },
    { name: "Mutation", value: mutation, color: "#66bb6a", icon: "🧬" },
  ];

  const pieData = [
    { name: "Transmission Risk", value: result.transmission * 100, color: "#ff6b6b" },
    { name: "Drug Resistance", value: result.drug_resistant * 100, color: "#ffa726" },
    { name: "Mutation Rate", value: mutation * 100, color: "#66bb6a" },
  ];

  const radarData = [
    { subject: 'Transmission', A: result.transmission * 100, fullMark: 100 },
    { subject: 'Drug Resistance', A: result.drug_resistant * 100, fullMark: 100 },
    { subject: 'Mutation', A: mutation * 100, fullMark: 100 },
  ];

  const timeSeriesData = [
    { time: 'Day 1', transmission: result.transmission * 0.3, drugResistant: result.drug_resistant * 0.2, mutation: mutation * 0.1 },
    { time: 'Day 7', transmission: result.transmission * 0.6, drugResistant: result.drug_resistant * 0.5, mutation: mutation * 0.4 },
    { time: 'Day 14', transmission: result.transmission * 0.8, drugResistant: result.drug_resistant * 0.7, mutation: mutation * 0.7 },
    { time: 'Day 21', transmission: result.transmission * 0.95, drugResistant: result.drug_resistant * 0.9, mutation: mutation * 0.85 },
    { time: 'Day 30', transmission: result.transmission, drugResistant: result.drug_resistant, mutation: mutation },
  ];

  const getRiskLevel = (value) => {
    if (value < 0.3) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    if (value < 0.7) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
          Comprehensive Analysis Results
        </h3>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Transmission Rate', value: result.transmission, icon: TrendingUp, desc: 'Pathogen spread potential' },
            { label: 'Drug Resistance', value: result.drug_resistant, icon: Shield, desc: 'Treatment effectiveness' },
            { label: 'Mutation Rate', value: mutation, icon: Zap, desc: 'Genetic variation speed' }
          ].map((metric, index) => {
            const risk = getRiskLevel(metric.value);
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{metric.label}</div>
                      <div className="text-xs text-gray-500">{metric.desc}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.bg} ${risk.color} ${risk.border} border`}>
                    {risk.level}
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {(metric.value * 100).toFixed(1)}%
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 shadow-lg"
                    style={{ width: `${metric.value * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Risk Factor Analysis
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-6 border border-purple-200">
            <h4 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              Risk Distribution
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
            <h4 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Multi-Factor Profile
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#d1d5db" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Risk Level"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Projected Timeline */}
          <div className="bg-gradient-to-br from-cyan-50 to-pink-50 rounded-2xl p-6 border border-cyan-200">
            <h4 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <TrendingUp className="w-5 h-5 mr-2 text-cyan-600" />
              Projected Development Timeline
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="transmission" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="drugResistant" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="mutation" stroke="#10b981" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
            Analysis Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-2">🦠 Transmission Analysis</h5>
              <p className="text-gray-700 text-sm">Current transmission rate of {(result.transmission * 100).toFixed(1)}% indicates {getRiskLevel(result.transmission).level.toLowerCase()} spreading potential.</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-2">🛡️ Resistance Profile</h5>
              <p className="text-gray-700 text-sm">Drug resistance at {(result.drug_resistant * 100).toFixed(1)}% suggests {getRiskLevel(result.drug_resistant).level.toLowerCase()} treatment challenges.</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-2">🧬 Mutation Dynamics</h5>
              <p className="text-gray-700 text-sm">Mutation rate of {(mutation * 100).toFixed(1)}% indicates {getRiskLevel(mutation).level.toLowerCase()} genetic variation speed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;