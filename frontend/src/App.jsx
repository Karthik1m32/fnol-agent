import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Synapx Brand Colours ───────────────────────────────────────────────────
const SX = {
  purple:      "#5B2D8E",
  purpleLight: "#7B4DB8",
  purpleDark:  "#3D1A6B",
  purpleBg:    "#F3EEF9",
  teal:        "#00B4AE",
  tealLight:   "#00D4CE",
  tealBg:      "#E6F9F8",
  border:      "#DDD5EC",
};

const GLOBAL_STYLES = `
  :root {
    --sx-purple:       ${SX.purple};
    --sx-purple-light: ${SX.purpleLight};
    --sx-purple-dark:  ${SX.purpleDark};
    --sx-teal:         ${SX.teal};
    --sx-teal-light:   ${SX.tealLight};
    --sx-teal-bg:      ${SX.tealBg};
    --sx-purple-bg:    ${SX.purpleBg};
    --sx-border:       ${SX.border};
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #F5F4F8; color: #1a1a1a; }

  .sx-btn-primary {
    background: var(--sx-purple); color: white; border: none;
    padding: 10px 20px; border-radius: 8px; font-weight: 600;
    cursor: pointer; transition: background 0.2s; font-size: 14px;
  }
  .sx-btn-primary:hover  { background: var(--sx-purple-light); }
  .sx-btn-primary:disabled { background: #ccc; cursor: not-allowed; }

  .sx-btn-teal {
    background: var(--sx-teal); color: white; border: none;
    padding: 10px 20px; border-radius: 8px; font-weight: 600;
    cursor: pointer; transition: background 0.2s; font-size: 14px;
  }
  .sx-btn-teal:hover { background: var(--sx-teal-light); }

  .sx-btn-outline {
    background: white; color: #666; border: 1px solid #ddd;
    padding: 6px 14px; border-radius: 8px; font-size: 13px; cursor: pointer;
  }

  .sx-nav {
    background: white; border-bottom: 3px solid var(--sx-teal);
    box-shadow: 0 2px 8px rgba(91,45,142,0.08);
    display: flex; align-items: center;
    justify-content: space-between; padding: 0 32px; height: 60px;
    position: sticky; top: 0; z-index: 100;
  }
  .sx-logo { color: var(--sx-purple); font-weight: 800; font-size: 20px; display: flex; align-items: center; gap: 8px; }
  .sx-logo span { color: var(--sx-teal); }

  .sx-tab {
    color: #666; font-weight: 500; background: none; border: none;
    cursor: pointer; padding: 8px 4px; font-size: 14px;
    transition: color 0.2s; text-transform: capitalize;
    border-bottom: 2px solid transparent;
  }
  .sx-tab.active { color: var(--sx-purple); border-bottom-color: var(--sx-teal); }
  .sx-tab:hover  { color: var(--sx-purple); }

  .sx-card {
    background: white; border: 1px solid var(--sx-border);
    border-radius: 12px; padding: 20px;
    box-shadow: 0 2px 8px rgba(91,45,142,0.06);
  }

  .sx-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
  .sx-badge-fast       { background: #E6F9F0; color: #0A7A4A; }
  .sx-badge-flag       { background: #FEE8E8; color: #B91C1C; }
  .sx-badge-specialist { background: var(--sx-purple-bg); color: var(--sx-purple); }
  .sx-badge-manual     { background: #FEF3CD; color: #92400E; }
  .sx-badge-standard   { background: #E8F0FE; color: #1E40AF; }
  .sx-badge-teal       { background: var(--sx-teal); color: white; }
  .sx-badge-warning    { background: #FEF3CD; color: #92400E; }

  .sx-route-card {
    border-radius: 12px; border: 2px solid var(--sx-border);
    padding: 24px; background: var(--sx-purple-bg);
  }

  .sx-progress { background: white; border-radius: 99px; height: 6px; border: 1px solid var(--sx-border); overflow: hidden; }
  .sx-progress-bar { height: 100%; background: var(--sx-teal); border-radius: 99px; transition: width 0.6s ease; }

  .sx-drop {
    border: 2px dashed var(--sx-border); border-radius: 12px;
    padding: 28px; text-align: center; cursor: pointer;
    transition: all 0.2s; background: #FAFAFA;
  }
  .sx-drop:hover  { border-color: var(--sx-teal); background: var(--sx-teal-bg); }
  .sx-drop.drag   { border-color: var(--sx-teal); background: var(--sx-teal-bg); }
  .sx-drop.ready  { border-color: var(--sx-purple); background: var(--sx-purple-bg); }

  .sx-field-box   { background: #FAFAFA; border: 1px solid var(--sx-border); border-radius: 10px; padding: 14px; }
  .sx-field-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .sx-field-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
  .sx-field-empty { color: #ccc !important; font-weight: 400 !important; }

  .sx-stat       { background: white; border: 1px solid var(--sx-border); border-radius: 12px; padding: 16px; }
  .sx-stat-label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .sx-stat-value { font-size: 28px; font-weight: 800; }

  .sx-history-card {
    background: white; border: 1px solid var(--sx-border);
    border-radius: 12px; cursor: pointer; transition: border-color 0.2s;
  }
  .sx-history-card:hover { border-color: var(--sx-teal); }

  .sx-empty { text-align: center; padding: 80px 20px; color: #aaa; }

  .sx-json {
    background: #1E1232; color: #00D4CE; font-size: 12px;
    padding: 20px; border-radius: 0 0 10px 10px;
    overflow-x: auto; max-height: 280px; font-family: monospace;
  }

  .sx-missing {
    padding: 6px 10px; background: #FEE8E8; color: #B91C1C;
    border: 1px solid #FECACA; border-radius: 8px; font-size: 12px;
  }

  .sx-sidebar {
    width: 360px; min-width: 360px; padding: 28px; background: white;
    border-right: 1px solid var(--sx-border);
    display: flex; flex-direction: column; gap: 20px;
    min-height: calc(100vh - 60px);
  }
  .sx-main { flex: 1; padding: 28px; overflow-y: auto; }
  .sx-body { display: flex; min-height: calc(100vh - 60px); }

  .sx-tabs-row { display: flex; gap: 32px; }
  .sx-grid-2  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sx-grid-4  { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .sx-flex    { display: flex; align-items: center; }
  .sx-gap-8   { gap: 8px; }
  .sx-gap-12  { gap: 12px; }
  .sx-stack   { display: flex; flex-direction: column; gap: 18px; }

  .sx-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  .pulse { animation: pulse 1.2s ease-in-out infinite; }
`;

