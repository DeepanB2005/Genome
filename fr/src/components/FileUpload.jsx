import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";

// Enhanced File Upload Component
function FileUpload({ onFilesRead }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSamples, setShowSamples] = useState(false);
  const [sampleContent, setSampleContent] = useState("");
  const [inputShrink, setInputShrink] = useState(false);
  const [sequences, setSequences] = useState([]);

  const handleFiles = useCallback((files) => {
    const readers = [];
    const results = [];
    let loaded = 0;
    setUploadProgress(0);

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        results[idx] = e.target.result;
        loaded++;
        setUploadProgress((loaded / files.length) * 100);
        if (loaded === files.length) {
          setTimeout(() => {
            onFilesRead(results);
            setUploadProgress(0);
          }, 500);
        }
      };
      reader.readAsText(file);
      readers.push(reader);
    });
  }, [onFilesRead]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Update the handleViewSample function with proper FASTA format
  const handleViewSample = (sample) => {
    const sampleContents = {
      'maleria_1.txt': '>Malaria_Sample_1\nATCGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA\n',
      'maleria_2.txt': '>Malaria_Sample_2\nTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT\n',
      'maleria_3.txt': '>Malaria_Sample_3\nGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG\n'
    };
    setSampleContent(sampleContents[sample] || '');
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-500 backdrop-blur-lg scale-105 shadow-2xl' 
            : 'border-purple-300 hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-50/50 bg-white/60 backdrop-blur-sm'
        }`}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className={`p-6 rounded-full transition-all duration-300 ${
            isDragOver ? 'bg-blue-100 scale-110' : 'bg-gradient-to-br from-purple-300 to-blue-100'
          }`}>
            <Upload className={`w-12 h-8 transition-colors duration-300 ${
              isDragOver ? 'text-blue-600' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <p className="text-xl font-ti font-bold bg-gradient-to-r from-blue-500 to-violet-400 text-transparent bg-clip-text mb-2">Drop your FASTA/FNA files here</p>
            <p className="text-sm text-gray-600">or click to browse • Multiple files supported</p>
            <div className="flex items-center justify-center mt-3 space-x-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">✓ .fasta</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">✓ .fna</span>
            </div>
          </div>
          
          {uploadProgress > 0 && (
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress.toFixed(0)}%</p>
            </div>
          )}
          
          <input
            type="file"
            accept=".fasta,.fna"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      
      {/* Sample Files Section */}
      {!inputShrink && (
        <div className="mb-8">
          <div className="flex items-center justify-between ">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              📚 View Sample Files {showSamples ? '▼' : '▶'}
            </button>
          </div>
          
          {showSamples && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Available Samples:</h4>
                  <button
                    onClick={() => handleViewSample('maleria_1.txt')}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-700"
                  >
                    🦠 Malaria Sample 1
                  </button>
                  <button
                    onClick={() => handleViewSample('maleria_2.txt')}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-700"
                  >
                    🦠 Malaria Sample 2
                  </button>
                  <button
                    onClick={() => handleViewSample('maleria_3.txt')}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-700"
                  >
                    🦠 Malaria Sample 3
                  </button>
                </div>
                
                {sampleContent && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Sample Content:</h4>
                    <code className="text-xs text-gray-600 font-mono break-all block max-h-40 overflow-y-auto">
                      {sampleContent}
                    </code>
                    <button
                      onClick={() => {
                        onFilesRead([sampleContent]); // Send the sample content to parent
                        setShowSamples(false);
                        setSequences([sampleContent]);
                      }}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Use This Sample
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default FileUpload;