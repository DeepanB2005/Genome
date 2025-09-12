import { CheckCircle2, AlertCircle } from "lucide-react";

// Enhanced Sequence Input
function SequenceInput({ sequence, setSequence }) {
  const sequenceLength = sequence.length;
  const validBases = sequence.match(/[ATCG]/gi)?.length || 0;
  const isValid = validBases === sequenceLength && sequenceLength > 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">DNA Sequence</label>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Length: {sequenceLength}</span>
          <span className={`flex items-center ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>
      <textarea
        value={sequence}
        onChange={(e) => setSequence(e.target.value.toUpperCase())}
        rows={6}
        placeholder="Paste DNA sequence (A/T/C/G only)..."
        className="w-full border-2 border-gray-200 rounded-xl p-4 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
      />
    </div>
  );
}
export default SequenceInput;