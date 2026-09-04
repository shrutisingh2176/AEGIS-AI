import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import useAlerts from "../hooks/useAlerts";

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

const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

export default function Network() {
  const [showAllFlows, setShowAllFlows] = useState(false);
  const { alerts, status } = useAlerts();
  const attacks = alerts.filter((alert) => alert.is_attack).length;
  const confidence = alerts
    .slice(0, 7)
    .reverse()
    .map((alert) => Math.round((alert.confidence || 0) * 100));

  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="NIDS v4-Core / Zone: Sector-04 Alpha"
        title="Network Intelligence"
        description="Behavior-based network intrusion monitoring and zero-day protocol deviation analysis."
      >
        <Btn>Threshold Rules</Btn>
        <Btn variant="primary">Autonomous Enforcement Active</Btn>
      </PageHeader>

      {/* Stats grid — 6 columns */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <StatCard label="Live throughput" value="4.82" detail="Gbps / peak 5.1" icon="⌁" />
        <StatCard label="Total active flows" value={alerts.length || "892,410"} detail="100% ingest rate" icon="↔" />
        <StatCard label="Suspicious flows" value={attacks || 148} detail="Autoencoders alert" tone="critical" icon="!" />
        <StatCard label="Attack confidence" value="82%" detail="Peak / threshold exceeded" tone="critical" icon="↗" />
        <StatCard label="Top attacked ports" value="4444" detail="Targeting Windows core" icon="#" />
        <StatCard label="Protocol distribution" value="TCP 68%" detail="UDP 22% / ICMP 7%" icon="◒" />
      </div>

      {/* Chart */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Dual-Axis Protocol Telemetry</h2>
            <p className="text-[13px] text-[#8896a1] m-0">Throughput and confidence over the live network window.</p>
          </div>
          <StatusBadge>Streaming telemetry</StatusBadge>
        </div>
        <ConfidenceChart
          values={confidence.length > 1 ? confidence : [24, 28, 25, 35, 53, 82, 48]}
          label="Attack confidence"
        />
      </Panel>

      {/* Table */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Deep Packet Flow Telemetry</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Real-time connection metadata, behavioral scores, and autonomous triage states.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Btn onClick={() => setShowAllFlows((c) => !c)}>
              {showAllFlows ? "Show Recent" : `Show All Flows (${alerts.length || 8})`}
            </Btn>
            <Btn>Export PCAP</Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr>
                {["Time", "Source IP", "Destination IP", "Port", "Protocol", "Confidence", "Verdict", "Action"].map(h => (
                  <th key={h} className="text-left py-3 px-2.5 border-b-2 border-[#e8eef2] font-sans text-[9px] font-semibold tracking-[0.06em] uppercase text-[#8896a1] bg-[#fafcfd]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.length ? (
                (showAllFlows ? alerts : alerts.slice(0, 8)).map((alert, index) => (
                  <tr key={`${alert.time}-${index}`} className="transition-colors duration-200 hover:bg-[#f8fcfb]">
                    <td className="py-3.5 px-2.5 text-xs font-sans border-b border-[#e8eef2]">
                      {new Date(alert.time).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-2.5 text-xs font-sans border-b border-[#e8eef2]">{alert.src_ip}</td>
                    <td className="py-3.5 px-2.5 text-xs font-sans border-b border-[#e8eef2]">{alert.dst_ip}</td>
                    <td className="py-3.5 px-2.5 text-xs font-sans border-b border-[#e8eef2]">{alert.dst_port}</td>
                    <td className="py-3.5 px-2.5 text-xs border-b border-[#e8eef2]">TCP</td>
                    <td className="py-3.5 px-2.5 text-xs border-b border-[#e8eef2]">{Math.round((alert.confidence || 0) * 100)}%</td>
                    <td className="py-3.5 px-2.5 border-b border-[#e8eef2]">
                      <StatusBadge tone={alert.is_attack ? "critical" : "safe"}>
                        {alert.is_attack ? "Blocked" : "Allowed"}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-2.5 border-b border-[#e8eef2]">
                      <Btn>Inspect</Btn>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-[#8896a1] text-[13px] border-b border-[#e8eef2]">
                    {status === "disconnected"
                      ? "API disconnected - start the Flask service to stream flows."
                      : "Waiting for traffic data..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
