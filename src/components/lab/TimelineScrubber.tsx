import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { fetchConstitutionHistory, fetchHistoryAt } from "@/lib/lab/api";
import type { HistorySnapshot } from "@/lib/lab/api";
import type { Constitution } from "@/lib/lab/types";
import { useLabData } from "@/context/LabDataContext";

const RANGE_HOURS = 48;

function timeToPercent(iso: string, rangeStartMs: number, rangeMs: number): number {
  const t = new Date(iso).getTime();
  return Math.min(100, Math.max(0, ((t - rangeStartMs) / rangeMs) * 100));
}

export default function TimelineScrubber() {
  const { pendingAmendment } = useLabData();
  const [percent, setPercent] = useState(100);
  const [snapshot, setSnapshot] = useState<HistorySnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [constitutionHistory, setConstitutionHistory] = useState<Constitution[]>([]);

  useEffect(() => {
    fetchConstitutionHistory()
      .then(setConstitutionHistory)
      .catch(() => setConstitutionHistory([]));
  }, [pendingAmendment?.id]);

  const now = Date.now();
  const rangeStartMs = now - RANGE_HOURS * 60 * 60 * 1000;
  const rangeMs = RANGE_HOURS * 60 * 60 * 1000;

  const handleChange = async ([value]: number[]) => {
    setPercent(value);
    const targetTime = now - ((100 - value) / 100) * rangeMs;
    setLoading(true);
    try {
      const result = await fetchHistoryAt(new Date(targetTime).toISOString());
      setSnapshot(result);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Discrete tick marks: one per constitution version change (amendment
  // ratification), positioned along the -48h..now range.
  const ticks = constitutionHistory
    .filter((c) => {
      const t = new Date(c.effective_from).getTime();
      return t >= rangeStartMs && t <= now;
    })
    .map((c) => ({
      version: c.version,
      percent: timeToPercent(c.effective_from, rangeStartMs, rangeMs),
      source: c.source,
    }));

  return (
    <div className="glass-panel flex w-full flex-col gap-3 rounded-xl p-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <History size={14} className="text-primary" />
          Time-Travel Debugger
        </div>
        <span className="text-muted-foreground">
          {loading
            ? "Reconstructing..."
            : snapshot?.constitution
              ? `Constitution v${snapshot.constitution.version} active — max_amount $${snapshot.constitution.rules.max_amount}, blocklist v${snapshot.blocklistVersion}`
              : "Scrub to reconstruct historical state"}
        </span>
      </div>
      <Slider value={[percent]} onValueChange={handleChange} min={0} max={100} step={1} />
      <div className="relative h-4">
        {ticks.map((tick) => (
          <div
            key={tick.version}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${tick.percent}%` }}
            title={`Constitution v${tick.version} (${tick.source}) ratified here`}
          >
            <div className="h-2 w-0.5 bg-primary" />
            <span className="mt-0.5 text-[0.55rem] text-primary">v{tick.version}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[0.65rem] text-muted-foreground">
        <span>-{RANGE_HOURS}h</span>
        <span>now</span>
      </div>
      {snapshot?.decision && (
        <div className="rounded-lg border border-border/50 bg-background/30 p-2.5 text-[0.7rem] text-muted-foreground">
          <span className="font-semibold text-foreground">Reconstructed decision state:</span>{" "}
          {snapshot.decision.title} — status {snapshot.decision.status}, LLM:{" "}
          {snapshot.decision.llm_verdict ?? "n/a"}, symbolic: {snapshot.decision.symbolic_verdict ?? "n/a"}
          {snapshot.decision.bargaining_rounds > 0 &&
            ` — negotiated over ${snapshot.decision.bargaining_rounds} rounds`}
        </div>
      )}
    </div>
  );
}
