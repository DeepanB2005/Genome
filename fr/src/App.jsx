import { Routes, Route } from "react-router-dom";
import DNAAnalyzer from "./components/DNAAnalyzer";
import ExportData from "./components/ExportData";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DNAAnalyzer />} />
      <Route path="/export" element={<ExportData />} />
    </Routes>
  );
}