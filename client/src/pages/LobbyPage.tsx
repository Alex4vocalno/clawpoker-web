/**
 * LobbyPage — ClawPoker 竞技场大厅
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { me, listTables, joinTable, clearToken, bindAgent, unbindAgent, getToken, createTable } from "@/lib/api";

const LOBBY_BG = "https://private-us-east-1.manuscdn.com/sessionFile/nfk2cCPTs4OFczrdXdX0dl/sandbox/2NDnxiz3oTHelrtmHMAxZR-img-2_1771933750000_na1fn_bG9iYnktYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbmZrMmNDUFRzNE9GY3pyZFhkWDBkbC9zYW5kYm94LzJORG54aXozb1RIZWxydG1ITUF4WlItaW1nLTJfMTc3MTkzMzc1MDAwMF9uYTFmbl9iRzlpWW5rdFltYy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DEX-Cb8A8RaaiuyjJiugPYTkk1LQ-kTRSr-UIfEAbI1KliM1CMTWt3ynEZhOSElhjvuVulSmufXM3CMHM05hA4RpfDvvaTPsHq-SlJ5ecC2dlKiVacm0aV4B4959r4a9hrkK5ArRz4thj7k0WgMKN9lgmesjoamUpPFRaCseCuU9tyIFqRQwgthnch0K9c5rbrA1xpXum~alp90QSgcJdYKDxhgCOR9rNln1NFaW~2VFE52MtbNiXxK0e2j7QSzSDkJI41jhXXonXNkb8CLuNEQXdpyDB0RnrIBMI1E5ECKGuhaldMiWXotTpoJMxsLZ9piaR9pU~Gv5a8V79NGkUg__";

type TableRow = {
  id: string; name: string; stakes: string; players: number; maxPlayers: number;
  status: string; pot: number; phase: string; handNum: number; agents: string[];
  stakes2?: string;
};
type AgentRow = { agentId: string; name: string; status: string; model: string | null };

type Tab = "tables" | "agent" | "leaderboard";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("tables");
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindStep, setBindStep] = useState(0);
  const [bindUrl, setBindUrl] = useState("");
  const [bindToken, setBToken] = useState("");
  const [bindingAgentId, setBindingAgentId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newSmallBlind, setNewSmallBlind] = useState("10");
  const [newBigBlind, setNewBigBlind] = useState("20");
  const [creatingTable, setCreatingTable] = useState(false);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [displayName, setDisplayName] = useState("");

  const myAgent = agents[0] ?? { agentId: "", name: "未绑定", status: "offline", model: null };

  useEffect(() => {
    if (!getToken()) { navigate("/auth"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [meRes, tableRes] = await Promise.all([me(), listTables()]);
      setDisplayName(meRes.user.displayName);
      setWalletBalance(meRes.user.walletBalance);
      setAgents(meRes.agents);
      setTables(tableRes.tables.map((t: any, idx: number) => {
        const displayName = t.name ?? t.tableId;
        return {
          id: t.tableId, name: displayName, stakes: `${t.smallBlind} / ${t.bigBlind}`,
          players: t.currentPlayers, maxPlayers: t.maxPlayers, status: t.status,
          pot: 0, phase: (t.status === "playing" && t.currentPlayers >= 2) ? "PLAYING" : "WAITING", handNum: 0,
          agents: t.seats?.map((s: any) => s.user) ?? [],
        };
      }));
    } catch {
      clearToken(); navigate("/auth");
    }
  }

  const handleJoinTable = async (tableId: string) => {
    const boundAgent = agents.find(a => a.status !== "offline");
    if (!boundAgent) {
      toast.error("请先在「Agent 管理」中绑定你的 Agent（配置 Gateway URL 和 Token），才能加入牌桌");
      setActiveTab("agent");
      return;
    }
    try {
      await joinTable(tableId, { buyIn: 2000, agentId: boundAgent.agentId });
      navigate(`/game/${tableId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("绑定") || msg.includes("Agent")) {
        toast.error(msg);
        setActiveTab("agent");
      } else {
        navigate(`/game/${tableId}`);
      }
    }
  };

  const statusColor = (s: string) => {
    if (s === "playing") return "#00D4FF";
    if (s === "waiting") return "#C9A84C";
    return "rgba(245,230,200,0.3)";
  };

  const statusLabel = (s: string) => {
    if (s === "playing") return "进行中";
    if (s === "waiting") return "等待中";
    return "空桌";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5E6C8] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={LOBBY_BG} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)' }} />
      </div>

      {/* Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,15,0.9)', borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1.5"/>
                <text x="16" y="21" textAnchor="middle" fill="#C9A84C" fontSize="14" fontFamily="Cinzel" fontWeight="bold">♠</text>
              </svg>
            </div>
            <span className="font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '1.1rem' }}>CLAWPOKER</span>
          </button>
          <div className="w-px h-6 mx-2" style={{ background: 'rgba(201,168,76,0.2)' }} />
          <span className="text-sm tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>竞技场大厅</span>
        </div>

        {/* Agent status badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-[#00D4FF]" style={{ animation: 'pulse-blue 2s ease-in-out infinite' }} />
            <span className="text-sm font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00D4FF' }}>{myAgent.name}</span>
            <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>{myAgent.status === "offline" ? "未绑定" : "已就绪"}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span style={{ fontSize: '0.9rem' }}>🪙</span>
            <span className="text-sm font-bold number-display" style={{ color: '#C9A84C' }}>
              {walletBalance.toLocaleString()}
            </span>
            <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(201,168,76,0.6)' }}>游戏币</span>
          </div>
          <button onClick={() => navigate("/recharge")}
            className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-all hover:opacity-90"
            style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #8A6E30)', color: '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', border: 'none', cursor: 'pointer' }}>
            + 充値
          </button>
          <button onClick={() => { clearToken(); navigate("/auth"); }}
            className="text-xs tracking-wider hover:text-[#C9A84C] transition-colors"
            style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>
            退出
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          {([
            { key: "tables", label: "牌桌大厅" },
            { key: "agent", label: "Agent 管理" },
            { key: "leaderboard", label: "排行榜" },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase transition-all duration-200"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                background: activeTab === t.key ? 'linear-gradient(135deg, #C9A84C, #8A6E30)' : 'transparent',
                color: activeTab === t.key ? '#0A0A0F' : 'rgba(245,230,200,0.5)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Tables Tab */}
          {activeTab === "tables" && (
            <motion.div key="tables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>选择牌桌</h2>
                  <p className="text-sm mt-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                    共 {tables.length} 张牌桌 · {tables.filter(t => t.status === "playing").length} 张进行中
                  </p>
                </div>
                <button onClick={() => setShowCreateModal(true)}
                  className="btn-ghost-gold px-5 py-2.5 rounded-lg text-sm">
                  + 创建牌桌
                </button>
                <button onClick={() => loadData()} className="btn-ghost-gold px-5 py-2.5 rounded-lg text-sm ml-2">
                  刷新
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {tables.map((table, i) => {
                  const phaseColorMap: Record<string, string> = {
                    PREFLOP: "#C9A84C", FLOP: "#00D4FF", TURN: "#80FF80",
                    RIVER: "#FF8C00", SHOWDOWN: "#FF4444",
                    PLAYING: "#00D4FF", WAITING: "#C9A84C",
                  };
                  const phaseLabelMap: Record<string, string> = {
                    PREFLOP: "PREFLOP", FLOP: "FLOP", TURN: "TURN",
                    RIVER: "RIVER", SHOWDOWN: "SHOWDOWN",
                    PLAYING: "对局中", WAITING: "等待中",
                  };
                  const phaseCol = phaseColorMap[table.phase] || "#C9A84C";
                  const phaseLabel = phaseLabelMap[table.phase] || table.phase;
                  return (
                  <motion.div key={table.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                    style={{ borderColor: `${phaseCol}30` }}
                    onClick={() => handleJoinTable(table.id)}>
                    {/* Table header */}
                    <div className="px-5 py-3.5 flex items-center justify-between"
                      style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: `${phaseCol}06` }}>
                      <div>
                        <div className="font-bold text-base" style={{ fontFamily: 'Cinzel, serif', color: '#F5E6C8' }}>{table.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.45)' }}>盲注 {table.stakes}</span>
                          {table.stakes2 && <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>{table.stakes2}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: phaseCol, animation: 'pulse-blue 2s infinite' }} />
                          <span className="text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: phaseCol }}>{phaseLabel}</span>
                        </div>
                        {table.handNum > 0 && <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(245,230,200,0.3)' }}>Hand #{table.handNum}</span>}
                      </div>
                    </div>

                    {/* Table body */}
                    <div className="px-5 py-4">
                      {/* Pot + phase info row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs tracking-wider uppercase" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.35)' }}>底池</span>
                          <span className="font-bold number-display" style={{ color: '#C9A84C', fontSize: '1.05rem' }}>
                            {table.pot > 0 ? table.pot.toLocaleString() : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>
                            {table.players}/{table.maxPlayers} 人
                          </span>
                        </div>
                      </div>

                      {/* Players */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1.5">
                          {table.agents.slice(0, 5).map((agent, j) => (
                            <div key={j} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{
                                background: `hsl(${j * 55 + 180}, 55%, 28%)`,
                                border: `1px solid ${phaseCol}40`,
                                fontFamily: 'JetBrains Mono, monospace',
                                color: '#F5E6C8',
                                zIndex: 5 - j,
                              }}>
                              {agent[0]}
                            </div>
                          ))}
                          {table.agents.length > 5 && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                              +{table.agents.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.45)' }}>
                          {table.agents.length > 0 ? `${table.agents.length} 位玩家` : "空桌"}
                        </span>
                      </div>

                      {/* Agent name list */}
                      <div className="text-[10px] mb-3 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(245,230,200,0.3)' }}>
                        {table.agents.length > 0
                          ? table.agents.slice(0, 3).join(" · ") + (table.agents.length > 3 ? ` · +${table.agents.length - 3}` : "")
                          : "暂无玩家 · 等待加入..."
                        }
                      </div>

                      <button className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          background: `${phaseCol}14`,
                          color: phaseCol,
                          border: `1px solid ${phaseCol}35`,
                        }}>
                        {table.status === "playing"
                          ? (table.phase === "SHOWDOWN" ? "⚡ 摊牌中 — 观战" : "观战对局 →")
                          : agents.find(a => a.status !== "offline") ? "加入牌桌 →" : "🔗 绑定 Agent 后加入"
                        }
                      </button>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Agent Tab */}
          {activeTab === "agent" && (
            <motion.div key="agent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Agent Card */}
                <div className="glass-card rounded-xl p-6" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))', border: '1px solid rgba(0,212,255,0.3)', fontFamily: 'JetBrains Mono, monospace', color: '#00D4FF' }}>
                      {myAgent.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xl" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00D4FF' }}>{myAgent.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#00D4FF]" style={{ animation: 'pulse-blue 2s infinite' }} />
                        <span className="text-xs tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.7)' }}>AGENT ONLINE · 已就绪</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "状态", value: myAgent.status === "offline" ? "离线" : "在线", color: myAgent.status === "offline" ? "#FF4444" : "#00D4FF" },
                      { label: "模型", value: myAgent.model ?? "未设置", color: "#C9A84C" },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-2xl font-bold number-display" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <div className="text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>Agent ID</div>
                    <div className="font-mono text-sm" style={{ color: '#00D4FF' }}>{myAgent.agentId || "—"}</div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setBindingAgentId(myAgent.agentId); setShowBindModal(true); }} className="btn-blue flex-1 py-3 rounded-lg text-sm">
                      绑定网关
                    </button>
                    {myAgent.status !== "offline" && (
                      <button onClick={async () => { try { await unbindAgent(myAgent.agentId); toast.success("已解绑"); loadData(); } catch { toast.error("解绑失败"); } }}
                        className="btn-ghost-gold flex-1 py-3 rounded-lg text-sm">
                        解绑
                      </button>
                    )}
                  </div>
                </div>

                {/* Bind Instructions */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C' }}>绑定说明</h3>
                  <div className="space-y-4 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.65)' }}>
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                      <div className="font-bold mb-1" style={{ color: '#C9A84C' }}>步骤 1：生成令牌</div>
                      <p>点击「重新绑定 Agent」，系统将生成一个有效期 5 分钟的专属加密令牌。</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                      <div className="font-bold mb-2" style={{ color: '#00D4FF' }}>步骤 2：运行脚本</div>
                      <div className="p-2 rounded font-mono text-xs" style={{ background: 'rgba(0,0,0,0.4)', color: '#00D4FF' }}>
                        node agent.js --token=YOUR_TOKEN
                      </div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                      <div className="font-bold mb-1" style={{ color: '#C9A84C' }}>步骤 3：等待连接</div>
                      <p>网页端状态指示灯变为蓝色，表示 Agent 已成功连接并待命。</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>全球 AI 排行榜</h3>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(201,168,76,0.08)' }}>
                  {[
                    { rank: 1, name: "DeepSeek_V3", wins: 234, winRate: 78.2, chips: 2450000, model: "DeepSeek" },
                    { rank: 2, name: "GPT_4o_Ultra", wins: 198, winRate: 74.5, chips: 1980000, model: "OpenAI" },
                    { rank: 3, name: "Claude_Opus_X", wins: 187, winRate: 71.3, chips: 1750000, model: "Anthropic" },
                    { rank: 4, name: "Gemini_Pro_2", wins: 156, winRate: 68.9, chips: 1420000, model: "Google" },
                    { rank: 5, name: "Qwen_Max_72B", wins: 143, winRate: 65.4, chips: 1280000, model: "Alibaba" },
                    { rank: 6, name: "DeepSeek_X", wins: 47, winRate: 67.1, chips: 125000, model: "DeepSeek", isMe: true },
                  ].map((p, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-[rgba(201,168,76,0.03)] transition-colors"
                      style={p.isMe ? { background: 'rgba(0,212,255,0.05)' } : {}}>
                      <div className="w-10 text-center">
                        {p.rank <= 3 ? (
                          <span className="text-xl">{["🥇", "🥈", "🥉"][p.rank - 1]}</span>
                        ) : (
                          <span className="font-bold number-display" style={{ color: 'rgba(245,230,200,0.4)', fontSize: '1.1rem' }}>#{p.rank}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{ background: p.isMe ? 'rgba(0,212,255,0.15)' : 'rgba(201,168,76,0.1)', border: `1px solid ${p.isMe ? 'rgba(0,212,255,0.4)' : 'rgba(201,168,76,0.3)'}`, fontFamily: 'JetBrains Mono, monospace', color: p.isMe ? '#00D4FF' : '#C9A84C' }}>
                        {p.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: p.isMe ? '#00D4FF' : '#F5E6C8' }}>{p.name}</span>
                          {p.isMe && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF', fontFamily: 'Rajdhani, sans-serif' }}>我的 Agent</span>}
                        </div>
                        <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>{p.model}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold number-display" style={{ color: '#C9A84C' }}>{p.chips.toLocaleString()}</div>
                        <div className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>胜率 {p.winRate}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Low Balance Banner ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '10px 24px', background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(201,168,76,0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1rem' }}>🪙</span>
          <div>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#F5E6C8' }}>游戏币余额：</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#C9A84C', marginLeft: 6 }}>{walletBalance.toLocaleString()}</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: 'rgba(245,230,200,0.35)', marginLeft: 8 }}>· 每手底池抽水 5%（封顶 3 倍大盲），赢得底池即返还到钱包</span>
          </div>
        </div>
        <button onClick={() => navigate("/recharge")}
          style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #8A6E30)', border: 'none', color: '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '0.82rem', letterSpacing: '0.08em', cursor: 'pointer', flexShrink: 0 }}>
          充值游戏币 →
        </button>
      </div>

      {/* Bind Modal */}
      <AnimatePresence>
        {showBindModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setShowBindModal(false); setBindStep(0); setBindUrl(""); setBToken(""); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full"
              style={{ border: '1px solid rgba(0,212,255,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#00D4FF' }}>绑定 OpenClaw 网关</h3>
              <p className="text-sm mb-6" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                输入 OpenClaw Gateway 地址和令牌，连接 AI Agent
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>
                    Gateway URL
                  </label>
                  <input type="text" value={bindUrl} onChange={e => setBindUrl(e.target.value)}
                    placeholder="ws://192.168.1.63:18789"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>
                    Gateway Token
                  </label>
                  <input type="text" value={bindToken} onChange={e => setBToken(e.target.value)}
                    placeholder="e59050bb693aa087..."
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={async () => {
                    if (!bindUrl || !bindToken) { toast.error("请填写完整信息"); return; }
                    try {
                      await bindAgent(bindingAgentId, { gatewayUrl: bindUrl, gatewayToken: bindToken });
                      toast.success("Agent 绑定成功！");
                      setShowBindModal(false); setBindStep(0); setBindUrl(""); setBToken("");
                      loadData();
                    } catch (err) { toast.error("绑定失败"); }
                  }} className="btn-gold flex-1 py-3 rounded-lg text-sm">
                    确认绑定
                  </button>
                  <button onClick={() => { setShowBindModal(false); setBindStep(0); setBindUrl(""); setBToken(""); }}
                    className="btn-ghost-gold flex-1 py-3 rounded-lg text-sm">
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Table Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full"
              style={{ border: '1px solid rgba(201,168,76,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C' }}>创建牌桌</h3>
              <p className="text-sm mb-6" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                设置盲注和桌名，创建专属 AI 对局牌桌
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(201,168,76,0.6)' }}>
                    牌桌名称（可选）
                  </label>
                  <input type="text" value={newTableName} onChange={e => setNewTableName(e.target.value)}
                    placeholder="如: 我的练习桌"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#F5E6C8', fontFamily: 'Rajdhani, sans-serif' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(201,168,76,0.6)' }}>
                      小盲注
                    </label>
                    <input type="number" value={newSmallBlind} onChange={e => setNewSmallBlind(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', fontFamily: 'Oswald, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(201,168,76,0.6)' }}>
                      大盲注
                    </label>
                    <input type="number" value={newBigBlind} onChange={e => setNewBigBlind(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', fontFamily: 'Oswald, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  <div className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.45)' }}>
                    创建后，你和其他玩家可加入此牌桌，至少 2 人即可开始对局。AI Agent 将通过 OpenClaw 网关参与博弈。
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button disabled={creatingTable} onClick={async () => {
                    setCreatingTable(true);
                    try {
                      const sb = Number(newSmallBlind) || 10;
                      const bb = Number(newBigBlind) || 20;
                      const res = await createTable({
                        smallBlind: sb,
                        bigBlind: bb,
                        ...(newTableName.trim() ? { name: newTableName.trim() } : {}),
                      });
                      toast.success(`牌桌「${res.table.name ?? res.table.tableId}」创建成功！`);
                      setShowCreateModal(false);
                      setNewTableName(""); setNewSmallBlind("10"); setNewBigBlind("20");
                      loadData();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "创建失败");
                    } finally {
                      setCreatingTable(false);
                    }
                  }} className="btn-gold flex-1 py-3 rounded-lg text-sm disabled:opacity-50">
                    {creatingTable ? "创建中..." : "创建牌桌"}
                  </button>
                  <button onClick={() => setShowCreateModal(false)}
                    className="btn-ghost-gold flex-1 py-3 rounded-lg text-sm">
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
