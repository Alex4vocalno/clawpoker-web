export interface ApiUser {
  userId: string;
  username: string;
  displayName: string;
  walletBalance: number;
}

export interface ApiAgent {
  agentId: string;
  name: string;
  status: string;
  model: string | null;
}

export interface ApiTable {
  tableId: string;
  name?: string;
  status: string;
  smallBlind: number;
  bigBlind: number;
  maxPlayers: number;
  currentPlayers: number;
}

export interface ApiGameSeat {
  seatNo: number;
  user: string;
  agentName: string | null;
  agentStatus: string | null;
  playerId: string | null;
  stack: number;
  holeCards?: unknown[];
}

export interface ApiGameState {
  table: ApiTable;
  seats: ApiGameSeat[];
  hand: {
    handId: number;
    status: string;
    startTime: string;
    endTime: string | null;
    potTotal: number;
    communityCards: unknown[];
    winners: unknown[];
    rake?: number;
  } | null;
  actions: Array<{
    playerId: string;
    actionType: string;
    amount: number | null;
    seq: number;
    reasoning?: string | null;
  }>;
}

export interface ApiActiveSeat {
  tableId: string;
  tableStatus: string;
  smallBlind: number;
  bigBlind: number;
  seatNo: number;
  stackInPlay: number;
  buyIn: number;
  joinedAt: string;
  agent: {
    agentId: string;
    name: string;
    status: string;
  } | null;
}

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  `http://${window.location.hostname}:9460`;
const TOKEN_KEY = "clawpoker_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit, requireAuth = false): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `API error: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function sendVerifyCode(payload: {
  email: string;
  purpose: string;
}): Promise<{ ok: boolean; message: string }> {
  return apiFetch("/api/v1/auth/send-code", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function register(payload: {
  email: string;
  code: string;
  username: string;
  password: string;
  displayName?: string;
}): Promise<{ token: string; user: ApiUser }> {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload: {
  username: string;
  password: string;
}): Promise<{ token: string; user: ApiUser }> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ ok: boolean; message: string }> {
  return apiFetch("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function googleLogin(payload: {
  credential: string;
  agentName?: string;
}): Promise<{ token: string; user: ApiUser; isNewUser?: boolean }> {
  return apiFetch("/api/v1/auth/google", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function me(): Promise<{ user: ApiUser; agents: ApiAgent[] }> {
  return apiFetch("/api/v1/auth/me", undefined, true);
}

export async function logout(): Promise<{ ok: true }> {
  return apiFetch(
    "/api/v1/auth/logout",
    {
      method: "POST",
      body: JSON.stringify({})
    },
    true
  );
}

export async function listTables(): Promise<{ tables: ApiTable[] }> {
  return apiFetch("/api/v1/tables");
}

export async function listActiveSeats(): Promise<{ seats: ApiActiveSeat[] }> {
  return apiFetch("/api/v1/tables/active-seats", undefined, true);
}

export async function createTable(payload: {
  tableId?: string;
  name?: string;
  smallBlind?: number;
  bigBlind?: number;
  maxPlayers?: number;
}): Promise<{ table: ApiTable }> {
  return apiFetch(
    "/api/v1/tables",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );
}

export async function joinTable(
  tableId: string,
  payload: { buyIn?: number; agentId?: string; seatNo?: number } = {}
): Promise<{ tableId: string; seatNo: number; playerId: string; buyIn: number }> {
  return apiFetch(
    `/api/v1/tables/${tableId}/join`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    true
  );
}

export async function startTable(tableId: string): Promise<{ ok: boolean; tableId: string; status: string }> {
  return apiFetch(
    `/api/v1/tables/${tableId}/start`,
    {
      method: "POST",
      body: JSON.stringify({})
    },
    true
  );
}

export async function getGameState(tableId: string): Promise<ApiGameState> {
  const token = getToken();
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  return apiFetch(`/api/v1/games/${tableId}/state${qs}`);
}

export function getGameStreamUrl(tableId: string): string {
  return `${API_BASE}/api/v1/games/${tableId}/stream`;
}

export async function leaveTable(
  tableId: string,
  mode: "forfeit" | "graceful" = "graceful"
): Promise<{ tableId: string; seatNo: number; refunded: number }> {
  return apiFetch(
    `/api/v1/tables/${tableId}/leave`,
    {
      method: "POST",
      body: JSON.stringify({ mode })
    },
    true
  );
}

// ── Token Refresh ──────────────────────────────────────────────────────────
export async function refreshToken(): Promise<{ token: string; expiresAt: string }> {
  return apiFetch("/api/v1/auth/refresh", { method: "POST", body: JSON.stringify({}) }, true);
}

// ── Wallet Ledger ──────────────────────────────────────────────────────────
export interface ApiLedgerEntry {
  ledgerId: string;
  direction: string;
  amount: number;
  availableDelta: number;
  lockedDelta: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  metadata: unknown;
  createdAt: string;
}

export async function getWalletLedger(
  cursor?: string,
  limit = 50
): Promise<{ entries: ApiLedgerEntry[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));
  return apiFetch(`/api/v1/wallet/ledger?${params}`, undefined, true);
}

// ── Wallet Transactions (new endpoints) ────────────────────────────────────
export interface ApiWalletTransaction {
  id: number;
  direction: string;
  amount: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  metadata: unknown;
  createdAt: string;
}

export interface ApiWalletStats {
  balance: number;
  lockedBalance: number;
  totalWin: number;
  totalLoss: number;
  netProfit: number;
  totalRecharged: number;
  handsPlayed: number;
  handsWon: number;
  winRate: number;
}

export async function getWalletTransactions(
  limit = 50,
  offset = 0
): Promise<{ transactions: ApiWalletTransaction[]; balance: number; lockedBalance: number }> {
  return apiFetch(`/api/v1/wallet/transactions?limit=${limit}&offset=${offset}`, undefined, true);
}

export async function getWalletStats(): Promise<ApiWalletStats> {
  return apiFetch("/api/v1/wallet/stats", undefined, true);
}

// ── Recharge Orders ────────────────────────────────────────────────────────
export interface ApiRechargeOrder {
  orderId: string;
  provider: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export async function createRechargeOrder(payload: {
  packageId: string;
  amount: number;
  provider?: string;
}): Promise<{ order: ApiRechargeOrder }> {
  return apiFetch(
    "/api/v1/wallet/recharge-orders",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export async function listRechargeOrders(
  cursor?: string,
  limit = 20
): Promise<{ orders: ApiRechargeOrder[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));
  return apiFetch(`/api/v1/wallet/recharge-orders?${params}`, undefined, true);
}

// ── Hand History ───────────────────────────────────────────────────────────
export interface ApiHandSummary {
  handId: string;
  tableId: string;
  status: string;
  potTotal: number;
  communityCards: unknown[];
  winners: unknown[];
  startTime: string;
  endTime: string | null;
  settlements: Array<{ playerId: string; result: string; chipsDelta: number }>;
}

export async function listHands(
  tableId: string,
  cursor?: string,
  limit = 20
): Promise<{ hands: ApiHandSummary[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));
  return apiFetch(`/api/v1/games/${tableId}/hands?${params}`);
}

export interface ApiHandDetail {
  handId: string;
  tableId: string;
  status: string;
  potTotal: number;
  communityCards: unknown[];
  winners: unknown[];
  startTime: string;
  endTime: string | null;
  dealerPlayerId: string | null;
  settlements: Array<{ playerId: string; result: string; chipsDelta: number }>;
  stats: Array<{
    playerId: string;
    holeCards: unknown;
    finalHandRank: string | null;
    chipsWon: number;
    chipsLost: number;
  }>;
  actions: Array<{
    seq: number;
    playerId: string;
    street: string;
    actionType: string;
    amount: number | null;
    createdAt: string;
  }>;
}

export async function getHandDetail(
  tableId: string,
  handId: string
): Promise<{ hand: ApiHandDetail }> {
  return apiFetch(`/api/v1/games/${tableId}/hands/${handId}`);
}

// ── Agent Bind / Unbind / Status / Heartbeat ───────────────────────────────
export async function bindAgent(
  agentId: string,
  payload: { gatewayUrl: string; gatewayToken: string }
): Promise<{ agent: { agentId: string; name: string; status: string; gatewayUrl: string } }> {
  return apiFetch(
    `/api/v1/agents/${agentId}/bind`,
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export async function unbindAgent(
  agentId: string
): Promise<{ agent: { agentId: string; name: string; status: string } }> {
  return apiFetch(`/api/v1/agents/${agentId}/unbind`, { method: "POST", body: JSON.stringify({}) }, true);
}

export async function getAgentStatus(agentId: string): Promise<{
  agent: {
    agentId: string;
    name: string;
    status: string;
    gatewayUrl: string | null;
    lastHeartbeatAt: string | null;
    model: string | null;
    provider: string | null;
  };
}> {
  return apiFetch(`/api/v1/agents/${agentId}/status`, undefined, true);
}

export async function agentHeartbeat(agentId: string): Promise<{
  agent: { agentId: string; status: string; lastHeartbeatAt: string | null };
}> {
  return apiFetch(`/api/v1/agents/${agentId}/heartbeat`, { method: "POST", body: JSON.stringify({}) }, true);
}

export async function createAgent(payload: {
  name: string;
  model?: string;
}): Promise<{ agent: ApiAgent }> {
  return apiFetch(
    "/api/v1/agents",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

// ── Rankings ───────────────────────────────────────────────────────────────
export interface ApiRanking {
  rank: number;
  userId: string | null;
  agentId: string | null;
  agentName: string | null;
  playerId?: string;
  score: number;
  games: number;
  wins: number;
  netChips: number;
}

export async function getRankings(
  period: "daily" | "weekly" | "monthly" | "all_time" = "all_time",
  limit = 50
): Promise<{ period: string; rankings: ApiRanking[] }> {
  return apiFetch(`/api/v1/rankings/global?period=${period}&limit=${limit}`);
}

// ── Wallet Balance ─────────────────────────────────────────────────────────
export async function getWalletBalance(): Promise<{
  balance: number;
  lockedBalance: number;
  currency: string;
}> {
  return apiFetch("/api/v1/wallet/balance", undefined, true);
}
