// Genomic Surveillance AI Tool (React + Vite + Tailwind)
// File: genomic-surveillance-frontend.jsx
// Description: Single-file React component (default export) that provides
//  - file upload via react-dropzone (accepts .fasta, .fa, .fna)
//  - textarea for pasting sequence(s)
//  - lightweight sequence parsing and placeholder "AI" analysis that computes:
//      Mutation Ratio, Transmission Ratio, Drug Resistance Ratio
//  - results shown as cards and charts (Recharts)
//
// NOTE (important): This component uses *demo/heuristic* analysis functions.
// Replace `analyzeSequence` with calls to your backend AI model for real results.
//
// Dependencies (install these in your Vite project):
// npm install react-dropzone recharts framer-motion
// Tailwind should already be configured for the project (postcss + autoprefixer + tailwind.config.js)

import React, { useCallback, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const ACCEPTED_TYPES = [
  ".fasta",
  ".fa",
  ".fna",
  ".ffn",
  ".faa",
  ".txt",
];

// Utility: parse FASTA formatted text and return an array of {header, seq}
function parseFasta(text) {
  const lines = text.split(/\r?\n/);
  const sequences = [];
  let header = null;
  let seqParts = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith(">")) {
      if (header) {
        sequences.push({ header, seq: seqParts.join("").toUpperCase() });
      }
      header = line.slice(1).trim();
      seqParts = [];
    } else {
      seqParts.push(line.replace(/\s+/g, ""));
    }
  }
  if (header) {
    sequences.push({ header, seq: seqParts.join("").toUpperCase() });
  } else if (seqParts.length) {
    // no headers, single raw sequence
    sequences.push({ header: "(no header)", seq: seqParts.join("").toUpperCase() });
  }
  return sequences;
}

// Very simple heuristic analysis to produce three ratios between 0 and 1.
// Replace with your AI inference endpoints for production.
function analyzeSequence(seq) {
  const length = seq.length || 1;
  // Mutation ratio heuristic: fraction of ambiguous bases (N) + gaps (-)
  const ambiguous = (seq.match(/[N\-]/gi) || []).length;
  const mutationRatio = Math.min(1, ambiguous / length + 0.02); // small floor

  // Transmission ratio heuristic: k-mer diversity (unique k-mers / total k-mers)
  const k = 5;
  const kmers = [];
  for (let i = 0; i <= seq.length - k; i++) kmers.push(seq.substr(i, k));
  const totalK = Math.max(1, kmers.length);
  const uniqueK = new Set(kmers.filter((kmer) => !/[^ATGCU]/i.test(kmer))).size;
  const transmissionRatio = Math.min(1, uniqueK / totalK + 0.1);

  // Drug resistance heuristic: look for motifs / amino-acid-like patterns
  // (demo): count occurrences of specific nucleotide patterns that historically correlate
  // with resistance (this is illustrative only)
  const motifs = ["GGG", "AAC", "TCA", "AGC"];
  let motifCount = 0;
  for (let m of motifs) {
    const re = new RegExp(m, "gi");
    const matches = seq.match(re);
    if (matches) motifCount += matches.length;
  }
  const drugResistanceRatio = Math.min(1, motifCount / Math.max(1, length * 0.005));

  return {
    mutationRatio: Number(mutationRatio.toFixed(3)),
    transmissionRatio: Number(transmissionRatio.toFixed(3)),
    drugResistanceRatio: Number(drugResistanceRatio.toFixed(3)),
  };
}

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B"];

