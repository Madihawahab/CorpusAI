import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  fetchAttackLog,
  fetchCurrentConstitution,
  fetchDecisions,
  fetchLatestBargainingRounds,
  fetchLatestBlocklistVersion,
  fetchLatestBoardroomSession,
  fetchPendingAmendment,
} from "@/lib/lab/api";
import { LAB_SUPABASE_CONFIGURED } from "@/lib/lab/config";
import type {
  AmendmentProposal,
  AttackLogEntry,
  BargainingRound,
  BoardroomSession,
  Constitution,
  LabDecision,
} from "@/lib/lab/types";

interface LabDataState {
  configured: boolean;
  constitution: Constitution | null;
  pendingAmendment: AmendmentProposal | null;
  decisions: LabDecision[];
  recentRounds: BargainingRound[];
  attackLog: AttackLogEntry[];
  blocklistVersion: number;
  boardroomSession: BoardroomSession | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const LabDataContext = createContext<LabDataState | null>(null);

export function LabDataProvider({ children }: { children: ReactNode }) {
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [pendingAmendment, setPendingAmendment] = useState<AmendmentProposal | null>(null);
  const [decisions, setDecisions] = useState<LabDecision[]>([]);
  const [recentRounds, setRecentRounds] = useState<BargainingRound[]>([]);
  const [attackLog, setAttackLog] = useState<AttackLogEntry[]>([]);
  const [blocklistVersion, setBlocklistVersion] = useState(1);
  const [boardroomSession, setBoardroomSession] = useState<BoardroomSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!LAB_SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }
    try {
      const [
        constitutionData,
        amendmentData,
        decisionsData,
        roundsData,
        attackData,
        blocklistVersionData,
        boardroomData,
      ] = await Promise.all([
        fetchCurrentConstitution(),
        fetchPendingAmendment(),
        fetchDecisions(),
        fetchLatestBargainingRounds(),
        fetchAttackLog(),
        fetchLatestBlocklistVersion(),
        fetchLatestBoardroomSession(),
      ]);
      setConstitution(constitutionData);
      setPendingAmendment(amendmentData);
      setDecisions(decisionsData);
      setRecentRounds(roundsData);
      setAttackLog(attackData);
      setBlocklistVersion(blocklistVersionData);
      setBoardroomSession(boardroomData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Governance Lab data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: LabDataState = {
    configured: LAB_SUPABASE_CONFIGURED,
    constitution,
    pendingAmendment,
    decisions,
    recentRounds,
    attackLog,
    blocklistVersion,
    boardroomSession,
    loading,
    error,
    refresh,
  };

  return <LabDataContext.Provider value={value}>{children}</LabDataContext.Provider>;
}

export function useLabData() {
  const ctx = useContext(LabDataContext);
  if (!ctx) {
    throw new Error("useLabData must be used within LabDataProvider");
  }
  return ctx;
}
