import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROUTE_COLORS = {
  "Fast-track": "text-green-700 border-green-400 bg-green-50",
  "Investigation Flag": "text-red-700 border-red-400 bg-red-50",
  "Specialist Queue": "text-purple-700 border-purple-400 bg-purple-50",
  "Manual Review": "text-yellow-700 border-yellow-400 bg-yellow-50",
  "Standard Review": "text-blue-700 border-blue-400 bg-blue-50",
};

const ROUTE_ICONS = {
  "Fast-track": "⚡",
  "Investigation Flag": "🚨",
  "Specialist Queue": "🏥",
  "Manual Review": "📋",
  "Standard Review": "📁",
};

const DEMO_SCENARIOS = [
  { label: "Auto Accident", icon: "🚗" },
  { label: "Medical / Injury", icon: "🏥" },
  { label: "Property Damage", icon: "🏠" },
  { label: "Policy Fraud", icon: "🚨" },
];

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setError(null);
    setShowJson(false);
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
    setShowJson(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const routeStyle = result ? ROUTE_COLORS[result.recommendedRoute] || "text-gray-700 border-gray-400 bg-gray-50" : "";
  const routeIcon = result ? ROUTE_ICONS[result.recommendedRoute] || "📄" : "";
  const completeness = result
    ? Math.round((Object.values(result.extractedFields).filter(Boolean).length /
        (Object.values(result.extractedFields).length + result.missingFields.length)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
          ⚡ Claims Intel
        </div>
        <div className="flex gap-8 text-sm text-gray-500">
          <span className="text-purple-600 border-b-2 border-purple-500 pb-1 cursor-pointer font-medium">Dashboard</span>
          <span className="cursor-pointer hover:text-gray-900">Analytics</span>
          <span className="cursor-pointer hover:text-gray-900">History</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-semibold"
        >
          ▶ Process Claim
        </button>
      </nav>

      <div className="flex min-h-screen">

        {/* Left Panel */}
        <div className="w-96 p-8 bg-white border-r border-gray-200 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Claims Processor</h1>
            <p className="text-gray-500 text-sm">
              Upload any claim document — AI extracts, validates, and routes in seconds.
            </p>
          </div>

          {/* Upload Box */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? "border-purple-400 bg-purple-50" :
              file ? "border-green-400 bg-green-50" :
              "border-gray-300 bg-gray-50"
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
            {file ? (
              <div className="flex items-center gap-3 text-left">
                <div className="text-3xl">📄</div>
                <div>
                  <p className="text-green-700 font-medium text-sm">{file.name}</p>
                  <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <span className="ml-auto text-green-600 text-xs font-bold">● READY</span>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                <div className="text-3xl mb-2">📂</div>
                <p>Drag & drop or click to upload</p>
                <p className="text-xs mt-1">Supports .txt and .pdf</p>
              </div>
            )}
          </div>

          {/* Process Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold transition-colors"
          >
            {loading ? "⏳ Processing..." : "📄 Process PDF"}
          </button>

          {/* Quick Demo Scenarios */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Quick Demo Scenarios</p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_SCENARIOS.map((s) => (
                <div key={s.label} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 cursor-pointer transition-colors">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          {!result && !loading && !error && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-xl font-semibold text-gray-600">Upload a claim to get started</p>
                <p className="text-sm mt-2">AI will extract, validate and route it instantly</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-full text-purple-500">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-pulse">⚡</div>
                <p className="text-lg font-semibold">Analysing claim...</p>
                <p className="text-sm text-gray-400 mt-1">AI is extracting and routing</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="space-y-5">

              {/* Success Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  Claim processed successfully
                </div>
                <button
                  onClick={() => { setResult(null); setFile(null); }}
                  className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-1.5 rounded-lg bg-white"
                >
                  ↻ Process Another
                </button>
              </div>

              {/* Route Decision */}
              <div className={`rounded-xl border-2 p-6 ${routeStyle}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium">INSURANCE CLAIM</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      completeness > 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      ● {completeness > 70 ? "High" : completeness > 40 ? "Medium" : "Low"} Confidence
                    </span>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">● AI PROCESSED</span>
                </div>

                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Route Decision</p>
                <h2 className="text-4xl font-bold mb-4">{routeIcon} {result.recommendedRoute}</h2>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Completeness</span>
                    <span>{completeness}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-1.5 border border-gray-200">
                    <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${completeness}%` }}></div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Routing Reasoning</p>
                  <p className="text-sm text-gray-700">{result.reasoning}</p>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-4">⌥ Extracted Entity Data</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "policy_number", label: "Policy Number" },
                    { key: "claimant_name", label: "Claimant Name" },
                    { key: "incident_date", label: "Incident Date" },
                    { key: "estimated_damage", label: "Estimated Damage" },
                    { key: "claim_type", label: "Claim Type" },
                    { key: "incident_description", label: "Incident Description" },
                    { key: "asset_id", label: "Claim Number" },
                    { key: "contact_details", label: "Contact Details" },
                  ].map(({ key, label }) => {
                    const value = result.extractedFields[key];
                    return (
                      <div key={key} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                        <p className={`text-sm font-medium ${value ? "text-gray-900" : "text-gray-300"}`}>
                          {value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Required Action */}
              {result.missingFields.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-semibold text-yellow-600 mb-3">⚠ Required Action</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-red-600 text-sm font-medium">
                      ⚠ {result.missingFields.length} mandatory field(s) missing — routed to {result.recommendedRoute}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {result.missingFields.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm">
                        <span className="text-red-400">ⓘ</span>
                        <span className="text-gray-800 font-medium capitalize">{f.replace(/_/g, " ")}</span>
                        <span className="text-gray-400">— Required field not found in document</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-Time Verification */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">📊 Real-Time Verification</p>
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                  {completeness === 100 ? (
                    <div className="text-green-600">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-medium">All fields verified</p>
                    </div>
                  ) : (
                    <div className="text-yellow-600">
                      <div className="text-3xl mb-2">⚠️</div>
                      <p className="font-medium">Manual verification required</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw JSON */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">⌥ Raw JSON Response</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">API</span>
                  </div>
                  <span className="text-gray-400 text-sm">{showJson ? "▲" : "▼"}</span>
                </button>
                {showJson && (
                  <div>
                    <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-gray-50">
                      <span className="text-xs text-gray-400">application/json</span>
                      <button onClick={handleCopy} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
                        {copied ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 text-xs p-5 overflow-x-auto max-h-80">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold">
                  ✓ Confirm & Dispatch
                </button>
                <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold">
                  ✏ Manual Override
                </button>
                <button className="py-3 px-5 bg-white hover:bg-red-50 border border-gray-200 text-red-500 rounded-xl font-semibold">
                  🗑 Discard
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}