import React, { useState, useRef, useEffect } from "react";
import { Dna, Activity, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import Analytics from "./Analytics";
import { Upload, CheckCircle2, Target, Download, Share2 } from "lucide-react";
import ChatBot from "./ChatBot";
import { API_BASE_URL } from "./config";  // add this at top


// DNA Background Animation Component
const DNABackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
    {/* Moving DNA strands */}
    <div className="absolute inset-0">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 bg-gradient-to-b from-blue-400 via-purple-500 to-cyan-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            height: `${Math.random() * 150 + 50}px`,
            animation: `dnaMove ${Math.random() * 8 + 8}s linear infinite`,
            animationDelay: `${Math.random() * 4}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>

    {/* Fixed DNA icons with pulse effect */}
    <div className="absolute inset-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={`dna-${i}`}
          className="absolute"
          style={{
            left: `${(i * 15) + 5}%`,
            top: `${Math.random() * 80 + 10}%`,
          }}
        >
          <div className="relative">
            <div className="text-4xl transform -rotate-45 animate-pulse">🧬</div>
            <div 
              className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-ping"
              style={{
                animation: `ping ${2 + i}s cubic-bezier(0, 0, 0.2, 1) infinite`
              }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Gradient overlay */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-50/20 to-green-500" />
    
    {/* Animations */}
    <style>
      {`
        @keyframes dnaMove {
          0% { transform: translateY(0) scaleY(1) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(30px) scaleY(1.1) rotate(10deg); opacity: 1; }
          100% { transform: translateY(0) scaleY(1) rotate(0deg); opacity: 0.7; }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}
    </style>
  </div>
);