// ─── Constants ───────────────────────────────────────────────────────────────
const ROUTE_ICONS = {
  "Fast-track": "⚡", "Investigation Flag": "🚨",
  "Specialist Queue": "🏥", "Manual Review": "📋", "Standard Review": "📁",
};
const ROUTE_BADGE_CLASS = {
  "Fast-track": "sx-badge-fast", "Investigation Flag": "sx-badge-flag",
  "Specialist Queue": "sx-badge-specialist", "Manual Review": "sx-badge-manual",
  "Standard Review": "sx-badge-standard",
};
const CHART_COLORS = [SX.teal, "#B91C1C", SX.purple, "#F59E0B", "#3B82F6"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseMissing(raw) {
  try { return typeof raw === "string" ? JSON.parse(raw || "[]") : (raw || []); }
  catch { return []; }
}

function parseFields(raw) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw || "{}") : (raw || {});
    return parsed.extractedFields || parsed;
  } catch { return {}; }
}

function downloadSingleClaimExcel(fields, route, reasoning, missing, filename = "claim.xlsx") {
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(
    Object.entries(fields).map(([key, value]) => ({
      Field: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      Value: Array.isArray(value) ? value.join(", ") : String(value ?? "—"),
    }))
  );
  const ws2 = XLSX.utils.json_to_sheet([
    { Field: "Recommended Route", Value: route },
    { Field: "Reasoning",         Value: reasoning || "—" },
    { Field: "Missing Fields",    Value: missing.length > 0 ? missing.join(", ") : "None" },
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, "Extracted Fields");
  XLSX.utils.book_append_sheet(wb, ws2, "Routing Summary");
  XLSX.writeFile(wb, filename);
}

function downloadAllClaimsExcel(claims) {
  const rows = claims.map((claim, i) => {
    const fields  = parseFields(claim.extracted_fields || claim.extractedFields);
    const missing = parseMissing(claim.missing_fields  || claim.missingFields);
    return {
      "#": i + 1,
      "Policy Number":     fields.policy_number    || "—",
      "Policyholder Name": fields.policyholder_name || "—",
      "Claimant Name":     fields.claimant_name     || "—",
      "Incident Date":     fields.incident_date     || "—",
      "Incident Location": fields.incident_location || "—",
      "Claim Type":        fields.claim_type        || "—",
      "Asset Type":        fields.asset_type        || "—",
      "Asset ID":          fields.asset_id          || "—",
      "Estimated Damage":  fields.estimated_damage  || "—",
      "Recommended Route": claim.recommended_route  || claim.recommendedRoute || "—",
      "Missing Fields":    missing.length > 0 ? missing.join(", ") : "None",
      "Reasoning":         claim.reasoning           || "—",
      "Processed At":      claim.created_at ? new Date(claim.created_at).toLocaleString() : "—",
    };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, "All Claims");
  XLSX.writeFile(wb, "all_claims_report.xlsx");
}

// ─── Synapx Logo SVG ─────────────────────────────────────────────────────────
function SynapxIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill={SX.purple} opacity="0.1" />
      <circle cx="9"  cy="10" r="3" fill={SX.purple} />
      <circle cx="19" cy="10" r="3" fill={SX.teal} />
      <circle cx="14" cy="18" r="3" fill={SX.purple} />
      <line x1="9"  y1="10" x2="19" y2="10" stroke={SX.purple} strokeWidth="1.5" />
      <line x1="9"  y1="10" x2="14" y2="18" stroke={SX.teal}   strokeWidth="1.5" />
      <line x1="19" y1="10" x2="14" y2="18" stroke={SX.purple} strokeWidth="1.5" />
    </svg>
  );
}

