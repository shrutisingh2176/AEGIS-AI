import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import ThreatDistribution from "../components/charts/ThreatDistribution";
import { demoOverview } from "../data/demoData";
import useAlerts from "../hooks/useAlerts";

/* Shared panel wrapper */
const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

/* Shared button */
const Btn = ({ children, variant = 'secondary', onClick, to, className = "" }) => {
  const base = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans cursor-pointer no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.1)]";
  
  const variants = {
    primary: "bg-teal border-2 border-teal-dark text-white",
    danger: "bg-red border-2 border-[#c53030] text-white",
    secondary: "bg-white border-[1.5px] border-[#d6e0e4] text-ink hover:border-teal hover:text-teal-dark",
  };
  
  const merged = `${base} ${variants[variant]} ${className}`;
  
  if (to) return <Link to={to} className={merged}>{children}</Link>;
  return <button className={merged} onClick={onClick}>{children}</button>;
};

export default function Overview() {
  const { alerts, status } = useAlerts();
  const attackCount = alerts.filter((alert) => alert.is_attack).length;
  
  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="Autonomous detection engine / Cluster US-East-02"
        title="Security Posture"
        description="Real-time behavioral anomaly and probabilistic risk telemetry across synthetic and physical topologies."
      >
        <Btn>Export Triage Report</Btn>
        <Btn variant="primary">Quarantine Mode</Btn>
      </PageHeader>

      {/* Risk + KPIs */}
      <section className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-[18px]">
        {/* Risk card */}
        <article className="bg-white border border-[#e8eef2] border-l-4 border-l-red rounded-2xl p-[28px_26px] flex flex-col gap-3.5 transition-all duration-350 hover:shadow-[0_16px_40px_rgba(217,79,92,.1)]">
          <div className="flex justify-between items-center">
            <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-muted">
              Aggregate anomaly rating
            </span>
            <StatusBadge tone="critical">High risk</StatusBadge>
          </div>
          <strong className="font-sans text-[52px] font-black text-red">
            {demoOverview.riskScore}
            <small className="text-base font-medium text-[#8896a1] font-sans"> / 100</small>
          </strong>
          <h3 className="text-[15px] font-bold text-ink m-0">
            Critical deviation detected on monitored infrastructure
          </h3>
          <p className="text-[13px] text-muted leading-relaxed m-0">
            Three weak asynchronous signals correlated into one high-probability
            lateral movement chain in the App Tier.
          </p>
          {/* Risk bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-[#eef2f7] mt-auto">
            <i className="w-[32%] bg-teal block" />
            <i className="w-[18%] bg-[#607d8b] block" />
            <i className="w-[28%] bg-red block" />
          </div>
          <span className="font-sans text-[10px] text-[#8896a1] tracking-[0.04em]">
            System heuristics{" "}
            <b className="text-teal cursor-pointer">Investigate vector →</b>
          </span>
        </article>

        {/* KPI grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <StatCard
            label="Flows analyzed"
            value={demoOverview.flowsAnalyzed.toLocaleString()}
            detail="+12.4% vs normal volume"
            icon="↗"
          />
          <StatCard
            label="Network attacks"
            value={attackCount || 42}
            detail="Blocked and flagged automatically"
            tone="critical"
            icon="!"
          />
          <StatCard
            label="System compromises"
            value={demoOverview.systemCompromises}
            detail="Active SOC investigation"
            tone="warning"
            icon="~"
          />
          <StatCard
            label="Normal baseline events"
            value={demoOverview.normalEvents}
            detail="Healthy operational tolerance"
            tone="safe"
            icon="✓"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[18px]">
        <Panel>
          <div className="flex justify-between items-start mb-5 gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Attack Confidence - Live Trend</h2>
              <p className="text-[13px] text-[#8896a1] m-0">
                Statistical deviation scoring based on sliding MITRE ATT&CK heuristics.
              </p>
            </div>
            <StatusBadge>Streaming telemetry</StatusBadge>
          </div>
          <ConfidenceChart values={demoOverview.confidence} />
        </Panel>
        <Panel>
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Threat Distribution</h2>
            <p className="text-[13px] text-[#8896a1] m-0">Classified behavioral occurrences in current cycle.</p>
          </div>
          <ThreatDistribution values={demoOverview.threatDistribution} />
        </Panel>
      </section>

      {/* Activity table */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Active High-Risk Systems & Quick Triage Queue</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Prioritized endpoint telemetry flagged by correlation algorithms.
            </p>
          </div>
          <Btn to="/network">Inspect network</Btn>
        </div>
        <div>
          {[
            ["Server-04", "Linux App Server", "78 / 100", "Hidden reverse shell + outbound spike", "Investigating"],
            ["FW-Edge-01", "Edge Firewall", "64 / 100", "Unusual SYN flood bypass attempt", "Mitigated"],
            ["Workstation-089", "Windows 11 Client", "42 / 100", "Off-hours Kerberos ticket request", "Monitoring"],
          ].map(([host, type, score, event, state]) => (
            <div key={host} className="grid grid-cols-[1.1fr_.8fr_2fr_1fr_auto] gap-[15px] items-center py-4 border-t border-[#e8eef2] text-[13px] md:grid-cols-1 md:gap-2 md:py-3">
              <strong className="text-ink">
                {host}
                <small className="block text-[#8896a1] font-normal mt-[3px] text-[11px]">{type}</small>
              </strong>
              <span className="font-sans text-xs text-ink md:hidden">{score}</span>
              <span className="text-muted">{event}</span>
              <StatusBadge tone={state === "Investigating" ? "ai" : "safe"}>
                {state}
              </StatusBadge>
              <Btn className="md:w-max">Review</Btn>
            </div>
          ))}
        </div>
      </Panel>

      {/* Connection note */}
      <div className="text-center py-2">
        <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
          {status === "connected"
            ? "Live API data connected"
            : "Demo metrics - API unavailable"}
        </StatusBadge>
      </div>
    </div>
  );
}
