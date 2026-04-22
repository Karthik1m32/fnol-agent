import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROUTE_COLORS = {
  "Fast-track": "bg-green-100 text-green-800 border-green-300",
  "Investigation Flag": "bg-red-100 text-red-800 border-red-300",
  "Specialist Queue": "bg-purple-100 text-purple-800 border-purple-300",
  "Manual Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Standard Review": "bg-blue-100 text-blue-800 border-blue-300",
};

const ROUTE_ICONS = {
  "Fast-track": "⚡",
  "Investigation Flag": "🚨",
  "Specialist Queue": "🏥",
  "Manual Review": "📋",
  "Standard Review": "📁",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/claims/upload`, formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const routeColor = result
    ? ROUTE_COLORS[result.recommendedRoute] || "bg-gray-100 text-gray-800"
    : "";
  const routeIcon = result ? ROUTE_ICONS[result.recommendedRoute] || "📄" : "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ FNOL Claims Agent</h1>
          <p className="text-gray-500 mt-1">
            Upload a claim document — AI will extract, validate and route it instantly.
          </p>
        </div>

        {/* Upload Box */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".txt,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="text-5xl mb-3">📂</div>
          {file ? (
            <p className="text-blue-600 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">Drag & drop or click to upload</p>
              <p className="text-gray-400 text-sm mt-1">Supports .txt and .pdf</p>
            </>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="mt-4 w-full py-3 rounded-xl text-white font-semibold text-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Analysing claim..." : "🔍 Analyse Claim"}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">

            {/* Routing Decision */}
            <div className={`p-5 rounded-xl border-2 ${routeColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{routeIcon}</span>
                <div>
                  <p className="text-sm font-medium opacity-70">Recommended Route</p>
                  <p className="text-2xl font-bold">{result.recommendedRoute}</p>
                </div>
              </div>
              <p className="mt-3 text-sm opacity-80">{result.reasoning}</p>
            </div>

            {/* Missing Fields */}
            {result.missingFields.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="font-semibold text-yellow-800 mb-2">⚠️ Missing Fields</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingFields.map((f) => (
                    <span key={f} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Fields */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl">
              <p className="font-semibold text-gray-700 mb-3">📋 Extracted Fields</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(result.extractedFields).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-800 font-medium mt-0.5">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}