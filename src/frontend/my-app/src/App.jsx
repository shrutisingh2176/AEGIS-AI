import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';
const MAX_POINTS = 40;

function Sparkline({ points, colorVar }) {
  if (points.length < 2) {
    return <div className="chart-empty">Waiting for data…</div>;
  }
  const w = 440;
  const h = 130;
  const pad = 8;
  const step = (w - pad * 2) / (MAX_POINTS - 1);
  const startIdx = MAX_POINTS - points.length;

  const coords = points.map((p, i) => {
    const x = pad + (startIdx + i) * step;
    const y = pad + (1 - p.value) * (h - pad * 2);
    return [x, y];
  });

  const linePath = coords.map((c, i) => (i === 0 ? `M ${c[0]},${c[1]}` : `L ${c[0]},${c[1]}`)).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1][0]},${h - pad} L ${coords[0][0]},${h - pad} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline-small" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fill-${colorVar}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`var(${colorVar})`} stopOpacity="0.35" />
          <stop offset="100%" stopColor={`var(${colorVar})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#fill-${colorVar})`} />
      <path d={linePath} style={{ fill: 'none', stroke: `var(${colorVar})`, strokeWidth: 2 }} />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]}
        r="4" style={{ fill: `var(${colorVar})`, stroke: 'var(--bg)', strokeWidth: 2 }} />
    </svg>
  );
}

function App() {
  const [alerts, setAlerts] = useState([]);
  const [sysAlerts, setSysAlerts] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [pulse, setPulse] = useState(false);
  const lastCount = useRef(0);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/alerts`)
        .then(res => res.json())
        .then(data => {
          if (data.length !== lastCount.current) {
            setPulse(true);
            setTimeout(() => setPulse(false), 400);
            lastCount.current = data.length;
          }
          setAlerts(data);
          setStatus('connected');
        })
        .catch(() => setStatus('disconnected'));

      fetch(`${API_URL}/system-behavior-alerts`)
        .then(res => res.json())
        .then(data => setSysAlerts(Array.isArray(data) ? data : []))
        .catch(() => {});
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const attackCount = alerts.filter(a => a.is_attack).length;
  const normalCount = alerts.length - attackCount;
  const attackRate = alerts.length ? ((attackCount / alerts.length) * 100).toFixed(0) : 0;
  const networkChrono = [...alerts].reverse().slice(-MAX_POINTS).map(a => ({ value: a.confidence, is_attack: a.is_attack }));

  const sysAnomalyCount = sysAlerts.filter(s => s.is_anomaly).length;
  const sysNormalCount = sysAlerts.length - sysAnomalyCount;
  const latestSys = sysAlerts[0];
  // normalize anomaly_score roughly into 0-1 for the sparkline (scores are typically -0.3 to 0.3)
  const sysChrono = [...sysAlerts].reverse().slice(-MAX_POINTS).map(s => ({
    value: Math.min(1, Math.max(0, (s.anomaly_score + 0.3) / 0.6)),
    is_anomaly: s.is_anomaly
  }));

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className={`live-dot ${status === 'connected' ? 'live' : 'dead'} ${pulse ? 'pulse' : ''}`} />
          <div>
            <h1>NIDS <span className="brand-sub">// Dual-Layer Compromise Detection</span></h1>
            <p className="brand-tag">Layer 1: network flow ML  ·  Layer 2: system behavior ML</p>
          </div>
        </div>
        <div className={`status-pill ${status}`}>
          {status === 'connected' ? 'LIVE — API CONNECTED' : 'API DISCONNECTED'}
        </div>
      </header>

      <section className="dual-grid">
        {/* ---------- LAYER 1: NETWORK ---------- */}
        <div className="layer-panel">
          <div className="layer-head">
            <span className="layer-tag tag-network">LAYER 1</span>
            <h2>Network Traffic</h2>
            <span className="panel-hint">LightGBM classifier</span>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <span className="mini-value">{alerts.length}</span>
              <span className="mini-label">Flows</span>
            </div>
            <div className="mini-stat danger">
              <span className="mini-value">{attackCount}</span>
              <span className="mini-label">Attacks ({attackRate}%)</span>
            </div>
            <div className="mini-stat safe">
              <span className="mini-value">{normalCount}</span>
              <span className="mini-label">Normal</span>
            </div>
          </div>

          <Sparkline points={networkChrono} colorVar="--accent-alert" />

          <div className="mini-log">
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className={`mini-row ${a.is_attack ? 'row-alert' : 'row-safe'}`}>
                <span className="mono muted">{new Date(a.time).toLocaleTimeString()}</span>
                <span className="mono">{a.src_ip}</span>
                <span className={`badge ${a.is_attack ? 'badge-alert' : 'badge-safe'}`}>
                  {a.is_attack ? 'ATTACK' : 'NORMAL'}
                </span>
              </div>
            ))}
            {alerts.length === 0 && <div className="log-empty">No flows yet</div>}
          </div>
        </div>

        {/* ---------- LAYER 2: SYSTEM ---------- */}
        <div className="layer-panel">
          <div className="layer-head">
            <span className="layer-tag tag-system">LAYER 2</span>
            <h2>System Behavior</h2>
            <span className="panel-hint">Isolation Forest · unsupervised</span>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <span className="mini-value">{latestSys ? `${latestSys.cpu_percent}%` : '—'}</span>
              <span className="mini-label">CPU now</span>
            </div>
            <div className="mini-stat danger">
              <span className="mini-value">{sysAnomalyCount}</span>
              <span className="mini-label">Anomalies</span>
            </div>
            <div className="mini-stat safe">
              <span className="mini-value">{sysNormalCount}</span>
              <span className="mini-label">Normal</span>
            </div>
          </div>

          <Sparkline points={sysChrono} colorVar="--accent-warn" />

          <div className="mini-log">
            {sysAlerts.slice(0, 5).map((s, i) => (
              <div key={i} className={`mini-row ${s.is_anomaly ? 'row-alert' : 'row-safe'}`}>
                <span className="mono muted">{new Date(s.time).toLocaleTimeString()}</span>
                <span className="mono">CPU {s.cpu_percent}% · Proc {s.process_count}</span>
                <span className={`badge ${s.is_anomaly ? 'badge-alert' : 'badge-safe'}`}>
                  {s.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                </span>
              </div>
            ))}
            {sysAlerts.length === 0 && <div className="log-empty">Collecting baseline…</div>}
          </div>
        </div>
      </section>

      <section className="log-panel">
        <div className="panel-head">
          <h2>Full Network Flow Log</h2>
          <span className="panel-hint">most recent first</span>
        </div>
        <div className="log-table">
          <div className="log-row log-head">
            <span>Time</span>
            <span>Source</span>
            <span>Destination</span>
            <span>Port</span>
            <span>Confidence</span>
            <span>Verdict</span>
          </div>
          {alerts.length === 0 && <div className="log-empty">No flows yet — start the traffic simulator.</div>}
          {alerts.map((a, i) => (
            <div key={i} className={`log-row ${a.is_attack ? 'row-alert' : 'row-safe'}`}>
              <span className="mono muted">{new Date(a.time).toLocaleTimeString()}</span>
              <span className="mono">{a.src_ip}</span>
              <span className="mono">{a.dst_ip}</span>
              <span className="mono muted">{a.dst_port}</span>
              <span className="mono">{(a.confidence * 100).toFixed(1)}%</span>
              <span className={`badge ${a.is_attack ? 'badge-alert' : 'badge-safe'}`}>
                {a.is_attack ? 'ATTACK' : 'NORMAL'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
