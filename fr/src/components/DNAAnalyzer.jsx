import { useState } from "react";

export default function DNAAnalyzer() {
  const [sequence, setSequence] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">DNA Sequence Analyzer</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
          rows={6}
          placeholder="Enter DNA sequence (A/T/C/G only)..."
          className="w-full border rounded-lg p-3"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Analyze
        </button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {result && (
        <div className="mt-4 space-y-2">
          <div>
            <strong>Transmission:</strong> {result.transmission.toFixed(4)}
          </div>
          <div>
            <strong>Drug Resistant:</strong> {result.drug_resistant.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}