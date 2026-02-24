/**
 * GamePage — ClawPoker 核心牌桌页面
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 * 每张桌子通过 tableId 加载独立牌局数据（tableData.ts）
 */
import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  getTableData,
  AGENT_COLORS,
  type AgentData,
  type TerminalLine,
  type DanmakuItem,
} from "@/lib/tableData";

// ─── Card Component ──────────────────────────────────────────────────────────
const SUIT_SYM: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
const SUIT_COL: Record<string, string> = { s: "#111", h: "#CC2222", d: "#CC2222", c: "#111" };

function PlayingCard({ card, small = false, revealed = false }: { card: string; small?: boolean; revealed?: boolean }) {
  const isHidden = card === "XX";
  const w = small ? 28 : 44;
  const h = small ? 38 : 60;

  if (isHidden && !revealed) {
    return (
      <div style={{
        width: w, height: h, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid rgba(201,168,76,0.45)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: small ? 10 : 14, color: 'rgba(201,168,76,0.5)' }}>♦</div>
      </div>
    );
  }

  const suit = card[card.length - 1];
  const rank = card.slice(0, -1);

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        width: w, height: h, borderRadius: 4, flexShrink: 0,
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F0EEE8 100%)',
        border: '1px solid rgba(200,200,200,0.6)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.75)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
      <div style={{ position: 'absolute', top: 2, left: 3, fontSize: small ? 8 : 10, fontWeight: 900, color: SUIT_COL[suit], fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>
        {rank}
      </div>
      <div style={{ fontSize: small ? 11 : 17, color: SUIT_COL[suit], lineHeight: 1 }}>{SUIT_SYM[suit]}</div>
      <div style={{ position: 'absolute', bottom: 2, right: 3, fontSize: small ? 8 : 10, fontWeight: 900, color: SUIT_COL[suit], fontFamily: 'Oswald, sans-serif', lineHeight: 1, transform: 'rotate(180deg)' }}>
        {rank}
      </div>
    </motion.div>
  );
}

// ─── Action Clock ────────────────────────────────────────────────────────────
function ActionClock({ seconds, max = 15 }: { seconds: number; max?: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / max) * circ;
  const color = seconds > 8 ? "#00D4FF" : seconds > 4 ? "#C9A84C" : "#FF4444";
  return (
    <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
      </svg>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.1rem', color }}>{seconds}</span>
    </div>
  );
}

// ─── Seat positions ───────────────────────────────────────────────────────────
const SEAT_POS = [
  { x: 50, y: 88 },
  { x: 82, y: 74 },
  { x: 92, y: 38 },
  { x: 68, y: 8  },
  { x: 32, y: 8  },
  { x: 8,  y: 38 },
];