// ─── ExpandableClaimCard ──────────────────────────────────────────────────────
function ExpandableClaimCard({ claim }) {
  const [expanded, setExpanded] = useState(false);
  const route   = claim.recommended_route || claim.recommendedRoute || "Unknown";
  const fields  = parseFields(claim.extracted_fields || claim.extractedFields);
  const missing = parseMissing(claim.missing_fields  || claim.missingFields);

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadSingleClaimExcel(
      fields, route, claim.reasoning, missing,
      `claim_${fields.policy_number || route}_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="sx-history-card" onClick={() => setExpanded(!expanded)}>
      <div style={{ padding: "18px 20px" }}>
        <div className="sx-flex sx-gap-8" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="sx-flex sx-gap-8">
            <span className={`sx-badge ${ROUTE_BADGE_CLASS[route] || ""}`}>
              {ROUTE_ICONS[route]} {route}
            </span>
            {missing.length > 0 && (
              <span className="sx-badge sx-badge-warning">⚠ {missing.length} missing</span>
            )}
          </div>
          <div className="sx-flex sx-gap-12">
            <span style={{ fontSize: 12, color: "#aaa" }}>
              {claim.created_at ? new Date(claim.created_at).toLocaleString() : "—"}
            </span>
            <button
              onClick={handleDownload}
              style={{
                padding: "4px 12px", background: SX.tealBg, color: SX.teal,
                border: `1px solid ${SX.teal}`, borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              ⬇ Excel
            </button>
            <span style={{ color: "#aaa", fontSize: 13 }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <div className="sx-grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div>
            <div className="sx-field-label">Policy Number</div>
            <div className="sx-field-value">{fields.policy_number || "—"}</div>
          </div>
          <div>
            <div className="sx-field-label">Claimant</div>
            <div className="sx-field-value">{fields.claimant_name || "—"}</div>
          </div>
          <div>
            <div className="sx-field-label">Estimated Damage</div>
            <div className="sx-field-value">
              {fields.estimated_damage
                ? `₹${Number(fields.estimated_damage).toLocaleString()}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: "1px solid #EEE", padding: "18px 20px",
          background: "#FAFAFA", borderRadius: "0 0 12px 12px",
        }}>
          <div className="sx-field-label" style={{ marginBottom: 6 }}>Routing Reasoning</div>
          <p style={{ fontSize: 13, color: "#444", marginBottom: 16 }}>{claim.reasoning || "—"}</p>

          <div className="sx-field-label" style={{ marginBottom: 8 }}>All Extracted Fields</div>
          <div className="sx-grid-2" style={{ marginBottom: 12 }}>
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="sx-field-box">
                <div className="sx-field-label">{key.replace(/_/g, " ")}</div>
                <div className="sx-field-value">
                  {Array.isArray(value) ? value.join(", ") : String(value || "—")}
                </div>
              </div>
            ))}
          </div>

          {missing.length > 0 && (
            <>
              <div className="sx-field-label" style={{ marginBottom: 8 }}>Missing Fields</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {missing.map(f => (
                  <span key={f} className="sx-missing">{f.replace(/_/g, " ")}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────
function HistoryTab({ apiUrl }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${apiUrl}/claims/history`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sx-empty"><p>⏳ Loading history...</p></div>
  );

  if (history.length === 0) return (
    <div className="sx-empty">
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗃️</div>
      <p style={{ fontWeight: 600, color: SX.purple }}>No claims processed yet.</p>
      <p style={{ fontSize: 13, marginTop: 6 }}>Go to Dashboard and upload a claim to get started.</p>
    </div>
  );

  return (
    <div className="sx-stack">
      <div className="sx-flex" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: SX.purple }}>Claim History</h2>
          <p style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
            {history.length} claims processed — click any claim to expand
          </p>
        </div>
        <button className="sx-btn-teal" onClick={() => downloadAllClaimsExcel(history)}>
          ⬇ Download All Excel
        </button>
      </div>
      {history.slice().reverse().map((claim, i) => (
        <ExpandableClaimCard key={i} claim={claim} />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file,             setFile]             = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [result,           setResult]           = useState(null);
  const [error,            setError]            = useState(null);
  const [dragOver,         setDragOver]         = useState(false);
  const [showJson,         setShowJson]         = useState(false);
  const [copied,           setCopied]           = useState(false);
  const [activeTab,        setActiveTab]        = useState("dashboard");
  const [analytics,        setAnalytics]        = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handleFile = (f) => { setFile(f); setResult(null); setError(null); setShowJson(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null); setShowJson(false);
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

  const handleDashboardDownload = () => {
    if (!result) return;
    downloadSingleClaimExcel(
      result.extractedFields,
      result.recommendedRoute,
      result.reasoning,
      result.missingFields,
      `claim_${result.extractedFields?.policy_number || "report"}.xlsx`
    );
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res    = await axios.get(`${API_URL}/claims/history`);
      const claims = res.data;
      const routeCount = {}, claimTypeCount = {}, missingFieldsFreq = {};
      let totalDamage = 0, claimCount = 0;

      claims.forEach(claim => {
        const fields  = parseFields(claim.extracted_fields || claim.extractedFields);
        const missing = parseMissing(claim.missing_fields  || claim.missingFields);
        const route   = claim.recommended_route || claim.recommendedRoute || "Unknown";

        routeCount[route] = (routeCount[route] || 0) + 1;
        const claimType = fields.claim_type || fields.claimType || "Unknown";
        claimTypeCount[claimType] = (claimTypeCount[claimType] || 0) + 1;
        const damage = Number(fields.estimated_damage || fields.estimatedDamage || 0);
        if (!isNaN(damage)) totalDamage += damage;
        claimCount++;
        missing.forEach(f => { missingFieldsFreq[f] = (missingFieldsFreq[f] || 0) + 1; });
      });

      // avg damage per route
      const routeDamageSum   = {};
      const routeDamageCount = {};
      claims.forEach(claim => {
        const fields = parseFields(claim.extracted_fields || claim.extractedFields);
        const route  = claim.recommended_route || claim.recommendedRoute || "Unknown";
        const damage = Number(fields.estimated_damage || fields.estimatedDamage || 0);
        if (!isNaN(damage) && damage > 0) {
          routeDamageSum[route]   = (routeDamageSum[route]   || 0) + damage;
          routeDamageCount[route] = (routeDamageCount[route] || 0) + 1;
        }
      });
      const avgDamageByRoute = Object.keys(routeDamageSum).map(route => ({
        route,
        avgDamage: Math.round(routeDamageSum[route] / routeDamageCount[route]),
        count:     routeDamageCount[route],
      })).sort((a, b) => b.avgDamage - a.avgDamage);

      setAnalytics({
        totalClaims:   claimCount,
        routeData:     Object.entries(routeCount).map(([name, value]) => ({ name, value })),
        claimTypeData: Object.entries(claimTypeCount).map(([name, value]) => ({ name, value })),
        avgDamage:     claimCount > 0 ? Math.round(totalDamage / claimCount) : 0,
        totalDamage,
        missingFieldsData: Object.entries(missingFieldsFreq)
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([field, count]) => ({ name: field.replace(/_/g, " "), count })),
        fraudRate: claims.filter(c =>
          (c.recommended_route || c.recommendedRoute) === "Investigation Flag"
        ).length,
        avgDamageByRoute,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const completeness = result
    ? Math.round(
        (Object.values(result.extractedFields).filter(Boolean).length /
          (Object.values(result.extractedFields).length + result.missingFields.length)) * 100
      )
    : 0;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Navigation ── */}
      <nav className="sx-nav">
        <div className="sx-logo">
          <SynapxIcon size={28} />
          Claims<span>Intel</span>
        </div>

        <div className="sx-tabs-row">
          {["dashboard", "analytics", "history"].map(tab => (
            <button
              key={tab}
              className={`sx-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          className="sx-btn-primary"
          onClick={handleSubmit}
          disabled={!file || loading || activeTab !== "dashboard"}
        >
          ▶ Process Claim
        </button>
      </nav>

      <div className="sx-body">

        {/* ── Sidebar (Dashboard only) ── */}
        {activeTab === "dashboard" && (
          <div className="sx-sidebar">
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: SX.purple, marginBottom: 6 }}>
                Claims Processor
              </h1>
              <p style={{ fontSize: 13, color: "#777" }}>
                Upload any claim document — AI extracts, validates, and routes in seconds.
              </p>
            </div>

            {/* Drop Zone */}
            <div
              className={`sx-drop ${dragOver ? "drag" : ""} ${file ? "ready" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput" type="file" accept=".txt,.pdf"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="sx-flex sx-gap-12" style={{ textAlign: "left" }}>
                  <span style={{ fontSize: 28 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: SX.purple }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: "#999" }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: SX.teal }}>● READY</span>
                </div>
              ) : (
                <div style={{ color: "#aaa", fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                  <p>Drag & drop or click to upload</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Supports .txt and .pdf</p>
                </div>
              )}
            </div>

            <button
              className="sx-btn-primary"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleSubmit}
              disabled={!file || loading}
            >
              {loading ? "⏳ Processing..." : "📄 Process PDF"}
            </button>

            {result && (
              <button
                className="sx-btn-teal"
                style={{ width: "100%", padding: "12px" }}
                onClick={handleDashboardDownload}
              >
                ⬇ Download Extracted Data (Excel)
              </button>
            )}


          </div>
        )}

        {/* ── Main Content ── */}
        <div className="sx-main">

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <>
              {!result && !loading && !error && (
                <div className="sx-empty">
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: SX.purple }}>
                    Upload a claim to get started
                  </p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>
                    AI will extract, validate and route it instantly
                  </p>
                </div>
              )}

              {loading && (
                <div className="sx-empty">
                  <div style={{ fontSize: 52, marginBottom: 16 }} className="pulse">⚡</div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: SX.teal }}>
                    Analysing claim...
                  </p>
                </div>
              )}

              {error && (
                <div style={{
                  padding: 16, background: "#FEE8E8",
                  border: "1px solid #FECACA", borderRadius: 12,
                  color: "#B91C1C", fontSize: 14,
                }}>
                  ❌ {error}
                </div>
              )}

              {result && (
                <div className="sx-stack">
                  {/* Status bar */}
                  <div className="sx-flex" style={{ justifyContent: "space-between" }}>
                    <div className="sx-flex sx-gap-8" style={{ color: SX.teal, fontSize: 13, fontWeight: 600 }}>
                      <span className="sx-dot" style={{ background: SX.teal }} />
                      Claim processed successfully
                    </div>
                    <button
                      className="sx-btn-outline"
                      onClick={() => { setResult(null); setFile(null); }}
                    >
                      ↻ Process Another
                    </button>
                  </div>

                  {/* Route Card */}
                  <div className="sx-route-card">
                    <div className="sx-flex" style={{ justifyContent: "space-between", marginBottom: 16 }}>
                      <div className="sx-flex sx-gap-8">
                        <span className="sx-badge" style={{ background: "white", color: "#666", border: "1px solid #ddd" }}>
                          INSURANCE CLAIM
                        </span>
                        <span className="sx-badge" style={{
                          background: completeness > 70 ? "#E6F9F0" : "#FEE8E8",
                          color: completeness > 70 ? "#0A7A4A" : "#B91C1C",
                        }}>
                          ● {completeness > 70 ? "High" : completeness > 40 ? "Medium" : "Low"} Confidence
                        </span>
                      </div>
                      <span className="sx-badge sx-badge-teal">● AI PROCESSED</span>
                    </div>

                    <div className="sx-field-label" style={{ marginBottom: 4 }}>Route Decision</div>
                    <h2 style={{ fontSize: 36, fontWeight: 900, color: SX.purple, marginBottom: 16 }}>
                      {ROUTE_ICONS[result.recommendedRoute]} {result.recommendedRoute}
                    </h2>

                    <div style={{ marginBottom: 16 }}>
                      <div className="sx-flex" style={{ justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        <span>Completeness</span>
                        <span style={{ color: SX.teal, fontWeight: 700 }}>{completeness}%</span>
                      </div>
                      <div className="sx-progress">
                        <div className="sx-progress-bar" style={{ width: `${completeness}%` }} />
                      </div>
                    </div>

                    <div style={{
                      background: "rgba(255,255,255,0.8)", borderRadius: 10,
                      padding: 16, border: `1px solid ${SX.border}`,
                    }}>
                      <div className="sx-field-label" style={{ marginBottom: 6 }}>Routing Reasoning</div>
                      <p style={{ fontSize: 13, color: "#444" }}>{result.reasoning}</p>
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="sx-card">
                    <p style={{ fontWeight: 700, fontSize: 14, color: SX.purple, marginBottom: 14 }}>
                      ⌥ Extracted Entity Data
                    </p>
                    <div className="sx-grid-2">
                      {[
                        { key: "policy_number",        label: "Policy Number" },
                        { key: "claimant_name",         label: "Claimant Name" },
                        { key: "incident_date",         label: "Incident Date" },
                        { key: "estimated_damage",      label: "Estimated Damage" },
                        { key: "claim_type",            label: "Claim Type" },
                        { key: "incident_description",  label: "Incident Description" },
                        { key: "asset_id",              label: "Claim Number" },
                        { key: "contact_details",       label: "Contact Details" },
                      ].map(({ key, label }) => {
                        const value = result.extractedFields[key];
                        return (
                          <div key={key} className="sx-field-box">
                            <div className="sx-field-label">{label}</div>
                            <div className={`sx-field-value ${value ? "" : "sx-field-empty"}`}>
                              {value
                                ? Array.isArray(value) ? value.join(", ") : String(value)
                                : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div className="sx-card" style={{ padding: 0, overflow: "hidden" }}>
                    <button
                      onClick={() => setShowJson(!showJson)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        justifyContent: "space-between", padding: "14px 18px",
                        background: "none", border: "none", cursor: "pointer",
                      }}
                    >
                      <div className="sx-flex sx-gap-8">
                        <span style={{ fontWeight: 700, fontSize: 13, color: SX.purple }}>
                          ⌥ Raw JSON Response
                        </span>
                        <span className="sx-badge" style={{ background: "#E8F0FE", color: "#1E40AF" }}>
                          API
                        </span>
                      </div>
                      <span style={{ color: "#aaa" }}>{showJson ? "▲" : "▼"}</span>
                    </button>
                    {showJson && (
                      <>
                        <div className="sx-flex" style={{
                          justifyContent: "space-between", padding: "8px 18px",
                          background: "#FAFAFA", borderTop: "1px solid #eee",
                        }}>
                          <span style={{ fontSize: 11, color: "#aaa" }}>application/json</span>
                          <button
                            onClick={handleCopy}
                            style={{ fontSize: 11, color: "#666", background: "none", border: "none", cursor: "pointer" }}
                          >
                            {copied ? "✅ Copied!" : "📋 Copy"}
                          </button>
                        </div>
                        <pre className="sx-json">{JSON.stringify(result, null, 2)}</pre>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="sx-stack">
              <div className="sx-flex" style={{ justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: SX.purple }}>Claims Analytics</h2>
                  <p style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
                    Real-time insights from all processed claims
                  </p>
                </div>
                <button
                  style={{
                    padding: "8px 16px", background: "#FEE8E8", color: "#B91C1C",
                    border: "1px solid #FECACA", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                  onClick={async () => {
                    if (window.confirm("Clear all claims data? This cannot be undone.")) {
                      try {
                        await axios.delete(`${API_URL}/claims/clear`);
                        setAnalytics(null);
                        alert("✅ All claims data cleared!");
                      } catch { alert("❌ Failed to clear data."); }
                    }
                  }}
                >
                  🗑 Clear All Data
                </button>
              </div>

              {analyticsLoading && (
                <div className="sx-empty"><p>⏳ Loading analytics...</p></div>
              )}

              {analytics && !analyticsLoading && (
                <>
                  <div className="sx-grid-4">
                    {[
                      { label: "Total Claims",   value: analytics.totalClaims,                       color: SX.purple },
                      { label: "Avg Damage",     value: `₹${(analytics.avgDamage / 1000).toFixed(1)}k`, color: SX.teal },
                      { label: "Total Exposure", value: `₹${(analytics.totalDamage / 1000).toFixed(0)}k`, color: "#0A7A4A" },
                      { label: "Fraud Flags",    value: analytics.fraudRate,                         color: "#B91C1C" },
                    ].map(s => (
                      <div key={s.label} className="sx-stat">
                        <div className="sx-stat-label">{s.label}</div>
                        <div className="sx-stat-value" style={{ color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="sx-grid-2">
                    <div className="sx-card">
                      <p style={{ fontWeight: 700, fontSize: 13, color: SX.purple, marginBottom: 12 }}>
                        📊 Claims by Route
                      </p>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={analytics.routeData} cx="50%" cy="50%"
                            outerRadius={80} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                          >
                            {analytics.routeData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="sx-card">
                      <p style={{ fontWeight: 700, fontSize: 13, color: SX.purple, marginBottom: 12 }}>
                        📊 Claims by Type
                      </p>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analytics.claimTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill={SX.purple} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Avg Damage by Route ── */}
                  {analytics.avgDamageByRoute?.length > 0 && (
                    <div className="sx-card">
                      <div className="sx-flex" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: SX.purple }}>
                          💰 Average Claim Value by Route
                        </p>
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          Helps prioritise high-value claim routes
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
                        Higher average damage on <strong style={{ color: "#B91C1C" }}>Investigation Flag</strong> routes
                        can signal organised fraud — low volume, high value claims warrant closer scrutiny.
                      </p>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={analytics.avgDamageByRoute}
                          layout="vertical"
                          margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis
                            type="number"
                            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                            style={{ fontSize: 11 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="route"
                            width={130}
                            style={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Avg Damage"]}
                            labelStyle={{ fontWeight: 700, color: SX.purple }}
                          />
                          <Bar dataKey="avgDamage" radius={[0, 6, 6, 0]}>
                            {analytics.avgDamageByRoute.map((entry, i) => {
                              const colour =
                                entry.route === "Investigation Flag" ? "#B91C1C"
                                : entry.route === "Fast-track"       ? SX.teal
                                : entry.route === "Specialist Queue" ? SX.purple
                                : entry.route === "Manual Review"    ? "#F59E0B"
                                : "#3B82F6";
                              return <Cell key={i} fill={colour} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="sx-flex" style={{ flexWrap: "wrap", gap: 12, marginTop: 12, justifyContent: "center" }}>
                        {analytics.avgDamageByRoute.map((entry, i) => {
                          const colour =
                            entry.route === "Investigation Flag" ? "#B91C1C"
                            : entry.route === "Fast-track"       ? SX.teal
                            : entry.route === "Specialist Queue" ? SX.purple
                            : entry.route === "Manual Review"    ? "#F59E0B"
                            : "#3B82F6";
                          return (
                            <div key={i} className="sx-flex sx-gap-8" style={{ fontSize: 11, color: "#555" }}>
                              <span className="sx-dot" style={{ background: colour, minWidth: 8 }} />
                              {entry.route} ({entry.count} claim{entry.count > 1 ? "s" : ""})
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {analytics.missingFieldsData.length > 0 && (
                    <div className="sx-card">
                      <p style={{ fontWeight: 700, fontSize: 13, color: SX.purple, marginBottom: 12 }}>
                        ⚠️ Most Frequently Missing Fields
                      </p>
                      <div className="sx-stack" style={{ gap: 12 }}>
                        {analytics.missingFieldsData.map((field, i) => (
                          <div key={i}>
                            <div className="sx-flex" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                              <span style={{ color: "#555", fontWeight: 500, textTransform: "capitalize" }}>
                                {field.name}
                              </span>
                              <span style={{ fontWeight: 700, color: "#B91C1C" }}>
                                {field.count} claim{field.count > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="sx-progress">
                              <div
                                className="sx-progress-bar"
                                style={{
                                  width: `${(field.count / analytics.totalClaims) * 100}%`,
                                  background: "#F87171",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!analytics && !analyticsLoading && (
                <div className="sx-empty">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                  <p>No claims data yet. Process some claims first!</p>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && <HistoryTab apiUrl={API_URL} />}

        </div>
      </div>
    </>
  );
}
