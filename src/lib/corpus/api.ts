import type {
  AnalyticsData,
  Decision,
  GraphData,
  Initiative,
} from "./types";

export const API_URL = "https://corpusai-2ftb.onrender.com";
export const WS_URL = API_URL.replace(/^http/, "ws");

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchConfig(): Promise<{ parentPageId?: string }> {
  return getJson("/api/config");
}

export function fetchInitiatives(): Promise<Initiative[]> {
  return getJson("/api/initiatives");
}

export function fetchDecisions(): Promise<Decision[]> {
  return getJson("/api/decisions");
}

export function fetchInitiativeLogs(
  initiativeId: string,
): Promise<{ logs: import("./types").AgentLog[] }> {
  return getJson(`/api/initiatives/${initiativeId}/logs`);
}

export function fetchInitiativeGraph(
  initiativeId: string,
): Promise<{ graph: GraphData }> {
  return getJson(`/api/initiatives/${initiativeId}/graph`);
}

export function fetchAnalytics(): Promise<AnalyticsData> {
  return getJson("/api/analytics");
}

export async function triggerInitiative(
  goal: string,
  owner: string,
): Promise<{ initiativeId: string }> {
  const res = await fetch(`${API_URL}/api/initiatives/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, owner }),
  });
  if (!res.ok) {
    throw new Error("Failed to trigger initiative");
  }
  return res.json();
}
