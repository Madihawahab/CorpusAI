import { useState } from "react";
import { Loader2, PlayCircle, Radio, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  runBargainingSession,
  runAmendmentWatch,
  runBoardroomSession,
  runRedTeamAttempt,
  verifyDecision,
} from "@/lib/lab/api";
import { useLabData } from "@/context/LabDataContext";
import { cn } from "@/lib/utils";

const BOARDROOM_THRESHOLD = 30000;

type PipelineStepStatus = "idle" | "running" | "done" | "skipped" | "error";

interface PipelineStep {
  key: string;
  label: string;
  status: PipelineStepStatus;
  detail?: string;
}

const INITIAL_STEPS: PipelineStep[] = [
  { key: "bargain", label: "Nash Bargaining Kernel", status: "idle" },
  { key: "verify", label: "Symbolic Verifier", status: "idle" },
  { key: "amend-watch", label: "Amendment Watcher", status: "idle" },
  { key: "boardroom", label: "Boardroom Escalation", status: "idle" },
];

// Section 2/3/5 — wires the REAL, LLM-backed Edge Functions into a single
// live pipeline trigger, distinct from the fully-mocked Section 8 demo
// buttons. This is what actually exercises lab-bargain, lab-verify,
// lab-amend-watch, and lab-boardroom end-to-end from the website.
export function LiveNegotiationPipeline() {
  const { refresh } = useLabData();
  const [requestedAmount, setRequestedAmount] = useState(9500);
  const [idealAmount, setIdealAmount] = useState(9500);
  const [policyCap, setPolicyCap] = useState(6000);
  const [initiativeLabel, setInitiativeLabel] = useState("Live Q4 Campaign Budget");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);

  const updateStep = (key: string, patch: Partial<PipelineStep>) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const runPipeline = async () => {
    setRunning(true);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "idle", detail: undefined })));

    try {
      // 1. Nash Bargaining Kernel — real LLM dialogue + solver-clamped numbers
      updateStep("bargain", { status: "running" });
      const bargainResult = await runBargainingSession({
        requestedAmount,
        idealAmount,
        policyCap,
        initiativeLabel,
      });
      updateStep("bargain", {
        status: "done",
        detail: `Converged to $${bargainResult.decision.amount} at ${bargainResult.decision.bargaining_efficiency_pct}% efficiency`,
      });

      // 2. Symbolic Verifier — independent deterministic check + LLM verdict
      updateStep("verify", { status: "running" });
      const verifyResult = await verifyDecision({ decisionId: bargainResult.decision.id });
      updateStep("verify", {
        status: "done",
        detail: verifyResult.decision.verdict_agreement
          ? `LLM and policy engine agree: ${verifyResult.decision.symbolic_verdict}`
          : `Override: policy engine forced ${verifyResult.decision.symbolic_verdict}`,
      });

      // 3. Amendment Watcher — checks for repeated near-miss disputes
      updateStep("amend-watch", { status: "running" });
      const watchResult = await runAmendmentWatch();
      updateStep("amend-watch", {
        status: watchResult.triggered ? "done" : "skipped",
        detail: watchResult.triggered
          ? "Pending amendment drafted — see Policy Sandbox"
          : "No repeated near-cap pattern yet",
      });

      // 4. Boardroom Escalation — only for ultra-high-risk requests
      if (verifyResult.decision.amount > BOARDROOM_THRESHOLD) {
        updateStep("boardroom", { status: "running" });
        await runBoardroomSession({
          amount: verifyResult.decision.amount,
          reason: "amount_over_30000",
        });
        updateStep("boardroom", { status: "done", detail: "Board convened — see Boardroom Debate" });
      } else {
        updateStep("boardroom", { status: "skipped", detail: "Below $30,000 threshold" });
      }

      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Pipeline failed";
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error", detail: message } : s)),
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Radio size={16} className="text-primary" />
        Live Pipeline (real LLM calls)
      </div>
      <p className="text-xs text-muted-foreground">
        Runs the actual Nash Bargaining Kernel, Symbolic Verifier, Amendment Watcher, and
        Boardroom Debate against your Supabase Edge Functions — requires{" "}
        <code className="rounded bg-background/60 px-1 py-0.5">LLM_API_KEY</code> to be set.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Requested / Ideal Amount</Label>
          <Input
            type="number"
            value={idealAmount}
            onChange={(e) => {
              const v = Number(e.target.value);
              setIdealAmount(v);
              setRequestedAmount(v);
            }}
            className="mt-1 h-9 bg-background/60 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Policy Cap</Label>
          <Input
            type="number"
            value={policyCap}
            onChange={(e) => setPolicyCap(Number(e.target.value))}
            className="mt-1 h-9 bg-background/60 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Initiative Label</Label>
          <Input
            value={initiativeLabel}
            onChange={(e) => setInitiativeLabel(e.target.value)}
            className="mt-1 h-9 bg-background/60 text-xs"
          />
        </div>
      </div>

      <Button variant="glow" size="sm" disabled={running} onClick={runPipeline} className="gap-2">
        {running ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
        {running ? "Running pipeline..." : "Run Live Pipeline"}
      </Button>

      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <div
            key={step.key}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-xs",
              step.status === "running" && "border-primary/50",
              step.status === "error" && "border-destructive/50",
            )}
          >
            <span className="font-medium">{step.label}</span>
            <div className="flex items-center gap-2">
              {step.detail && <span className="text-muted-foreground">{step.detail}</span>}
              <StepBadge status={step.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepBadge({ status }: { status: PipelineStepStatus }) {
  if (status === "idle") return <Badge variant="secondary">Idle</Badge>;
  if (status === "running")
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 size={10} className="animate-spin" /> Running
      </Badge>
    );
  if (status === "done") return <Badge variant="success">Done</Badge>;
  if (status === "skipped") return <Badge variant="secondary">Skipped</Badge>;
  return <Badge variant="destructive">Error</Badge>;
}

// Section 4 — wires the REAL lab-redteam Edge Function (LLM-generated novel
// attack + live classifier), distinct from the mocked Section 8 sequence.
export function LiveRedTeamTrigger() {
  const { refresh } = useLabData();
  const [running, setRunning] = useState(false);
  const [priorAttempts, setPriorAttempts] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ outcome: string; payload: string } | null>(null);

  const fire = async () => {
    setRunning(true);
    try {
      const result = await runRedTeamAttempt({ priorAttempts });
      setPriorAttempts((prev) => [...prev, result.attempt.payload]);
      setLastResult({ outcome: result.attempt.outcome, payload: result.attempt.payload });
      await refresh();
    } catch (err) {
      setLastResult({
        outcome: "error",
        payload: err instanceof Error ? err.message : "Red-team run failed",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
        <ShieldAlert size={14} />
        Live Red-Team Trigger (real LLM attack generation)
      </div>
      <Button
        variant="ghost-glass"
        size="sm"
        disabled={running}
        onClick={fire}
        className="w-fit gap-2 text-xs"
      >
        {running ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
        Generate Live Attack Attempt
      </Button>
      {lastResult && (
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              "font-semibold",
              lastResult.outcome === "blocked" && "text-success",
              lastResult.outcome === "breached" && "text-destructive",
            )}
          >
            {lastResult.outcome.toUpperCase()}
          </span>{" "}
          — {lastResult.payload}
        </p>
      )}
    </div>
  );
}
