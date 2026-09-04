import React from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Gauge from "../components/charts/Gauge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import useSystemStatus from "../hooks/useSystemStatus";

/* Shared button */
const Btn = ({ children, variant = 'secondary', onClick, className = "" }) => {
  const base = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans cursor-pointer no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.1)]";
  const variants = {
    primary: "bg-teal border-2 border-teal-dark text-white",
    danger: "bg-red border-2 border-[#c53030] text-white",
    secondary: "bg-white border-[1.5px] border-[#d6e0e4] text-ink hover:border-teal hover:text-teal-dark",
  };
  const merged = `${base} ${variants[variant]} ${className}`;
  return <button className={merged} onClick={onClick}>{children}</button>;
};

const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

export default function SystemHealth() {
  const { data, status, updatedAt } = useSystemStatus();
  const cpu = Number(data?.cpu_usage ?? 0);
  const memory = Number(data?.memory_usage ?? 0);
  const disk = Number(data?.disk_usage ?? 0);
  const lastSync = updatedAt
    ? `${Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 1000))}s ago`
    : "Waiting";

  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="Endpoint behavioral monitoring // Realtime ingestion"
        title="System Behavioral Health"
        description="Continuous deep-kernel anomaly modeling and heuristic execution profiling across production clusters."
      >
        <div className="flex gap-3.5 items-center bg-white border border-[#e8eef2] px-3.5 py-2.5 rounded-lg font-sans text-[11px] text-[#8896a1]">
          <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
            {status === "connected" ? "Agent Online" : "Agent Offline"}
          </StatusBadge>
          <span>Sync: {lastSync}</span>
          <span>Host: {data?.hostname || "Awaiting telemetry"}</span>
        </div>
      </PageHeader>

      {/* Risk banner */}
      <div className="flex flex-wrap justify-between items-center gap-5 bg-white border border-[#e8eef2] border-l-4 border-l-red rounded-2xl p-[28px_26px] transition-all duration-350 hover:shadow-[0_16px_40px_rgba(217,79,92,.08)]">
        <div>
          <StatusBadge tone="critical">Critical anomaly</StatusBadge>
          <h2 className="text-[22px] font-extrabold text-ink my-2.5">
            Behavior Risk Score:{" "}
            <b className="text-red font-sans">
              {data ? Math.round((cpu + memory) / 2) : 78}
            </b>{" "}
            <small className="text-[#8896a1] text-[13px] font-normal">/ 100</small>
          </h2>
          <p className="m-0 text-muted text-[13px]">
            {data
              ? `Live host telemetry from ${data.hostname || "monitored endpoint"}.`
              : "Backend disconnected. Connect the system monitor to replace demo risk context with live host telemetry."}
          </p>
        </div>
        <Btn variant="danger">Isolate Host</Btn>
      </div>

      {/* Gauges — 4 columns */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <Gauge label="CPU utilization" value={cpu} tone="critical" detail="Live process utilization from the monitoring agent." />
        <Gauge label="Committed RAM" value={memory} tone="warning" detail="Memory pressure reported by the system monitor." />
        <Gauge label="Disk throughput" value={disk} tone="teal" detail="Storage utilization and sequential write health." />
        <Gauge label="Network connections" value={Number(data?.network_connections ?? 0)} tone="teal" detail={`${data?.process_count ?? 0} active processes reported.`} />
      </div>

      {/* Baseline chart */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Normal Baseline vs Current Behavior</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Autoencoder anomaly reconstruction loss against real-time telemetry signals.
            </p>
          </div>
          <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
            {status === "connected" ? "Observed real-time" : "No data available"}
          </StatusBadge>
        </div>
        <ConfidenceChart
          values={[18, 18, 19, 20, 21, Math.max(22, cpu), Math.max(25, memory)]}
          label="Observed deviation"
        />
      </Panel>

      {/* Processes */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Suspicious Processes & In-Memory Execution</h2>
            <p className="text-[13px] text-[#8896a1] m-0">Processes ordered by behavioral risk calculation.</p>
          </div>
          <Btn>Refresh Vector</Btn>
        </div>
        {[
          ["/tmp/.sh_exec", "Hidden reverse shell payload", "PID 4812", "94 / 100", "critical", "Kill and Isolate", "danger"],
          ['powershell.exe /c "Invoke-TokenDump"', "LSASS memory exposure", "PID 5120", "91 / 100", "critical", "Terminate", "danger"],
          ["cron_maintenance.sh", "Scheduled log archive pipeline", "PID 2045", "06 / 100", "safe", "Allowlisted", "secondary"],
        ].map(([name, desc, pid, score, tone, action, btnVariant]) => (
          <div key={name} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-[15px] items-center py-4 border-t border-[#e8eef2] text-[13px] md:grid-cols-1 md:gap-2 md:py-3">
            <strong className="text-ink">
              {name}
              <small className="block text-[#8896a1] font-normal mt-[3px] text-[11px]">{desc}</small>
            </strong>
            <span className="font-sans text-xs text-muted md:hidden">{pid}</span>
            <div className="md:w-max"><StatusBadge tone={tone}>{score}</StatusBadge></div>
            <Btn variant={btnVariant} className="md:w-max">{action}</Btn>
          </div>
        ))}
      </Panel>
    </div>
  );
}