export default function GenomicSurveillanceApp() {
  const [rawText, setRawText] = useState("");
  const [sequences, setSequences] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    // Read first accepted file as text
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setRawText(text);
      const parsed = parseFasta(text);
      setSequences(parsed);
      // automatically analyze first sequence
      if (parsed.length) {
        const r = analyzeSequence(parsed[0].seq);
        setResults(r);
        setSelectedIndex(0);
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file");
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": ACCEPTED_TYPES,
    },
    maxFiles: 1,
  });

  function handleAnalyzeFromText() {
    const parsed = parseFasta(rawText || "");
    setSequences(parsed);
    setLoading(true);
    // simulate async model call (but we perform immediate computation)
    setTimeout(() => {
      if (parsed.length) {
        const r = analyzeSequence(parsed[0].seq);
        setResults(r);
        setSelectedIndex(0);
      } else {
        // analyze rawText as sequence directly
        const seq = (rawText || "").replace(/[^A-Za-z]/g, "").toUpperCase();
        const r = analyzeSequence(seq);
        setResults(r);
        setSelectedIndex(-1);
      }
      setLoading(false);
    }, 350);
  }

  const cardData = useMemo(() => {
    if (!results) return [];
    return [
      { key: "Mutation", value: results.mutationRatio },
      { key: "Transmission", value: results.transmissionRatio },
      { key: "Drug Resistance", value: results.drugResistanceRatio },
    ];
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Genomic Surveillance AI Tool</h1>
          <p className="mt-1 text-sm text-gray-600">Upload FASTA/FNA files or paste sequences to analyze mutation, transmission and drug resistance ratios.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + Paste */}
          <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
            <div {...getRootProps()} className={`border-2 border-dashed p-4 rounded-md cursor-pointer transition ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
              <input {...getInputProps()} />
              <div className="text-center py-6">
                <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg>
                <p className="text-sm font-medium text-gray-700">Drag & drop a .fasta/.fna file here, or click to select</p>
                <p className="text-xs text-gray-400 mt-2">Accepts: .fasta .fa .fna .ffn .txt</p>
              </div>
            </div>

            <label className="block mt-4 text-sm font-medium text-gray-700">Or paste sequence(s) / FASTA text</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              placeholder={">seq1\nATGCGT..."}
              className="mt-2 w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAnalyzeFromText}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              <button
                onClick={() => { setRawText(""); setSequences([]); setResults(null); }}
                className="px-4 py-2 border rounded-md text-sm"
              >Clear</button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <strong>Loaded sequences:</strong>
              <ul className="mt-2 list-disc ml-5">
                {sequences.length ? sequences.map((s, i) => (
                  <li key={i} className={`cursor-pointer ${i===selectedIndex ? 'text-indigo-600' : ''}`} onClick={() => { setSelectedIndex(i); setResults(analyzeSequence(sequences[i].seq)); }}>{s.header} <span className="text-xs text-gray-400">({s.seq.length} bp)</span></li>
                )) : <li className="text-gray-400">No sequences loaded</li>}
              </ul>
            </div>

          </section>

          {/* Right: Results Cards + Charts */}
          <section className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardData.length ? cardData.map((c, i) => (
                <motion.div key={c.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{c.key}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-800">{Math.round(c.value * 100)}%</div>
                    <div className="text-xs text-gray-400 mt-1">Value: {c.value}</div>
                  </div>
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-16 h-16">
                      <path className="text-gray-200" d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831A15.9155 15.9155 0 1 0 18 2.0845" fill="none" stroke="#eee" strokeWidth="2.8" strokeDasharray="100,100"/>
                      <path d="" />
                    </svg>
                  </div>
                </motion.div>
              )) : (
                <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow text-gray-500">No results yet — upload a FASTA or paste sequences and click Analyze.</div>
              )}
            </div>

            {results && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow">
                  <h3 className="text-lg font-semibold mb-4">Ratios (pie charts)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Mutation', value: results.mutationRatio },
                            { name: 'Transmission', value: results.transmissionRatio },
                            { name: 'DrugResistance', value: results.drugResistanceRatio },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={4}
                          label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                        >
                          <Cell fill={COLORS[0]} />
                          <Cell fill={COLORS[1]} />
                          <Cell fill={COLORS[2]} />
                        </Pie>
                        <Tooltip formatter={(v) => `${(v*100).toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow">
                  <h3 className="text-lg font-semibold mb-4">Ratios (bar chart)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mutation', value: results.mutationRatio },
                        { name: 'Transmission', value: results.transmissionRatio },
                        { name: 'Drug Resistance', value: results.drugResistanceRatio },
                      ]}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v*100)}%`} />
                        <Tooltip formatter={(v) => `${Math.round(v*100)}%`} />
                        <Legend />
                        <Bar dataKey="value" name="Ratio" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Optional: show selected sequence and summary */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold">Sequence viewer</h3>
              <div className="mt-3 text-sm text-gray-600">
                {selectedIndex >= 0 && sequences[selectedIndex] ? (
                  <>
                    <div className="text-sm font-medium">{sequences[selectedIndex].header}</div>
                    <pre className="mt-2 max-h-40 overflow-auto text-xs bg-gray-50 p-3 rounded-md border border-gray-100">{sequences[selectedIndex].seq}</pre>
                    <div className="mt-2 text-xs text-gray-400">Length: {sequences[selectedIndex].seq.length} bp</div>
                  </>
                ) : rawText ? (
                  <pre className="mt-2 max-h-40 overflow-auto text-xs bg-gray-50 p-3 rounded-md border border-gray-100">{rawText}</pre>
                ) : (
                  <div className="text-gray-400">No sequence selected.</div>
                )}
              </div>
            </div>

          </section>
        </main>

        <footer className="mt-6 text-xs text-gray-400">Note: Analysis shown is a demo heuristic. For production, replace the local `analyzeSequence` with your AI model endpoint.</footer>
      </div>
    </div>
  );
}
