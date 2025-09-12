import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";

// Enhanced File Upload Component
function FileUpload({ onFilesRead }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50/80 backdrop-blur-lg scale-105 shadow-2xl' 
          : 'border-purple-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 bg-white/60 backdrop-blur-sm'
      }`}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className={`p-6 rounded-full transition-all duration-300 ${
          isDragOver ? 'bg-blue-100 scale-110' : 'bg-gradient-to-br from-purple-100 to-blue-100'
        }`}>
          <Upload className={`w-12 h-12 transition-colors duration-300 ${
            isDragOver ? 'text-blue-600' : 'text-purple-600'
          }`} />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Drop your FASTA/FNA files here</p>
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
  );
}
export default FileUpload;