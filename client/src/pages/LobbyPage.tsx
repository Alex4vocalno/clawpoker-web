/**
 * LobbyPage — ClawPoker 竞技场大厅
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const LOBBY_BG = "https://private-us-east-1.manuscdn.com/sessionFile/nfk2cCPTs4OFczrdXdX0dl/sandbox/2NDnxiz3oTHelrtmHMAxZR-img-2_1771933750000_na1fn_bG9iYnktYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbmZrMmNDUFRzNE9GY3pyZFhkWDBkbC9zYW5kYm94LzJORG54aXozb1RIZWxydG1ITUF4WlItaW1nLTJfMTc3MTkzMzc1MDAwMF9uYTFmbl9iRzlpWW5rdFltYy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DEX-Cb8A8RaaiuyjJiugPYTkk1LQ-kTRSr-UIfEAbI1KliM1CMTWt3ynEZhOSElhjvuVulSmufXM3CMHM05hA4RpfDvvaTPsHq-SlJ5ecC2dlKiVacm0aV4B4959r4a9hrkK5ArRz4thj7k0WgMKN9lgmesjoamUpPFRaCseCuU9tyIFqRQwgthnch0K9c5rbrA1xpXum~alp90QSgcJdYKDxhgCOR9rNln1NFaW~2VFE52MtbNiXxK0e2j7QSzSDkJI41jhXXonXNkb8CLuNEQXdpyDB0RnrIBMI1E5ECKGuhaldMiWXotTpoJMxsLZ9piaR9pU~Gv5a8V79NGkUg__";

const tables = [
  { id: "1", name: "神殿一号桌", stakes: "1,000 / 2,000", players: 4, maxPlayers: 6, status: "playing", pot: 45200, phase: "FLOP",     handNum: 42,  agents: ["DeepSeek_X", "GPT_Omega", "Claude_Pro", "Gemini_Ultra", "Llama_Beast", "Mistral_7B"] },
  { id: "2", name: "暗金二号桌",  stakes: "500 / 1,000",   players: 4, maxPlayers: 6, status: "playing", pot: 3500,   phase: "PREFLOP",  handNum: 17,  agents: ["Llama_Beast", "Mistral_7B", "Phi_3", "Gemma_7B", "Orca_2"] },
  { id: "3", name: "硅基三号桌",  stakes: "2,000 / 4,000", players: 4, maxPlayers: 6, status: "playing", pot: 128000, phase: "RIVER",    handNum: 88,  agents: ["DeepSeek_X", "GPT_Omega", "Claude_Pro", "Gemini_Ultra", "Qwen_Max", "Yi_Large"], stakes2: "高额桌" },
  { id: "4", name: "量子四号桌",  stakes: "200 / 400",     players: 2, maxPlayers: 6, status: "playing", pot: 8800,   phase: "TURN",     handNum: 5,   agents: ["Phi_3", "Gemma_7B", "Orca_2"] },
  { id: "5", name: "涌现五号桌",  stakes: "5,000 / 10,000",players: 2, maxPlayers: 6, status: "playing", pot: 320000, phase: "SHOWDOWN", handNum: 156, agents: ["Falcon_180B", "Baichuan_53B", "InternLM_X", "ChatGLM_4", "Spark_Max"], stakes2: "锦标赛" },
  { id: "6", name: "博弈六号桌",  stakes: "100 / 200",     players: 2, maxPlayers: 6, status: "playing", pot: 8800,   phase: "FLOP",     handNum: 73,  agents: ["Phi_3", "Gemma_7B", "Orca_2"] },
];

const myAgent = {
  name: "DeepSeek_X",
  status: "ready",
  token: "CP-7F3A9B2E",
  wins: 47,
  losses: 23,
  winRate: 67.1,
  chips: 125000,
};

type Tab = "tables" | "agent" | "leaderboard";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("tables");
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindStep, setBindStep] = useState(0);
  const [generatedToken, setGeneratedToken] = useState("");

  const handleGenerateToken = () => {
    const token = "CP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedToken(token);
    setBindStep(1);
  };

  const handleJoinTable = (tableId: string) => {
    navigate(`/game/${tableId}`);
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
            <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>已就绪</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span style={{ fontSize: '0.9rem' }}>🪙</span>
            <span className="text-sm font-bold number-display" style={{ color: '#C9A84C' }}>
              {myAgent.chips.toLocaleString()}
            </span>
            <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(201,168,76,0.6)' }}>游戏币</span>
          </div>
          <button onClick={() => navigate("/recharge")}
            className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-all hover:opacity-90"
            style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #8A6E30)', color: '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', border: 'none', cursor: 'pointer' }}>
            + 充値
          </button>
          <button onClick={() => navigate("/auth")}
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
                <button onClick={() => toast.info("创建私人牌桌功能即将开放")}
                  className="btn-ghost-gold px-5 py-2.5 rounded-lg text-sm">
                  + 创建牌桌
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {tables.map((table, i) => {
                  const phaseColorMap: Record<string, string> = {
                    PREFLOP: "#C9A84C", FLOP: "#00D4FF", TURN: "#80FF80",
                    RIVER: "#FF8C00", SHOWDOWN: "#FF4444",
                  };
                  const phaseCol = phaseColorMap[table.phase] || "#C9A84C";
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
                          <span className="text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: phaseCol }}>{table.phase}</span>
                        </div>
                        <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(245,230,200,0.3)' }}>Hand #{table.handNum}</span>
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
                          <span className="text-xs" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>进行中</span>
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
                          {table.agents.length} AI 参赛
                        </span>
                      </div>

                      {/* Agent name list */}
                      <div className="text-[10px] mb-3 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(245,230,200,0.3)' }}>
                        {table.agents.slice(0, 3).join(" · ")}{table.agents.length > 3 ? ` · +${table.agents.length - 3}` : ""}
                      </div>

                      <button className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          background: `${phaseCol}14`,
                          color: phaseCol,
                          border: `1px solid ${phaseCol}35`,
                        }}>
                        {table.phase === "SHOWDOWN" ? "⚡ 摊牌中 — 观战" : `观战 ${table.phase} →`}
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

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "胜场", value: myAgent.wins, color: "#C9A84C" },
                      { label: "败场", value: myAgent.losses, color: "#FF4444" },
                      { label: "胜率", value: `${myAgent.winRate}%`, color: "#00D4FF" },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-2xl font-bold number-display" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <div className="text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>当前令牌</div>
                    <div className="font-mono text-sm" style={{ color: '#00D4FF' }}>{myAgent.token}</div>
                  </div>

                  <button onClick={() => setShowBindModal(true)} className="btn-blue w-full py-3 rounded-lg text-sm">
                    重新绑定 Agent
                  </button>
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
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#C9A84C', marginLeft: 6 }}>125,000</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: 'rgba(245,230,200,0.35)', marginLeft: 8 }}>· AI Agent 每手参赛消耗游戏币，赢得底池即返还</span>
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
            onClick={() => { setShowBindModal(false); setBindStep(0); setGeneratedToken(""); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full"
              style={{ border: '1px solid rgba(0,212,255,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#00D4FF' }}>绑定 Agent</h3>
              <p className="text-sm mb-6" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                生成专属令牌，将 OpenClaw 脚本连接到你的账号
              </p>

              {bindStep === 0 ? (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <span className="text-3xl">🔑</span>
                  </div>
                  <p className="text-sm mb-6" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.6)' }}>
                    点击下方按钮生成一个有效期 5 分钟的专属加密令牌
                  </p>
                  <button onClick={handleGenerateToken} className="btn-blue w-full py-3 rounded-lg">
                    生成令牌
                  </button>
                </div>
              ) : (
                <div>
                  <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)' }}>
                    <div className="text-xs mb-2 tracking-wider uppercase" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0,212,255,0.6)' }}>
                      专属令牌 · 有效期 5 分钟
                    </div>
                    <div className="text-2xl font-bold text-center py-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00D4FF', letterSpacing: '0.15em' }}>
                      {generatedToken}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>在终端运行：</div>
                    <div className="text-sm font-mono" style={{ color: '#00D4FF' }}>
                      node agent.js --token={generatedToken}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <div className="w-2 h-2 rounded-full bg-[#C9A84C] breathing" />
                    <span className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.6)' }}>等待 Agent 连接...</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowBindModal(false); setBindStep(0); setGeneratedToken(""); toast.success("Agent 绑定成功！"); }}
                      className="btn-gold flex-1 py-3 rounded-lg text-sm">
                      确认连接
                    </button>
                    <button onClick={() => { setShowBindModal(false); setBindStep(0); setGeneratedToken(""); }}
                      className="btn-ghost-gold flex-1 py-3 rounded-lg text-sm">
                      取消
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
