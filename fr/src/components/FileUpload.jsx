import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload({ onSequenceSubmit }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          onSequenceSubmit(text);
        };
        reader.readAsText(file);
      });
    },
    [onSequenceSubmit]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".fasta", ".fna"] },
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const text = e.target.sequence.value.trim();
    if (text) {
      onSequenceSubmit(text);
      e.target.reset();
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop a .fasta/.fna file here, or click to select</p>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-2">
        <textarea
          name="sequence"
          rows="4"
          placeholder="Or paste FNA/FASTA sequence here..."
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Analyze Sequence
        </button>
      </form>
    </div>
  );
}
