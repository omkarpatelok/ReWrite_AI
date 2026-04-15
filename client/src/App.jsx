import { useState, useRef } from "react";

const TONES = [
  { id: "natural", label: "Natural", prompt: "natural and conversational, like a real person talking" },
  { id: "formal", label: "Formal", prompt: "polished and formal, like a professional report" },
  { id: "casual", label: "Casual", prompt: "casual and relaxed, like texting a friend" },
  { id: "academic", label: "Academic", prompt: "academic and scholarly but still readable" },
];

const MAX_CHARS = 10000;
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const GRADE_COLOR = {
  "Human": "#2d7a4f",
  "Mostly Human": "#4a9e6b",
  "Mixed": "#c9a84c",
  "Possibly AI": "#d4773a",
  "Likely AI": "#b84a2e",
};

const RISK_COLOR = {
  "Very Low": "#2d7a4f",
  "Low": "#4a9e6b",
  "Medium": "#d4773a",
  "High": "#b84a2e",
};

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [tone, setTone] = useState("natural");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [scoreTarget, setScoreTarget] = useState("output"); // "input" or "output"

  const selectedTone = TONES.find((t) => t.id === tone);
  const charCount = input.length;
  const overLimit = charCount > MAX_CHARS;

  const handleRewrite = async () => {
    if (!input.trim()) return;
    if (overLimit) { setError(`Text too long. Max ${MAX_CHARS} characters.`); return; }

    setLoading(true);
    setError("");
    setOutput("");
    setScoreData(null);

    try {
      const res = await fetch(`${API}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, tonePrompt: selectedTone.prompt }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.result);
    } catch (err) {
      setError(err.message || "Something went wrong. Make sure the backend is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (target) => {
    const text = target === "input" ? input : output;
    if (!text.trim()) return;

    setScoring(true);
    setScoreTarget(target);
    setScoreData(null);

    try {
      const res = await fetch(`${API}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Scoring failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScoreData({ ...data, target });
    } catch (err) {
      setError("Scoring error: " + (err.message || "Unknown"));
    } finally {
      setScoring(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">✦</span>
            <span className="logo-text">ReWrite<em>AI</em></span>
          </div>
          <p className="tagline">Humanize AI text · Bypass AI detectors</p>
        </div>
        <div className="header-rule" />
      </header>

      <main className="main">
        {/* Tone Selector */}
        <section className="controls-row">
          <div className="control-group">
            <label className="section-label">Tone</label>
            <div className="tone-tabs">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  className={`tone-tab ${tone === t.id ? "active" : ""}`}
                  onClick={() => setTone(t.id)}
                >{t.label}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Editor Grid */}
        <div className="editor-grid">
          {/* Input Panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Input</span>
              <div className="panel-header-right">
                {input.trim() && (
                  <button
                    className="score-btn"
                    onClick={() => handleScore("input")}
                    disabled={scoring}
                  >
                    {scoring && scoreTarget === "input" ? "Analyzing…" : "Check Score"}
                  </button>
                )}
                <span className={`char-count ${overLimit ? "over" : ""}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>
            <textarea
              className="editor-textarea"
              placeholder="Paste your AI-generated text here..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              spellCheck={true}
            />
            {error && <p className="error-msg">⚠ {error}</p>}
          </div>

          {/* Middle column */}
          <div className="divider-col">
            <div className="divider-line" />
            <button
              className={`rewrite-btn ${loading ? "loading" : ""} ${overLimit || !input.trim() ? "disabled" : ""}`}
              onClick={handleRewrite}
              disabled={loading || overLimit || !input.trim()}
            >
              {loading ? <span className="spinner" /> : (
                <><span className="btn-arrow">→</span><span className="btn-label">Rewrite</span></>
              )}
            </button>
            <div className="divider-line" />
          </div>

          {/* Output Panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Output</span>
              <div className="panel-header-right">
                {output && (
                  <>
                    <button
                      className="score-btn"
                      onClick={() => handleScore("output")}
                      disabled={scoring}
                    >
                      {scoring && scoreTarget === "output" ? "Analyzing…" : "Check Score"}
                    </button>
                    <button className="copy-btn" onClick={handleCopy}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className={`editor-output ${output ? "has-content" : ""}`}>
              {loading ? (
                <div className="loading-lines">
                  <div className="loading-line w80" />
                  <div className="loading-line w60" />
                  <div className="loading-line w90" />
                  <div className="loading-line w50" />
                  <div className="loading-line w70" />
                </div>
              ) : output ? output : (
                <span className="placeholder-text">Your humanized text will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {/* Score Panel */}
        {(scoring || scoreData) && (
          <div className="score-panel">
            <div className="score-panel-header">
              <span className="score-panel-title">
                ◈ AI Detection Analysis
                <span className="score-panel-subtitle">
                  — analyzing {scoreData?.target === "input" ? "original input" : "rewritten output"}
                </span>
              </span>
              {scoreData && (
                <button className="close-btn" onClick={() => setScoreData(null)}>✕</button>
              )}
            </div>

            {scoring ? (
              <div className="score-loading">
                <div className="loading-lines" style={{maxWidth: 400}}>
                  <div className="loading-line w60" />
                  <div className="loading-line w80" />
                  <div className="loading-line w40" />
                </div>
                <p style={{marginTop: "1rem", fontSize: "0.8rem", color: "var(--muted)"}}>Running AI detection analysis...</p>
              </div>
            ) : scoreData && (
              <div className="score-content">
                {/* Big meters */}
                <div className="score-meters">
                  <div className="meter-block">
                    <div className="meter-label">Human Score</div>
                    <div className="meter-bar-wrap">
                      <div
                        className="meter-bar human"
                        style={{ width: `${scoreData.humanScore}%` }}
                      />
                    </div>
                    <div className="meter-value" style={{ color: GRADE_COLOR[scoreData.grade] || "#2d7a4f" }}>
                      {scoreData.humanScore}%
                    </div>
                  </div>
                  <div className="meter-block">
                    <div className="meter-label">AI Score</div>
                    <div className="meter-bar-wrap">
                      <div
                        className="meter-bar ai"
                        style={{ width: `${scoreData.aiScore}%` }}
                      />
                    </div>
                    <div className="meter-value" style={{ color: RISK_COLOR[scoreData.turnitinRisk] || "#b84a2e" }}>
                      {scoreData.aiScore}%
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="score-badges">
                  <div className="badge-item">
                    <span className="badge-label">Detection Grade</span>
                    <span
                      className="badge-value"
                      style={{
                        background: (GRADE_COLOR[scoreData.grade] || "#888") + "22",
                        color: GRADE_COLOR[scoreData.grade] || "#888",
                        border: `1px solid ${(GRADE_COLOR[scoreData.grade] || "#888")}44`,
                      }}
                    >{scoreData.grade}</span>
                  </div>
                  <div className="badge-item">
                    <span className="badge-label">Turnitin Risk</span>
                    <span
                      className="badge-value"
                      style={{
                        background: (RISK_COLOR[scoreData.turnitinRisk] || "#888") + "22",
                        color: RISK_COLOR[scoreData.turnitinRisk] || "#888",
                        border: `1px solid ${(RISK_COLOR[scoreData.turnitinRisk] || "#888")}44`,
                      }}
                    >{scoreData.turnitinRisk} Risk</span>
                  </div>
                </div>

                {/* Summary */}
                <p className="score-summary">{scoreData.summary}</p>

                {/* Flags */}
                {scoreData.flags && scoreData.flags.length > 0 && (
                  <div className="score-flags">
                    <span className="flags-label">AI Patterns Detected:</span>
                    <div className="flags-list">
                      {scoreData.flags.map((f, i) => (
                        <span key={i} className="flag-tag">⚑ {f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {scoreData.flags && scoreData.flags.length === 0 && (
                  <div className="score-flags clean">
                    <span className="flags-label">✓ No AI patterns detected</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="footer-note">
          Designed & Developed by Omkar Patel · 10,000 character limit · Use "Check Score" to test detection risk
        </p>
      </main>

      <style>{`
        .app { min-height: 100vh; display: flex; flex-direction: column; }

        /* Header */
        .header { padding: 2.5rem 2rem 0; max-width: 1140px; margin: 0 auto; width: 100%; }
        .header-inner { display: flex; align-items: baseline; gap: 1.5rem; margin-bottom: 1.25rem; }
        .logo { display: flex; align-items: center; gap: 0.5rem; }
        .logo-mark { color: var(--gold); font-size: 1.2rem; animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .logo-text { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em; }
        .logo-text em { font-style: italic; color: var(--gold); }
        .tagline { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; }
        .header-rule { height: 1px; background: linear-gradient(to right, var(--gold), transparent); }

        /* Main */
        .main { flex: 1; max-width: 1140px; margin: 0 auto; width: 100%; padding: 2rem 2rem 4rem; }

        /* Controls */
        .controls-row { display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; }
        .control-group { display: flex; align-items: center; gap: 0.75rem; }
        .section-label { font-family: 'DM Mono', monospace; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .tone-tabs { display: flex; gap: 0.4rem; background: var(--cream); border: 1px solid var(--border); border-radius: 6px; padding: 4px; }
        .tone-tab { padding: 0.35rem 0.9rem; border: none; border-radius: 4px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: var(--muted); cursor: pointer; transition: all 0.2s; }
        .tone-tab:hover { color: var(--ink); }
        .tone-tab.active { background: var(--ink); color: var(--paper); font-weight: 500; }

        /* Editor Grid */
        .editor-grid { display: grid; grid-template-columns: 1fr auto 1fr; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 24px var(--shadow); background: #faf7f2; }

        /* Panel */
        .panel { display: flex; flex-direction: column; min-height: 360px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); background: var(--cream); gap: 0.5rem; }
        .panel-title { font-family: 'DM Mono', monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .panel-header-right { display: flex; align-items: center; gap: 0.5rem; }
        .char-count { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--muted); }
        .char-count.over { color: var(--rust); font-weight: 500; }

        .editor-textarea { flex: 1; border: none; outline: none; resize: none; padding: 1.25rem; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; line-height: 1.7; color: var(--ink); background: transparent; font-weight: 300; }
        .editor-textarea::placeholder { color: #b0a898; }
        .editor-output { flex: 1; padding: 1.25rem; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; line-height: 1.7; color: var(--ink); font-weight: 300; white-space: pre-wrap; word-break: break-word; }
        .placeholder-text { color: #b0a898; }

        /* Buttons */
        .score-btn { padding: 0.25rem 0.65rem; border: 1px solid var(--gold); border-radius: 4px; background: transparent; font-family: 'DM Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--gold); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .score-btn:hover:not(:disabled) { background: var(--gold); color: var(--ink); }
        .score-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .copy-btn { padding: 0.25rem 0.65rem; border: 1px solid var(--border); border-radius: 4px; background: transparent; font-family: 'DM Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

        /* Divider col */
        .divider-col { display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--cream); padding: 1rem 0; width: 90px; }
        .divider-line { flex: 1; width: 1px; background: var(--border); }
        .rewrite-btn { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 1rem 0.5rem; border: 1px solid var(--gold); border-radius: 8px; background: var(--ink); color: var(--gold); cursor: pointer; transition: all 0.2s; width: 56px; margin: 0.75rem 0; }
        .rewrite-btn:hover:not(.disabled):not(.loading) { background: var(--gold); color: var(--ink); transform: scale(1.05); box-shadow: 0 4px 16px rgba(201,168,76,0.3); }
        .rewrite-btn.disabled { opacity: 0.35; cursor: not-allowed; border-color: var(--border); }
        .btn-arrow { font-size: 1.1rem; line-height: 1; }
        .btn-label { font-family: 'DM Mono', monospace; font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(201,168,76,0.3); border-top-color: var(--gold); border-radius: 50%; animation: rotate 0.7s linear infinite; }
        @keyframes rotate { to { transform: rotate(360deg); } }

        /* Error */
        .error-msg { padding: 0.5rem 1.25rem; font-size: 0.78rem; color: var(--rust); font-family: 'DM Mono', monospace; border-top: 1px solid #f0d0c8; background: #fdf5f3; }

        /* Loading */
        .loading-lines { display: flex; flex-direction: column; gap: 0.6rem; padding-top: 0.25rem; }
        .loading-line { height: 14px; border-radius: 4px; background: linear-gradient(90deg, var(--cream) 25%, var(--border) 50%, var(--cream) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .w40 { width: 40%; } .w50 { width: 50%; } .w60 { width: 60%; } .w70 { width: 70%; } .w80 { width: 80%; } .w90 { width: 90%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Score Panel */
        .score-panel { margin-top: 1.5rem; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: #faf7f2; box-shadow: 0 4px 24px var(--shadow); }
        .score-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.25rem; background: var(--cream); border-bottom: 1px solid var(--border); }
        .score-panel-title { font-family: 'DM Mono', monospace; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink); }
        .score-panel-subtitle { color: var(--muted); font-weight: 300; text-transform: none; letter-spacing: 0; }
        .close-btn { border: none; background: transparent; color: var(--muted); cursor: pointer; font-size: 0.85rem; padding: 0.25rem 0.5rem; border-radius: 4px; transition: all 0.15s; }
        .close-btn:hover { background: var(--border); color: var(--ink); }
        .score-loading { padding: 2rem 1.5rem; }
        .score-content { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

        /* Meters */
        .score-meters { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .meter-block { display: flex; flex-direction: column; gap: 0.5rem; }
        .meter-label { font-family: 'DM Mono', monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .meter-bar-wrap { height: 10px; background: var(--cream); border-radius: 99px; overflow: hidden; border: 1px solid var(--border); }
        .meter-bar { height: 100%; border-radius: 99px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        .meter-bar.human { background: linear-gradient(to right, #2d7a4f, #4a9e6b); }
        .meter-bar.ai { background: linear-gradient(to right, #c9a84c, #b84a2e); }
        .meter-value { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; line-height: 1; }

        /* Badges */
        .score-badges { display: flex; gap: 1rem; flex-wrap: wrap; }
        .badge-item { display: flex; flex-direction: column; gap: 0.3rem; }
        .badge-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .badge-value { padding: 0.3rem 0.8rem; border-radius: 99px; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; display: inline-block; }

        /* Summary & Flags */
        .score-summary { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: var(--ink); line-height: 1.6; font-style: italic; padding: 0.75rem 1rem; background: var(--cream); border-radius: 6px; border-left: 3px solid var(--gold); }
        .score-flags { display: flex; flex-direction: column; gap: 0.5rem; }
        .flags-label { font-family: 'DM Mono', monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .flags-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .flag-tag { padding: 0.25rem 0.65rem; background: #fdf5f3; border: 1px solid #f0d0c8; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--rust); }
        .score-flags.clean .flags-label { color: #2d7a4f; font-size: 0.78rem; }

        /* Footer */
        .footer-note { margin-top: 1.25rem; text-align: center; font-family: 'DM Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: #c0b8a8; }

        /* Responsive */
        @media (max-width: 700px) {
          .editor-grid { grid-template-columns: 1fr; }
          .divider-col { flex-direction: row; width: 100%; height: 70px; border-left: none; border-right: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 0 1rem; }
          .divider-line { flex: 1; width: auto; height: 1px; }
          .rewrite-btn { flex-direction: row; width: auto; padding: 0.6rem 1.5rem; margin: 0 0.75rem; }
          .score-meters { grid-template-columns: 1fr; }
          .header-inner { flex-direction: column; gap: 0.3rem; }
        }
      `}</style>
    </div>
  );
}