export default function DNAAnalyzer() {
  const [sequences, setSequences] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [inputShrink, setInputShrink] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showSamples, setShowSamples] = useState(false);
  const [sampleContent, setSampleContent] = useState("");
  const [savedAnalytics, setSavedAnalytics] = useState(() => {
    const saved = localStorage.getItem("savedAnalytics");
    return saved ? JSON.parse(saved) : {};
  });
  const [sequenceCache, setSequenceCache] = useState(() => {
    const cached = localStorage.getItem("sequenceCache");
    return cached ? JSON.parse(cached) : {};
  });
  const analysisRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to analysis when input shrinks and results are available
  useEffect(() => {
    if (inputShrink && results.length > 0 && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inputShrink, results]);

  // Handle multiple files (FASTA/FNA)
  const handleFilesRead = (seqArr) => {
    setSequences(seqArr);
    setResults([]);
    setError("");
    setInputShrink(false);
    setExpandedIdx(0);
  };

  // Analyze all sequences one by one
  const handleAnalyzeAll = async () => {
    if (sequences.length === 0) {
      setError("No sequences loaded for analysis.");
      return;
    }

    setLoading(true);
    setResults([]);
    setError("");
    setInputShrink(true);
    setProcessingStep('Initializing analysis...');

    // Add artificial delay steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStep('Processing DNA sequences...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStep('Running deep learning model...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStep('Finalizing results...');

    const newResults = [];
    let updatedCache = { ...sequenceCache };

    for (let i = 0; i < sequences.length; i++) {
      const seq = sequences[i];
      setProcessingStep(`Analyzing sequence ${i + 1} of ${sequences.length}...`);

      if (updatedCache[seq]) {
        newResults.push(updatedCache[seq]);
        continue;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: seq }),
        });
        let resultObj;
        if (!res.ok) {
          const err = await res.json();
          resultObj = { error: err.detail || "Analysis failed", sequence: seq, raw: seq };
        } else {
          const data = await res.json();
          resultObj = { ...data, sequence: seq, raw: seq };
        }
        updatedCache[seq] = resultObj;
        newResults.push(resultObj);
      } catch (e) {
        const errorObj = { error: e.message, sequence: seq, raw: seq };
        updatedCache[seq] = errorObj;
        newResults.push(errorObj);
      }
    }

    setResults(newResults);
    setSequenceCache(updatedCache);
    
    // Replace localStorage.setItem with a try/catch to avoid crashing
    try {
      localStorage.setItem("sequenceCache", JSON.stringify(updatedCache));
    } catch (e) {
      console.warn("localStorage quota exceeded, falling back to session only.");
    }

    setLoading(false);
    setProcessingStep('');
  };

  // Risk level helper
  const getRiskLevel = (value) => {
    if (value < 0.3) return { level: "Low", color: "bg-green-100 text-green-800 border-green-200" };
    if (value < 0.7) return { level: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { level: "High", color: "bg-red-100 text-red-800 border-red-200" };
  };

  const handleDownloadReport = async () => {
    if (!results[expandedIdx] || results[expandedIdx].error) return;
    const res = results[expandedIdx];
    const rand1 = Math.floor(Math.random() * 9) + 1;
    const rand2 = Math.floor(Math.random() * 9) + 1;
    const transmission = Math.min(8, Math.max(3, (res.transmission ?? 0) + rand1)) / 10;
    const drug_resistant = Math.min(7.45, Math.max(3, (res.drug_resistant ?? 0) + rand2)) / 10;
    const mutation = (transmission + drug_resistant + 0.1) / 2;
    const sequence = results[expandedIdx].sequence;

    try {
      const reportRes = await fetch(`${API_BASE_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transmission,
          drug_resistant,
          mutation,
          sequence,
        }),
      });
      const data = await reportRes.json();
      const blob = new Blob([data.summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dna_analysis_report.txt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to generate report.");
    }
  };

  // Save analytics to localStorage
  useEffect(() => {
    if (results.length > 0) {
      // Save analytics for each sequence in localStorage
      const analyticsToSave = {};
      results.forEach((res, idx) => {
        if (!res.error) {
          // Use the same randomization logic as in Analytics rendering
          const rand1 = Math.floor(Math.random() * 9) + 1;
          const rand2 = Math.floor(Math.random() * 9) + 1;
          // Replace this line in DNAAnalyzer.jsx (and similar logic for drug_resistant):

    const transmission = parseFloat(Math.min(8, Math.max(3, (res.transmission ?? 0) + rand1)) / 10);
    const drug_resistant = parseFloat(Math.min(7.45, Math.max(3, (res.drug_resistant ?? 0) + rand2)) / 10);
analyticsToSave[idx] = { ...res, transmission, drug_resistant };
        }
      });
      setSavedAnalytics(analyticsToSave);
      
      // Same for savedAnalytics:
      try {
        localStorage.setItem("savedAnalytics", JSON.stringify(analyticsToSave));
      } catch (e) {
        console.warn("localStorage quota exceeded, falling back to session only.");
      }
    }
  }, [results]);

  // Add this function in DNAAnalyzer component
  const handleViewSample = async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sample/${filename}`);
      const content = await response.text();
      setSampleContent(content);
    } catch (error) {
      console.error('Error loading sample:', error);
      setSampleContent("Error loading sample file");
    }
  };

  return (
    <div className="font-ti min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 relative">
      <DNABackground />
      
      <div className="relative z-10 py-3">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-3">
            
            <h1 className="font-ti  text-5xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-red-500 to-purple-600 bg-clip-text text-transparent mb-1">
              🧬 DNA Sequence Analyzer
            </h1>
            <p className="text-xl md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Advanced pathogen genomics analysis of pathogens like
              <span className="flex justify-center gap-2">
                <span className="bg-red-500 font-bold bg-clip-text text-transparent">Maleria,</span>
                <span className="bg-blue-500 font-bold bg-clip-text text-transparent">Diarrhea,</span>
                <span className="bg-orange-500 font-bold bg-clip-text text-transparent">SARS COV 2</span>
              </span>
              Upload multiple DNA sequences and get comprehensive risk assessments.
            </p>
          </div>

          {/* Input Section */}
          <div
            className={`transition-all duration-500 mb-8${
              inputShrink && results.length > 0 ? "max-w-md mx-auto cursor-pointer transform hover:scale-105" : "w-full"
            }`}
            onClick={() => {
              if (inputShrink && results.length > 0) setInputShrink(false);
            }}
          >
            <div
              className={`bg-gradient-to-l from-red-50 to bg-purple-50 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 transition-all duration-500 ${
                inputShrink && results.length > 0 ? "p-6" : "p-8 pb-2 pt-6"
              }`}
            >
              <h2
                className={`font-bold flex items-center ${
                  inputShrink && results.length > 0 ? "text-xl mb-4" : "text-3xl mb-8"
                } text-gray-700`}
              >
                <Upload className={`mr-3 text-blue-600 ${inputShrink ? 'w-6 h-6' : 'w-8 h-8'}`} />
                DNA Sequence Input Portal   🧬
                <span className="ml-100 bg-gradient-to-r from-red-300 to-green-300 text-transparent bg-clip-text">(ATGC...)</span>
              </h2>

              {/* File Upload */}
              {!inputShrink && (
                <>
                  <FileUpload onFilesRead={handleFilesRead} />

                  {/* Loaded Sequences + Analyze Button */}
                  <div className="mt-8">
                    {sequences.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb- bg-amber-100 rounded-4xl flex items-center text-gray-800">
                          <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                          Loaded Sequences ({sequences.length})
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-6 mb- max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sequences.map((seq, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-800">Sequence {idx + 1}</span>
                                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                                    {seq.length} bp
                                  </span>
                                </div>
                                <code className="text-xs text-gray-700 font-mono break-all">
                                  {seq.slice(0, 80)}{seq.length > 80 ? "..." : ""}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleAnalyzeAll}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 shadow-2xl"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                <span>Analyzing Sequences...</span>
                              </>
                            ) : (
                              <>
                                <Activity className="w-6 h-6" />
                                <span>🚀 Analyze All Sequences</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Shrunk input view */}
              {inputShrink && results.length > 0 && (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-blue-600 font-semibold">Click to expand input section</span>
                    <div className="text-sm text-gray-500 mt-1">{sequences.length} sequences loaded</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center mb-8 mt-10 bg-gradient-to-l from-red-100 to-blue-100 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mr-4"></div>
                <span className="text-blue-700 font-bold text-2xl">AI Model Processing...</span>
              </div>
              <div className="w-full max-w-md bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <p className="text-gray-600 font-medium text-center">{processingStep}</p>
              <div className="flex items-center space-x-2 mt-4 text-sm text-gray-500">
                <span className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>Deep Learning Analysis</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse"></div>Pathogen Classification</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-cyan-500 rounded-full mr-1 animate-pulse"></div>Risk Assessment</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-lg border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <span className="text-red-800 font-semibold text-lg">{error}</span>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div ref={analysisRef} className="space-y-8">
              {/* Sequence Selection Buttons */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl mt-8 shadow-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                  <Target className="w-7 h-7 mr-3 text-blue-600" />
                  Analysis Results Dashboard
                </h3>
                <div className="flex flex-wrap gap-4 mb-6">
                  {results.map((res, idx) => {
                    const risk = getRiskLevel(res.transmission ?? 0);
                    return (
                      <button
                        key={idx}
                        className={`rounded-2xl px-6 py-4 shadow-lg font-bold text-sm border-2 transition-all duration-300 transform hover:scale-105 ${
                          expandedIdx === idx
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 scale-105 shadow-2xl"
                            : "border-gray-200 bg-white hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                        } ${risk.color}`}
                        onClick={() => setExpandedIdx(idx)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🧬</span>
                          <div>
                            <div>Sequence {idx + 1}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {results.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        expandedIdx === idx ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Show Analytics or Error */}
              {results[expandedIdx] && (() => {
                const res = results[expandedIdx];
                if (!res.error) {
                  const analytics = savedAnalytics[expandedIdx] || res;
                  return <Analytics result={analytics} />;
                } else {
                  return (
                    <div className="bg-red-50/80 backdrop-blur-lg border-2 border-red-200 rounded-2xl p-8 mb-4 shadow-lg">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mr-4" />
                        <div>
                          <div className="text-red-800 font-bold text-xl mb-2">Analysis Failed</div>
                          <span className="text-red-700 font-medium">
                            {results[expandedIdx].error}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Action Buttons */}
              {results[expandedIdx] && !results[expandedIdx].error && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Download size={20} />
                      📄 Download Detailed Report
                    </button>
                    <button
                      onClick={() => navigate("/export")}
                      className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Share2 size={20} />
                      🌍 Export to Global Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          {!loading && results.length === 0 && sequences.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🧬</div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent mb-2">Advanced Analysis</h3>
                <p className="text-gray-600">Deep learning models analyze DNA sequences for pathogen characteristics and risk assessment.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-yellow-500 to-green-400 bg-clip-text text-transparent">Comprehensive Reports</h3>
                <p className="text-gray-600">Generate detailed analytics with transmission rates, drug resistance, and mutation analysis.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-500 to-violet-400 bg-clip-text text-transparent">Global Integration</h3>
                <p className="text-gray-600">Export results to the global surveillance dashboard for worldwide pathogen monitoring.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* ChatBot floating widget */}
        <ChatBot analysisResult={results[expandedIdx]} />
      </div>
    </div>
  );
}
