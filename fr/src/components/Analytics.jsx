import React from "react";
import { BarChart3, TrendingUp, AlertCircle, Activity } from "lucide-react";
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
} from "recharts";

// Enhanced Analytics Component with multiple charts
function Analytics({ result }) {
  if (!result) return null;

  const mutation = (result.transmission + result.drug_resistant + 0.1) / 2;
  
  const barData = [
    { name: "Transmission", value: result.transmission, color: "#ef4444" },
    { name: "Drug Resistance", value: result.drug_resistant, color: "#f59e0b" },
    { name: "Mutation", value: mutation, color: "#10b981" },
  ];

  const pieData = [
    { name: "Transmission Risk", value: result.transmission * 100, color: "#ef4444" },
    { name: "Drug Resistance", value: result.drug_resistant * 100, color: "#f59e0b" },
    { name: "Mutation Rate", value: mutation * 100, color: "#10b981" },
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
    if (value < 0.3) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (value < 0.7) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Analysis Results
        </h3>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Transmission', value: result.transmission, icon: TrendingUp },
            { label: 'Drug Resistance', value: result.drug_resistant, icon: AlertCircle },
            { label: 'Mutation Rate', value: mutation, icon: Activity }
          ].map((metric, index) => {
            const risk = getRiskLevel(metric.value);
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${risk.bg} ${risk.color}`}>
                    {risk.level}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {(metric.value * 100).toFixed(1)}%
                </div>
                <div className="text-gray-600 font-medium">{metric.label}</div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.value * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Risk Factor Comparison</h4>
            <BarChart width={350} height={250} data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Risk Distribution</h4>
            <PieChart width={350} height={250}>
              <Pie
                data={pieData}
                cx={175}
                cy={125}
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </div>

          {/* Radar Chart */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Risk Profile Radar</h4>
            <RadarChart width={350} height={250} data={radarData}>
              <PolarGrid stroke="#d1d5db" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Risk Level"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </RadarChart>
          </div>

          {/* Line Chart - Projected Timeline */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4">Projected Development Timeline</h4>
            <LineChart width={350} height={250} data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="transmission" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="drugResistant" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="mutation" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Analytics;