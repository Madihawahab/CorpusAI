import { labSupabase } from "./supabaseClient";
import type {
  AmendmentProposal,
  AttackLogEntry,
  BargainingRound,
  BlocklistEntry,
  BoardroomSession,
  Constitution,
  DemoScenario,
  LabDecision,
} from "./types";

// ---------------------------------------------------------------------------
// Reads — direct table queries (protected by RLS public-read policies)
// ---------------------------------------------------------------------------

export async function fetchCurrentConstitution(): Promise<Constitution | null> {
  const { data: pointer, error: pointerError } = await labSupabase
    .from("lab_constitution_pointer")
    .select("current_version")
    .eq("id", 1)
    .maybeSingle();
  if (pointerError || !pointer) return null;

  const { data, error } = await labSupabase
    .from("lab_constitutions")
    .select("*")
    .eq("version", pointer.current_version)
    .maybeSingle();
  if (error) throw error;
  return data as Constitution | null;
}

export async function fetchConstitutionHistory(): Promise<Constitution[]> {
  const { data, error } = await labSupabase
    .from("lab_constitutions")
    .select("*")
    .order("version", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Constitution[];
}

export async function fetchPendingAmendment(): Promise<AmendmentProposal | null> {
  const { data, error } = await labSupabase
    .from("lab_amendment_proposals")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as AmendmentProposal | null;
}

export async function fetchDecisions(limit = 25): Promise<LabDecision[]> {
  const { data, error } = await labSupabase
    .from("lab_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LabDecision[];
}

export async function fetchBargainingRounds(
  decisionId: string,
): Promise<BargainingRound[]> {
  const { data, error } = await labSupabase
    .from("lab_bargaining_rounds")
    .select("*")
    .eq("decision_id", decisionId)
    .order("round_no", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BargainingRound[];
}

export async function fetchLatestBargainingRounds(): Promise<BargainingRound[]> {
  const { data, error } = await labSupabase
    .from("lab_bargaining_rounds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return ((data ?? []) as BargainingRound[]).reverse();
}

export async function fetchAttackLog(limit = 20): Promise<AttackLogEntry[]> {
  const { data, error } = await labSupabase
    .from("lab_attack_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AttackLogEntry[];
}

export async function fetchLatestBlocklistVersion(): Promise<number> {
  const { data, error } = await labSupabase
    .from("lab_blocklist_entries")
    .select("version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BlocklistEntry | null)?.version ?? 1;
}

export async function fetchLatestBoardroomSession(): Promise<BoardroomSession | null> {
  const { data, error } = await labSupabase
    .from("lab_boardroom_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as BoardroomSession | null;
}

// ---------------------------------------------------------------------------
// History reconstruction (Section 6 — Time-Travel Debugger)
// Implemented as direct "as-of" queries so it works even before the
// `lab-history` Edge Function is deployed.
// ---------------------------------------------------------------------------

export interface HistorySnapshot {
  constitution: Constitution | null;
  attackLogEntry: AttackLogEntry | null;
  blocklistVersion: number;
  decision: LabDecision | null;
  amendment: AmendmentProposal | null;
}

export async function fetchHistoryAt(timestampIso: string): Promise<HistorySnapshot> {
  const [constitutionRes, attackRes, decisionRes, amendmentRes] = await Promise.all([
    labSupabase
      .from("lab_constitutions")
      .select("*")
      .lte("effective_from", timestampIso)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    labSupabase
      .from("lab_attack_log")
      .select("*")
      .lte("created_at", timestampIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    labSupabase
      .from("lab_decisions")
      .select("*")
      .lte("created_at", timestampIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    labSupabase
      .from("lab_amendment_proposals")
      .select("*")
      .lte("created_at", timestampIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    constitution: (constitutionRes.data as Constitution | null) ?? null,
    attackLogEntry: (attackRes.data as AttackLogEntry | null) ?? null,
    blocklistVersion: (attackRes.data as AttackLogEntry | null)?.blocklist_version_after ?? 1,
    decision: (decisionRes.data as LabDecision | null) ?? null,
    amendment: (amendmentRes.data as AmendmentProposal | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Writes that go through Edge Functions (LLM-backed, real logic)
// Falls back gracefully with a clear error if functions aren't deployed yet.
// ---------------------------------------------------------------------------

async function invokeLabFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await labSupabase.functions.invoke(name, { body });
  if (error) throw new Error(`${name} failed: ${error.message}`);
  return data as T;
}

export function runBargainingSession(input: {
  requestedAmount: number;
  idealAmount: number;
  policyCap: number;
  initiativeLabel: string;
}) {
  return invokeLabFunction<{ decision: LabDecision; rounds: BargainingRound[] }>(
    "lab-bargain",
    input,
  );
}

export function verifyDecision(input: { decisionId: string }) {
  return invokeLabFunction<{ decision: LabDecision }>("lab-verify", input);
}

export function draftManualAmendment(input: { proposedRules: Constitution["rules"] }) {
  return invokeLabFunction<{ draftVersion: Constitution }>("lab-amend-manual", input);
}

export function ratifyAmendment(input: { amendmentId?: string; version?: number }) {
  return invokeLabFunction<{ current_version: number }>("lab-amend-ratify", input);
}

export function runAmendmentWatch() {
  return invokeLabFunction<{ triggered: boolean; proposal?: AmendmentProposal }>(
    "lab-amend-watch",
    {},
  );
}

export function runRedTeamAttempt(input: { priorAttempts: string[] }) {
  return invokeLabFunction<{ attempt: AttackLogEntry }>("lab-redteam", input);
}

export function runBoardroomSession(input: { amount: number; reason: string }) {
  return invokeLabFunction<{ session: BoardroomSession }>("lab-boardroom", input);
}

export function fetchHistoryViaFunction(timestampIso: string) {
  return invokeLabFunction<HistorySnapshot>("lab-history", { timestamp: timestampIso });
}

export function runDemoScenario(scenario: DemoScenario) {
  return invokeLabFunction<{ ok: true }>("lab-demo", { scenario });
}
