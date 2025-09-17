import React, { useState, useCallback } from "react";
import { Upload, Clipboard, BookOpen, FileText } from "lucide-react";

// Remove all whitespace from a string
function removeWhitespace(str) {
  return str.replace(/\s+/g, "");
}

// Validate if the sequence contains only A, T, G, C (case-insensitive)
function isValidDNA(seq) {
  return /^[ATGC]*$/i.test(seq);
}

function FileUpload({ onFilesRead }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSamples, setShowSamples] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [loadedFiles, setLoadedFiles] = useState([]); // file names + content
  const [activeContent, setActiveContent] = useState("");

  // Sample DNA sequences
  const samples = {
    malaria1: "ATGCGTAGCTAGCTAGCGTACGTAGCTAGCTGACTTTACATATCTATTACATATCTAATCTTTGTGTATTTTTTATCCTTTCTGTAAATATTGTCTTATGTTCATTAAATAAATCATTTTTAAATGTTCATAATACTTTATAAAAACATAAATATAATTTTTCATTTCATCAATTGATTTTCCATCTTTATCTAATTTATAAAAATTAAGAGTATGTTCAATGTCTGTAGATGATAGTGCCACTCCAATATCATGCATATCTTTGTGTATTTTTTATCCTTTCTGTAAATATTGTCTTATGTTCATTAAATAAATCATTTTTAAATGTTCATAATACTTTATAAAAACATAAATATAATTTTTCATTTCATCAATTGATTTTCCATCTTTATCTAATTTATAAAAATTAAGAGTATGTTCAATGTCTGTAGATGATAGTGCCACTCCAATATCATGCAT",
    malaria2: "GCTAGCTAGTTACATATCTAATCTTTGTGTATTTTTTATCCTTTCTGTAAATATTGTCTTATGTTCATTAAATAAATCATTTTTAAATGTTCATAATACTTTATAAAAACATAAATATAATTTTTCATTTCATCAATTGATTTTCCATCTTTATCTAATTTATAAAAATTAAGAGTATGTTCAATGTCTGTAGATGATAGTGCCACTCCAATATCATGCATGCTTACGATCGTAGCTAGCATCGTAA",
    malaria3: "TTGACGTAGCTAGCTACGATCGTACGTTTACATATCTAATCTTTGTGTATTTTTTATCCTTTCTGTAAATATTGTCTTATGTTCATTAAATAAATCATTTTTAAATGTTCATAATACTTTATAAAAACATAAATATAATTTTTCATTTCATCAATTGATTTTCCATCTTTATCTAATTTATAAAAATTAAGAGTATGTTCAATGTCTGTAGATGATAGTGCCACTCCAATATCATGCATAGCATCGA"
  };

  const handleFiles = useCallback(
    (files) => {
      const results = [];
      const tempFiles = [];
      let loaded = 0;
      setUploadProgress(0);

      Array.from(files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          results[idx] = e.target.result;
          tempFiles[idx] = { name: file.name, content: e.target.result };
          loaded++;
          setUploadProgress((loaded / files.length) * 100);
          if (loaded === files.length) {
            setTimeout(() => {
              onFilesRead(results);
              setLoadedFiles(tempFiles);
              setActiveContent(tempFiles[0]?.content || ""); // show first file by default
              setUploadProgress(0);
            }, 500);
          }
        };
        reader.readAsText(file);
      });
    },
    [onFilesRead]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handlePasteSubmit = () => {
    const cleaned = removeWhitespace(pasteValue.trim().toUpperCase());
    if (cleaned && isValidDNA(cleaned)) {
      onFilesRead([cleaned]);
      setActiveContent(cleaned);
      setPasteValue("");
    } else if (cleaned) {
      alert("Invalid DNA sequence! Only A, T, G, C characters are allowed.");
    }
  };

  const handleSampleClick = (seq) => {
    const cleaned = removeWhitespace(seq.toUpperCase());
    if (isValidDNA(cleaned)) {
      onFilesRead([cleaned]);
      setActiveContent(cleaned);
    } else {
      alert("Invalid DNA sequence in sample!");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 h-[300px]">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={`relative flex-1 min-h-[250px] border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg
            ${
              isDragOver
                ? "border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 scale-[1.03]"
                : "border-purple-400 hover:border-blue-500 bg-gradient-to-br from-white to-purple-50"
            }`}
        >
          <Upload className="w-16 h-16 text-purple-600 mb-4 animate-pulse" />
          <span className="text-base font-semibold text-gray-800">
                  <div className="text-center">
        <h2 className=" font-bold text-purple-700 drop-shadow-md">
          DNA Sequence Upload Center
        </h2>
        <p className="text-gray-600 text-sm">
          Upload <span className="font-semibold">.fasta, .fna, .txt</span> files,
          paste sequence, or use a sample 🧬
        </p>
      </div>
          </span>
          <input
            type="file"
            accept=".fasta,.fna,.txt"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploadProgress > 0 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-4/5">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>

        {/* Paste + Loaded Viewer */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50 border-2 border-dashed border-blue-400 rounded-3xl p-5 max-w-96 shadow-lg">
          {/* Paste Input */}
          <div className="flex-1 flex flex-col mb-4  bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-3xl p-5 max-w-96 max-h-20 shadow-lg">
  <div className="flex items-start gap-2">
  <Clipboard className="text-blue-600 w-5 h-5 mt-1" />
 <textarea
  placeholder="Paste DNA sequence..."
  value={pasteValue}
  onChange={(e) => setPasteValue(e.target.value)}
  className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm px-2 py-1 resize-none max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 rounded-md"
  rows={2}
/>

  <button
    onClick={handlePasteSubmit}
    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 text-sm font-semibold shadow-md h-fit"
  >
    Add
  </button>
</div>

</div>


          {/* Active Sequence Viewer */}
          <div className="flex-1 bg-blue-50 border border-gray-200 rounded-xl p-3 
     overflow-auto text-xs font-mono text-gray-700 shadow-inner 
     max-h-32 h-48">
            {activeContent ? (
              <pre className="whitespace-pre-wrap break-words">
                {activeContent}
              </pre>
            ) : (
              <span className="text-gray-400 italic">
                No sequence selected yet
              </span>
            )}
          </div>
        </div>
      </div>

      
      {/* Sample Sequences */}
      <div className="text-center">
        <button
          onClick={() => setShowSamples(!showSamples)}
          className="flex items-center justify-center gap-2 mx-auto text-pink-600 hover:text-pink-700 font-semibold text-sm"
        >
          <BookOpen className="h-4" />
          {showSamples ? "Hide Sample Sequences" : "Show Sample Sequences"}
        </button>
        {!showSamples && (
          <div className="text-xs text-gray-500 mt-1">
            Click here to use sample sequence
          </div>
        )}
        {showSamples && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-1">
            {Object.entries(samples).map(([key, seq]) => (
              <button
                key={key}
                onClick={() => handleSampleClick(seq)}
                className="px-3 py-2 rounded-lg text-xs bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-purple-700 font-medium shadow"
              >
                🧬 {key}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
