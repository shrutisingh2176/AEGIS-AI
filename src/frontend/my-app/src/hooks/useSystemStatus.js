import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function useSystemStatus(intervalMs = 5000) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await api.getLatestSystemStatus();
        if (!active) return;
        setData(response?.data || null);
        setStatus("connected");
        setUpdatedAt(new Date());
      } catch {
        if (active) setStatus("disconnected");
      }
    };
    load();
    const timer = window.setInterval(load, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { data, status, updatedAt };
}
