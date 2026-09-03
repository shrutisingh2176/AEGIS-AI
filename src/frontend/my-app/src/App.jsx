import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';
const MAX_POINTS = 40;

function Sparkline({ points }) {
  if (points.length < 2) {
    return <div className="chart-empty">Waiting for traffic data…</div>;
  }
  const w = 900;
  const h = 160;
  const pad = 8;
  const step = (w - pad * 2) / (MAX_POINTS - 1);
  const startIdx = MAX_POINTS - points.length;

  const coords = points.map((p, i) => {
    const x = pad + (startIdx + i) * step;
    const y = pad + (1 - p.confidence) * (h - pad * 2);
    return [x, y];
  });

  const linePath = coords.map((c, i) => (i === 0 ? `M ${c[0]},${c[1]}` : `L ${c[0]},${c[1]}`)).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1][0]},${h - pad} L ${coords[0][0]},${h - pad} Z`;
  const thresholdY = pad + (1 - 0.5) * (h - pad * 2);
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-alert)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent-alert)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={pad} y1={thresholdY} x2={w - pad} y2={thresholdY} className="threshold-line" />
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} className="spark-line" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]}
        r="4" className={last.is_attack ? 'spark-dot dot-alert' : 'spark-dot dot-safe'} />
    </svg>
  );
}

function App() {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [pulse, setPulse] = useState(false);
  const lastCount = useRef(0);

  useEffect(() => {
    const fetchAlerts = () => {
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
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const attackCount = alerts.filter(a => a.is_attack).length;
  const normalCount = alerts.length - attackCount;
  const attackRate = alerts.length ? ((attackCount / alerts.length) * 100).toFixed(0) : 0;
  const chronological = [...alerts].reverse().slice(-MAX_POINTS);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className={`live-dot ${status === 'connected' ? 'live' : 'dead'} ${pulse ? 'pulse' : ''}`} />
          <div>
            <h1>NIDS <span className="brand-sub">// Network Intrusion Detection</span></h1>
            <p className="brand-tag">Layer&nbsp;1 behavioral flow analysis — LightGBM classifier</p>
          </div>
        </div>
        <div className={`status-pill ${status}`}>
          {status === 'connected' ? 'LIVE — API CONNECTED' : 'API DISCONNECTED'}
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-label">Flows Observed</span>
          <span className="stat-value">{alerts.length}</span>
          <span className="stat-foot">last {MAX_POINTS < alerts.length ? 100 : alerts.length} in buffer</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Flagged Attacks</span>
          <span className="stat-value">{attackCount}</span>
          <span className="stat-foot">{attackRate}% of traffic</span>
        </div>
        <div className="stat-card safe">
          <span className="stat-label">Normal Flows</span>
          <span className="stat-value">{normalCount}</span>
          <span className="stat-foot">baseline behavior</span>
        </div>
      </section>

      <section className="chart-panel">
        <div className="panel-head">
          <h2>Attack Confidence — Live Trend</h2>
          <span className="panel-hint">threshold at 50%</span>
        </div>
        <Sparkline points={chronological} />
      </section>

      <section className="log-panel">
        <div className="panel-head">
          <h2>Flow Log</h2>
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
          {alerts.length === 0 && (
            <div className="log-empty">No flows yet — start the traffic simulator.</div>
          )}
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
