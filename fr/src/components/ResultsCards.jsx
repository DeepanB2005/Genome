import { useState } from "react";
import FileUpload from "./FileUpload";
import ResultsCards from "./ResultsCards";
import ResultsCharts from "./ResultsCharts";

export default function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleSequenceSubmit = async (sequence) => {
    setError("");
    setResults(null);
    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Genomic Sequence Analyzer</h1>
      <FileUpload onSequenceSubmit={handleSequenceSubmit} />
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {results && (
        <>
          <ResultsCards results={results} />
          <ResultsCharts results={results} />
        </>
      )}
    </div>
  );
}