import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ResultsCards from "./components/ResultsCards";
import ResultsCharts from "./components/ResultsCharts";
import DNAAnalyzer from "./components/DNAAnalyzer";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Genomic Surveillance AI Tool</h1>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <DNAAnalyzer />
      </div>
    </div>
  );
}