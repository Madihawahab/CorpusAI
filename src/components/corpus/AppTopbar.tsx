import { useLocation } from "react-router-dom";
import ConnectionStatusPill from "@/components/corpus/ConnectionStatusPill";
import KickoffDialog from "@/components/corpus/KickoffDialog";
import { useCorpusData } from "@/context/CorpusDataContext";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Command Deck",
    subtitle: "Live overview of the active initiative and system autonomy",
  },
  "/network": {
    title: "Agent Network",
    subtitle: "D3 force-directed lineage graph of agent-to-agent flow",
  },
  "/negotiation": {
    title: "Negotiation",
    subtitle: "Live agent dialogue and raw FSM activity stream",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Agent-wise performance across every initiative",
  },
  "/ledger": {
    title: "Ledger",
    subtitle: "Full history of initiatives and decision gates",
  },
};

export default function AppTopbar() {
  const location = useLocation();
  const { connectionStatus } = useCorpusData();
  const copy = TITLES[location.pathname] ?? TITLES["/"];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-background/70 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight md:text-xl">{copy.title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{copy.subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ConnectionStatusPill status={connectionStatus} className="hidden sm:flex" />
        <KickoffDialog />
      </div>
    </header>
  );
}
