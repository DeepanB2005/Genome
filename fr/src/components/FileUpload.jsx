import { useState, useCallback } from "react";
import { Upload } from "lucide-react";

// File Upload Component with enhanced styling
function FileUpload({ onFilesRead }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((files) => {
    const readers = [];
    const results = [];
    let loaded = 0;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        results[idx] = e.target.result;
        loaded++;
        if (loaded === files.length) {
          onFilesRead(results);
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
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Drop your FASTA/FNA files here</p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </div>
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