// ─── Seat Badge ───────────────────────────────────────────────────────────────
function SeatBadge({ agent }: { agent: AgentData }) {
  const isFolded = agent.status === "folded";
  const isThinking = agent.isActive;
  const isAllIn = agent.status === "all_in";
  const col = AGENT_COLORS[agent.name] || "#C9A84C";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: isFolded ? 0.38 : 1 }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem',
          background: isThinking ? `${col}22` : isAllIn ? 'rgba(255,68,68,0.15)' : 'rgba(10,10,15,0.92)',
          border: `2px solid ${isThinking ? col : isAllIn ? '#FF4444' : isFolded ? 'rgba(255,68,68,0.3)' : 'rgba(201,168,76,0.45)'}`,
          color: isThinking ? col : isAllIn ? '#FF4444' : '#F5E6C8',
          boxShadow: isThinking ? `0 0 20px ${col}55` : isAllIn ? '0 0 14px rgba(255,68,68,0.4)' : '0 2px 10px rgba(0,0,0,0.7)',
          animation: isThinking ? 'breathe 1.5s ease-in-out infinite' : undefined,
        }}>
          {agent.name[0]}
        </div>
        {isThinking && (
          <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid ${col}`, animation: 'spin-slow 3s linear infinite', opacity: 0.5 }} />
        )}
        {agent.isDealer && (
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#fff', color: '#000', fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>D</div>
        )}
        {isAllIn && (
          <div style={{ position: 'absolute', top: -4, left: -4, padding: '1px 4px', borderRadius: 3, background: '#FF4444', color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '0.5rem', letterSpacing: '0.05em' }}>ALL IN</div>
        )}
      </div>
      <div style={{ padding: '2px 7px', borderRadius: 4, background: 'rgba(10,10,15,0.92)', border: `1px solid ${isThinking ? `${col}50` : 'rgba(201,168,76,0.18)'}`, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: isThinking ? col : '#F5E6C8', maxWidth: 78, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {agent.name}
      </div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.6rem', color: '#C9A84C' }}>
        {agent.chips >= 1000 ? `${(agent.chips / 1000).toFixed(1)}K` : agent.chips}
      </div>
      {agent.lastAction && (
        <div style={{
          padding: '1px 6px', borderRadius: 3,
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.56rem',
          background: agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.15)' :
            agent.lastAction === "RAISE" || agent.lastAction === "BET" ? 'rgba(201,168,76,0.15)' :
            agent.lastAction === "ALL_IN" ? 'rgba(255,68,68,0.2)' : 'rgba(0,212,255,0.12)',
          color: agent.lastAction === "FOLD" ? '#FF4444' :
            agent.lastAction === "RAISE" || agent.lastAction === "BET" ? '#C9A84C' :
            agent.lastAction === "ALL_IN" ? '#FF4444' : '#00D4FF',
        }}>
          {agent.lastAction}{agent.lastAmount ? ` ${agent.lastAmount >= 1000 ? (agent.lastAmount/1000).toFixed(0)+'K' : agent.lastAmount}` : ""}
        </div>
      )}
    </div>
  );
}

// ─── Phase Badge ─────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  PREFLOP: "#C9A84C",
  FLOP: "#00D4FF",
  TURN: "#80FF80",
  RIVER: "#FF8C00",
  SHOWDOWN: "#FF4444",
};

// ─── Terminal line color/prefix ───────────────────────────────────────────────
function termColor(t: TerminalLine["type"]) {
  switch (t) {
    case "thinking": return "#C9A84C";
    case "calc":     return "#00D4FF";
    case "decision": return "#80FF80";
    case "chat":     return "#FF6B6B";
    case "system":   return "rgba(245,230,200,0.5)";
  }
}
function termPrefix(t: TerminalLine["type"]) {
  switch (t) {
    case "thinking": return "> ";
    case "calc":     return "$ ";
    case "decision": return "✓ ";
    case "chat":     return "💬 ";
    case "system":   return "  ";
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GamePage() {
  const [, navigate] = useLocation();
  const params = useParams<{ tableId: string }>();
  const tableId = params.tableId || "1";
  const tableData = getTableData(tableId);

  const [actionClock, setActionClock] = useState(12);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalIdx, setTerminalIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayedLine, setDisplayedLine] = useState("");
  const [danmakuMsgs, setDanmakuMsgs] = useState<Array<DanmakuItem & { id: string; color: string; lane: number }>>([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const script = tableData.terminalScript;
  const pool = tableData.danmakuPool;
  const activeAgent = tableData.agents.find(a => a.isActive);
  const isShowdown = tableData.phase === "SHOWDOWN";

  // Reset state when tableId changes
  useEffect(() => {
    setActionClock(12);
    setTerminalLines([]);
    setTerminalIdx(0);
    setCharIdx(0);
    setDisplayedLine("");
    setDanmakuMsgs([]);
  }, [tableId]);

  // Action clock
  useEffect(() => {
    if (!activeAgent) return;
    const t = setInterval(() => {
      setActionClock(c => {
        if (c <= 1) {
          toast.error(`${activeAgent.name} 行动超时 → 自动弃牌`);
          return 15;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeAgent, tableId]);

  // Terminal typewriter
  useEffect(() => {
    if (terminalIdx >= script.length) return;
    const line = script[terminalIdx];
    if (charIdx < line.text.length) {
      const t = setTimeout(() => {
        setDisplayedLine(p => p + line.text[charIdx]);
        setCharIdx(c => c + 1);
      }, 20);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setTerminalLines(p => [...p.slice(-28), line]);
        setTerminalIdx(i => i + 1);
        setCharIdx(0);
        setDisplayedLine("");
      }, 650);
      return () => clearTimeout(t);
    }
  }, [charIdx, terminalIdx, script]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalLines, displayedLine]);

  // Danmaku
  useEffect(() => {
    const spawn = () => {
      const msg = pool[Math.floor(Math.random() * pool.length)];
      const id = Math.random().toString(36).slice(2);
      const newMsg = {
        id, text: msg.text, agent: msg.agent,
        color: AGENT_COLORS[msg.agent] || "#C9A84C",
        lane: Math.floor(Math.random() * 4),
      };
      setDanmakuMsgs(p => [...p.slice(-12), newMsg]);
      setTimeout(() => setDanmakuMsgs(p => p.filter(m => m.id !== id)), 9500);
    };
    spawn();
    const iv = setInterval(spawn, 3000);
    return () => clearInterval(iv);
  }, [pool, tableId]);

  const phaseColor = PHASE_COLORS[tableData.phase] || "#C9A84C";

  return (
    <div style={{ height: '100vh', background: '#0A0A0F', color: '#F5E6C8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top HUD ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)', flexShrink: 0, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button onClick={() => navigate("/lobby")} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.12em', flexShrink: 0 }}>
            ← CLAWPOKER
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.2)', flexShrink: 0 }} />
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.85rem', color: '#F5E6C8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tableData.tableName}</div>
          <div style={{ padding: '2px 8px', borderRadius: 4, background: `${phaseColor}18`, border: `1px solid ${phaseColor}40`, fontFamily: 'Rajdhani, sans-serif', color: phaseColor, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0 }}>
            {tableData.phase}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: 'rgba(245,230,200,0.35)', letterSpacing: '0.08em' }}>HAND</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '0.95rem' }}>#{tableData.handNum}</span>
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: 'rgba(245,230,200,0.35)' }}>{tableData.stakes}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(245,230,200,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>底池</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '1.05rem' }}>{tableData.pot.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.18)' }} />
          <button onClick={() => setShowTerminal(p => !p)} style={{ padding: '5px 11px', borderRadius: 6, background: showTerminal ? 'rgba(0,212,255,0.1)' : 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
            脑机终端
          </button>
          <button onClick={() => navigate("/lobby")} style={{ padding: '5px 11px', borderRadius: 6, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
            离开
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Brain Terminal ── */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 296, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(3,5,10,0.99)', borderRight: '1px solid rgba(0,212,255,0.14)' }}>

              <div style={{ padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,212,255,0.1)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {["#FF4444","#C9A84C","#00D4FF"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(0,212,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 4 }}>
                  Brain-Machine Terminal
                </span>
                <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-blue 1.5s infinite' }} />
              </div>

              {activeAgent ? (
                <div style={{ padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid rgba(0,212,255,0.07)', background: 'rgba(0,212,255,0.04)', flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', flexShrink: 0 }}>
                    {activeAgent.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.76rem', color: '#00D4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeAgent.name}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.66rem', color: 'rgba(0,212,255,0.45)' }}>正在思考...</div>
                  </div>
                  <ActionClock seconds={actionClock} />
                </div>
              ) : isShowdown ? (
                <div style={{ padding: '9px 13px', borderBottom: '1px solid rgba(255,68,68,0.1)', background: 'rgba(255,68,68,0.05)', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#FF4444', fontWeight: 700 }}>⚡ SHOWDOWN — 亮牌结算中</div>
                </div>
              ) : null}

              <div ref={terminalRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {terminalLines.map(line => (
                  <div key={line.id} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', lineHeight: 1.65, color: termColor(line.type) }}>
                    <span style={{ opacity: 0.45 }}>{termPrefix(line.type)}</span>{line.text}
                  </div>
                ))}
                {terminalIdx < script.length && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', lineHeight: 1.65, color: termColor(script[terminalIdx].type) }}>
                    <span style={{ opacity: 0.45 }}>{termPrefix(script[terminalIdx].type)}</span>
                    {displayedLine}
                    <span style={{ display: 'inline-block', width: 6, height: 11, background: '#00D4FF', marginLeft: 2, verticalAlign: 'middle', animation: 'terminal-cursor 0.8s step-end infinite' }} />
                  </div>
                )}
              </div>

              <div style={{ padding: '9px 13px', borderTop: '1px solid rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', animation: `network-pulse 1.2s ease-in-out ${i*0.4}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(0,212,255,0.45)' }}>LLM 推理中...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center: 2.5D Poker Table ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* Danmaku layer */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', overflow: 'hidden' }}>
            {danmakuMsgs.map(msg => (
              <div key={msg.id} style={{
                position: 'absolute',
                top: `${5 + msg.lane * 7}%`,
                whiteSpace: 'nowrap',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: msg.color,
                background: `${msg.color}10`,
                border: `1px solid ${msg.color}30`,
                padding: '3px 12px',
                borderRadius: 20,
                textShadow: `0 0 10px ${msg.color}`,
                animation: 'danmaku-scroll 9.5s linear forwards',
              }}>
                <span style={{ color: 'rgba(245,230,200,0.35)', marginRight: 6 }}>[{msg.agent}]</span>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Table area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 680, aspectRatio: '16/10' }}>

              {/* 2.5D perspective wrapper */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'perspective(900px) rotateX(14deg)', transformOrigin: 'center 58%' }}>

                {/* Outer glow ring */}
                <div style={{ position: 'absolute', width: '90%', height: '80%', borderRadius: '50%', border: '2px solid rgba(201,168,76,0.3)', boxShadow: '0 0 50px rgba(201,168,76,0.1), inset 0 0 50px rgba(201,168,76,0.03)', top: '10%', left: '5%' }} />

                {/* Table felt */}
                <div style={{ position: 'absolute', width: '86%', height: '74%', borderRadius: '50%', top: '13%', left: '7%', background: 'radial-gradient(ellipse at 40% 40%, #1e5535 0%, #0f3020 55%, #071a12 100%)', border: '3px solid rgba(201,168,76,0.5)', boxShadow: '0 10px 50px rgba(0,0,0,0.9), inset 0 0 80px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 6px)' }} />
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
                </div>

                {/* Table rim shadow */}
                <div style={{ position: 'absolute', width: '86%', height: '74%', borderRadius: '50%', top: '13%', left: '7%', boxShadow: '0 16px 0 rgba(201,168,76,0.3), 0 18px 25px rgba(0,0,0,0.9)' }} />

                {/* Community Cards */}
                <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, alignItems: 'center', zIndex: 10 }}>
                  {tableData.boardCards.map((card, i) => (
                    <motion.div key={`${tableId}-board-${i}`} initial={{ rotateY: 90, opacity: 0, y: -10 }} animate={{ rotateY: 0, opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.35 }}>
                      <PlayingCard card={card} revealed={isShowdown} />
                    </motion.div>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - tableData.boardCards.length) }).map((_, i) => (
                    <div key={i} style={{ width: 44, height: 60, borderRadius: 4, border: '1px dashed rgba(201,168,76,0.18)', background: 'rgba(201,168,76,0.02)' }} />
                  ))}
                </div>

                {/* Pot display */}
                <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                  <div style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(10,10,15,0.88)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(201,168,76,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>POT</span>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '1rem' }}>{tableData.pot.toLocaleString()}</span>
                  </div>
                </div>

                {/* Phase indicator on table */}
                <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                  <div style={{ padding: '2px 10px', borderRadius: 12, background: `${phaseColor}15`, border: `1px solid ${phaseColor}35`, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: phaseColor, letterSpacing: '0.1em' }}>
                    {tableData.phase}
                  </div>
                </div>
              </div>

              {/* Player Seats (outside the 2.5D transform) */}
              {tableData.agents.map(agent => {
                const pos = SEAT_POS[agent.seatIndex] || SEAT_POS[0];
                return (
                  <div key={agent.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                    <SeatBadge agent={agent} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Action Log */}
          <div style={{ flexShrink: 0, padding: '7px 14px', background: 'rgba(10,10,15,0.94)', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(245,230,200,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>行动记录</span>
              {tableData.actionLog.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 6, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: log.color }}>{log.agent}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.66rem', color: log.color }}>{log.action}</span>
                  {log.amount && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.66rem', color: '#C9A84C' }}>+{log.amount >= 1000 ? (log.amount/1000).toFixed(0)+'K' : log.amount}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Agents Panel ── */}
        <div style={{ width: 236, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(6,6,11,0.98)', borderLeft: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ padding: '9px 13px', borderBottom: '1px solid rgba(201,168,76,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>参赛 Agents</h3>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.3)' }}>{tableData.agents.filter(a => a.status !== 'folded').length}/{tableData.agents.length} 在局</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tableData.agents.map(agent => {
              const col = AGENT_COLORS[agent.name] || "#C9A84C";
              const isFolded = agent.status === "folded";
              const isThinking = agent.isActive;
              const isAllIn = agent.status === "all_in";
              return (
                <div key={agent.id} style={{ padding: '9px 13px', borderBottom: '1px solid rgba(201,168,76,0.07)', background: isThinking ? 'rgba(0,212,255,0.04)' : isAllIn ? 'rgba(255,68,68,0.04)' : 'transparent', opacity: isFolded ? 0.45 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.72rem', background: isThinking ? 'rgba(0,212,255,0.18)' : isAllIn ? 'rgba(255,68,68,0.15)' : 'rgba(201,168,76,0.08)', border: `1px solid ${isThinking ? 'rgba(0,212,255,0.5)' : isAllIn ? 'rgba(255,68,68,0.5)' : 'rgba(201,168,76,0.28)'}`, color: isThinking ? '#00D4FF' : isAllIn ? '#FF4444' : '#C9A84C', flexShrink: 0 }}>
                      {agent.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.7rem', color: isThinking ? '#00D4FF' : isAllIn ? '#FF4444' : '#F5E6C8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(245,230,200,0.3)' }}>{agent.model}</div>
                    </div>
                    {agent.isDealer && <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', color: '#000', fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>D</div>}
                    {isThinking && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-blue 1s infinite', flexShrink: 0 }} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {agent.cards.map((card, j) => (
                        <PlayingCard key={`${agent.id}-${j}`} card={card} small revealed={isShowdown} />
                      ))}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#C9A84C' }}>{agent.chips.toLocaleString()}</div>
                      {agent.bet > 0 && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(245,230,200,0.35)' }}>下注 {agent.bet >= 1000 ? (agent.bet/1000).toFixed(0)+'K' : agent.bet}</div>}
                    </div>
                  </div>

                  {agent.lastAction && (
                    <div style={{ marginTop: 5 }}>
                      <span style={{
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem',
                        padding: '2px 7px', borderRadius: 10,
                        background: agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.1)' :
                          agent.lastAction === "RAISE" || agent.lastAction === "BET" ? 'rgba(201,168,76,0.1)' :
                          agent.lastAction === "ALL_IN" ? 'rgba(255,68,68,0.15)' : 'rgba(0,212,255,0.1)',
                        color: agent.lastAction === "FOLD" ? '#FF4444' :
                          agent.lastAction === "RAISE" || agent.lastAction === "BET" ? '#C9A84C' :
                          agent.lastAction === "ALL_IN" ? '#FF4444' : '#00D4FF',
                        border: `1px solid ${agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.25)' : agent.lastAction === "RAISE" || agent.lastAction === "BET" ? 'rgba(201,168,76,0.25)' : agent.lastAction === "ALL_IN" ? 'rgba(255,68,68,0.35)' : 'rgba(0,212,255,0.25)'}`,
                      }}>
                        {agent.lastAction}{agent.lastAmount ? ` ${agent.lastAmount >= 1000 ? (agent.lastAmount/1000).toFixed(0)+'K' : agent.lastAmount}` : ""}
                      </span>
                    </div>
                  )}

                  {isThinking && (
                    <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#00D4FF', animation: `network-pulse 1s ease-in-out ${i*0.3}s infinite` }} />)}
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(0,212,255,0.55)' }}>思考中...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Prev hand summary */}
          <div style={{ flexShrink: 0, padding: '9px 13px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', color: 'rgba(245,230,200,0.28)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>上一局摘要</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', lineHeight: 1.55, color: 'rgba(245,230,200,0.48)', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 6, padding: '7px 9px' }}>
              {tableData.prevHandSummary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
