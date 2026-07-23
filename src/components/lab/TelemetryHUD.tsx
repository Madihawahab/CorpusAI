import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const AGENTS = ["Orchestrator", "Marketing", "Finance", "Engineering"] as const;

interface TelemetryReading {
  agent: string;
  latencyMs: number;
  tokens: number;
  memoryMb: number;
}

// Section 7 — per-agent telemetry HUD. Self-contained mock readings that
// gently animate, kept visually separate from the Immune System overlays
// so the two never collide.
export default function TelemetryHUD() {
  const [readings, setReadings] = useState<TelemetryReading[]>(
    AGENTS.map((agent) => ({ agent, latencyMs: 120, tokens: 340, memoryMb: 64 })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) =>
        prev.map((r) => ({
          ...r,
          latencyMs: Math.max(40, r.latencyMs + (Math.random() - 0.5) * 60),
          tokens: Math.max(50, r.tokens + (Math.random() - 0.5) * 120),
          memoryMb: Math.max(20, r.memoryMb + (Math.random() - 0.5) * 12),
        })),
      );
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Activity size={14} />
        Agent Telemetry
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {readings.map((r) => (
          <div key={r.agent} className="rounded-lg border border-border/50 bg-background/30 p-2.5">
            <p className="mb-1.5 truncate text-[0.65rem] font-semibold text-foreground">{r.agent}</p>
            <div className="flex flex-col gap-1">
              <MiniBar label="latency" value={r.latencyMs} max={300} unit="ms" />
              <MiniBar label="tokens" value={r.tokens} max={800} unit="" />
              <MiniBar label="mem" value={r.memoryMb} max={128} unit="mb" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-10 shrink-0 text-[0.55rem] uppercase text-muted-foreground">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-glow-cyan transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-[0.55rem] text-muted-foreground">
        {Math.round(value)}
        {unit}
      </span>
    </div>
  );
}
