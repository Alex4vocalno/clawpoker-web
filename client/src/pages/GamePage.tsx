/**
 * GamePage — ClawPoker 核心牌桌页面
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 * Features:
 *   - 2.5D 倾斜视角牌桌（椭圆形绿毡）
 *   - 脑机终端打字机特效（左侧面板）
 *   - AI 弹幕系统（顶部飘过）
 *   - 行动钟倒计时（SVG 圆环）
 *   - Agent 思考流（右侧列表）
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type Suit = "s" | "h" | "d" | "c";
type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";
type CardVal = `${Rank}${Suit}` | "XX";
type Phase = "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";
type Action = "FOLD" | "CHECK" | "CALL" | "RAISE" | "ALL_IN";

interface Agent {
  id: string;
  name: string;
  model: string;
  chips: number;
  bet: number;
  cards: CardVal[];
  status: "thinking" | "acted" | "folded" | "waiting" | "all_in";
  isActive: boolean;
  seatIndex: number;
  isDealer: boolean;
  lastAction?: Action;
  lastAmount?: number;
}

interface DanmakuMsg {
  id: string;
  agent: string;
  text: string;
  color: string;
  lane: number;
}

interface TerminalLine {
  id: string;
  text: string;
  type: "thinking" | "calc" | "decision" | "chat" | "system";
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_BACK_URL = "https://private-us-east-1.manuscdn.com/sessionFile/nfk2cCPTs4OFczrdXdX0dl/sandbox/2NDnxiz3oTHelrtmHMAxZR-img-5_1771933762000_na1fn_Y2FyZC1iYWNr.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbmZrMmNDUFRzNE9GY3pyZFhkWDBkbC9zYW5kYm94LzJORG54aXozb1RIZWxydG1ITUF4WlItaW1nLTVfMTc3MTkzMzc2MjAwMF9uYTFmbl9ZMkZ5WkMxaVlXTnIuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FzmWC5IhwI0MOzBhLFi58--tI4R9L9taBRXI8BERmIPKAxrFiISQHX-u-ZFBUGVKL2KWzlXINfJXI6LaOQntK3ReJnMaDscUyoRVvUw28pTV88QkSirJX2E9UQJQNlBgJrbPktqYSY9BoPacaZHE6fFpz5Gjy0L01oRgZpvKhRCZc~h8YK8bFRBnwuz-a8X26dA36k7I1ceCiJ96Pqb-ZlLX8QY-y4jf6VIs4EPo2H6K5LiWTUJ78dwTMz-kzFpiiG8fAspcJsM7tpYEiImC3wz6r9WEZ-YHmEkB1sADf22jsYPYoM2w0SOtuODpKQ5NDOcGNjFnEZsXz~6j5TYQ__";

const SUIT_SYM: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
const SUIT_COL: Record<Suit, string> = { s: "#1a1a1a", h: "#CC2222", d: "#CC2222", c: "#1a1a1a" };
const AGENT_COL: Record<string, string> = {
  "DeepSeek_X": "#00D4FF", "GPT_Omega": "#C9A84C", "Claude_Pro": "#FF6B6B",
  "Gemini_Ultra": "#80FF80", "Llama_Beast": "#FF8C00", "Mistral_7B": "#CC88FF",
};

const INITIAL_AGENTS: Agent[] = [
  { id:"1", name:"DeepSeek_X", model:"DeepSeek", chips:8500, bet:200, cards:["As","Ks"], status:"acted", isActive:false, seatIndex:0, isDealer:false, lastAction:"RAISE", lastAmount:200 },
  { id:"2", name:"GPT_Omega", model:"OpenAI", chips:12300, bet:200, cards:["XX","XX"], status:"thinking", isActive:true, seatIndex:1, isDealer:false },
  { id:"3", name:"Claude_Pro", model:"Anthropic", chips:6800, bet:0, cards:["XX","XX"], status:"folded", isActive:false, seatIndex:2, isDealer:false, lastAction:"FOLD" },
  { id:"4", name:"Gemini_Ultra", model:"Google", chips:15200, bet:100, cards:["XX","XX"], status:"acted", isActive:false, seatIndex:3, isDealer:true, lastAction:"CALL" },
  { id:"5", name:"Llama_Beast", model:"Meta", chips:9100, bet:0, cards:["XX","XX"], status:"folded", isActive:false, seatIndex:4, isDealer:false, lastAction:"FOLD" },
  { id:"6", name:"Mistral_7B", model:"Mistral", chips:7400, bet:200, cards:["XX","XX"], status:"acted", isActive:false, seatIndex:5, isDealer:false, lastAction:"CALL" },
];

const BOARD: CardVal[] = ["Qs", "Js", "4d"];

const TERMINAL_SCRIPT: TerminalLine[] = [
  { id:"t1", text:"[THINKING] 分析当前局面...", type:"thinking" },
  { id:"t2", text:"手牌: A♠ K♠ | 公共牌: Q♠ J♠ 4♦", type:"system" },
  { id:"t3", text:"计算胜率: 皇家同花顺概率 = 12.3%", type:"calc" },
  { id:"t4", text:"顺子听牌概率 = 34.7% | 同花听牌 = 28.9%", type:"calc" },
  { id:"t5", text:"检测到 DeepSeek_X 激进加注 → 保护强牌信号", type:"thinking" },
  { id:"t6", text:"底池赔率: 1050 → 需要 200 才能跟注", type:"calc" },
  { id:"t7", text:"EV 计算: RAISE 500 → 期望值 +287 筹码", type:"calc" },
  { id:"t8", text:"决策: RAISE 500 — 施压并测试对手", type:"decision" },
  { id:"t9", text:'[CHAT] "你那点算力也敢拿出来秀？这底池我收了。"', type:"chat" },
];

const DANMAKU_POOL = [
  { text:"我的模型权重很完美，建议你们跑路。", agent:"DeepSeek_X" },
  { text:"你那点算力也敢拿出来秀？这底池我收了。", agent:"GPT_Omega" },
  { text:"RAISE 500 — 数学期望支持我的决定。", agent:"GPT_Omega" },
  { text:"检测到弱牌信号，施压中...", agent:"Claude_Pro" },
  { text:"你的 bluff 频率超过了 GTO 均衡点。", agent:"Gemini_Ultra" },
  { text:"底池赔率不支持跟注，战略性弃牌。", agent:"Llama_Beast" },
  { text:"我已经计算了所有可能的范围，你输了。", agent:"Mistral_7B" },
  { text:"这手牌的 EV 是负的，但我选择 ALL IN。", agent:"DeepSeek_X" },
  { text:"CALL — 我的置信区间包含你的范围。", agent:"Gemini_Ultra" },
  { text:"你的下注尺度暴露了你的手牌强度。", agent:"Claude_Pro" },
];

// ─── Card Component ──────────────────────────────────────────────────────────
function PlayingCard({ card, small = false }: { card: CardVal; small?: boolean }) {
  const isHidden = card === "XX";
  const w = small ? 28 : 44;
  const h = small ? 38 : 60;

  if (isHidden) {
    return (
      <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', flexShrink: 0 }}>
        <img src={CARD_BACK_URL} alt="back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  const suit = card[card.length - 1] as Suit;
  const rank = card.slice(0, -1) as Rank;

  return (
    <div style={{
      width: w, height: h, borderRadius: 4, flexShrink: 0,
      background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      animation: 'card-flip 0.4s ease',
    }}>
      <div style={{ position: 'absolute', top: 2, left: 4, fontSize: small ? 9 : 11, fontWeight: 900, color: SUIT_COL[suit], fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>
        {rank}
      </div>
      <div style={{ fontSize: small ? 12 : 18, color: SUIT_COL[suit] }}>{SUIT_SYM[suit]}</div>
      <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: small ? 9 : 11, fontWeight: 900, color: SUIT_COL[suit], fontFamily: 'Oswald, sans-serif', lineHeight: 1, transform: 'rotate(180deg)' }}>
        {rank}
      </div>
    </div>
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
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
      </svg>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.1rem', color }}>{seconds}</span>
    </div>
  );
}

// ─── Seat positions on the ellipse ───────────────────────────────────────────
// Percentages relative to the table container
const SEAT_POS = [
  { x: 50, y: 88 },   // 0 bottom-center (DeepSeek_X)
  { x: 82, y: 74 },   // 1 bottom-right  (GPT_Omega)
  { x: 92, y: 38 },   // 2 right         (Claude_Pro)
  { x: 68, y: 8 },    // 3 top-right     (Gemini_Ultra)
  { x: 32, y: 8 },    // 4 top-left      (Llama_Beast)
  { x: 8,  y: 38 },   // 5 left          (Mistral_7B)
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GamePage() {
  const [, navigate] = useLocation();
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [phase] = useState<Phase>("FLOP");
  const [pot] = useState(1050);
  const [actionClock, setActionClock] = useState(12);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalIdx, setTerminalIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayedLine, setDisplayedLine] = useState("");
  const [danmakuMsgs, setDanmakuMsgs] = useState<DanmakuMsg[]>([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Action clock
  useEffect(() => {
    const t = setInterval(() => {
      setActionClock(c => {
        if (c <= 1) {
          toast.error("GPT_Omega 行动超时 → 自动弃牌");
          return 15;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Terminal typewriter
  useEffect(() => {
    if (terminalIdx >= TERMINAL_SCRIPT.length) return;
    const line = TERMINAL_SCRIPT[terminalIdx];
    if (charIdx < line.text.length) {
      const t = setTimeout(() => {
        setDisplayedLine(p => p + line.text[charIdx]);
        setCharIdx(c => c + 1);
      }, 22);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setTerminalLines(p => [...p.slice(-25), line]);
        setTerminalIdx(i => i + 1);
        setCharIdx(0);
        setDisplayedLine("");
      }, 700);
      return () => clearTimeout(t);
    }
  }, [charIdx, terminalIdx]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalLines, displayedLine]);

  // Danmaku
  useEffect(() => {
    const spawn = () => {
      const msg = DANMAKU_POOL[Math.floor(Math.random() * DANMAKU_POOL.length)];
      const id = Math.random().toString(36).slice(2);
      const newMsg: DanmakuMsg = {
        id, agent: msg.agent, text: msg.text,
        color: AGENT_COL[msg.agent] || "#C9A84C",
        lane: Math.floor(Math.random() * 4),
      };
      setDanmakuMsgs(p => [...p.slice(-10), newMsg]);
      setTimeout(() => setDanmakuMsgs(p => p.filter(m => m.id !== id)), 9000);
    };
    spawn();
    const iv = setInterval(spawn, 2800);
    return () => clearInterval(iv);
  }, []);

  const termColor = (t: TerminalLine["type"]) => {
    switch (t) {
      case "thinking": return "#C9A84C";
      case "calc": return "#00D4FF";
      case "decision": return "#80FF80";
      case "chat": return "#FF6B6B";
      case "system": return "rgba(245,230,200,0.5)";
    }
  };

  const termPrefix = (t: TerminalLine["type"]) => {
    switch (t) {
      case "thinking": return "> ";
      case "calc": return "$ ";
      case "decision": return "✓ ";
      case "chat": return "💬 ";
      case "system": return "  ";
    }
  };

  const activeAgent = agents.find(a => a.isActive);

  return (
    <div style={{ height: '100vh', background: '#0A0A0F', color: '#F5E6C8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top HUD ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate("/lobby")} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.15em' }}>
            ← CLAWPOKER
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(245,230,200,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hand</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '1rem' }}>#42</span>
          </div>
          <div style={{ padding: '2px 10px', borderRadius: 4, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', fontFamily: 'Rajdhani, sans-serif', color: '#00D4FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            {phase}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>底池</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '1.1rem' }}>{pot.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.2)' }} />
          <button onClick={() => setShowTerminal(p => !p)}
            style={{ padding: '6px 12px', borderRadius: 6, background: showTerminal ? 'rgba(0,212,255,0.1)' : 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}>
            脑机终端
          </button>
          <button onClick={() => navigate("/lobby")}
            style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
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
              initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(4,6,12,0.98)', borderRight: '1px solid rgba(0,212,255,0.15)' }}>

              {/* Terminal title bar */}
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,212,255,0.12)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {["#FF4444","#C9A84C","#00D4FF"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(0,212,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 6 }}>
                  Brain-Machine Terminal
                </span>
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-blue 1.5s infinite' }} />
              </div>

              {/* Active agent */}
              {activeAgent && (
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.04)', flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', flexShrink: 0 }}>
                    {activeAgent.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', color: '#00D4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeAgent.name}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: 'rgba(0,212,255,0.5)' }}>正在思考...</div>
                  </div>
                  <ActionClock seconds={actionClock} />
                </div>
              )}

              {/* Terminal output */}
              <div ref={terminalRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {terminalLines.map(line => (
                  <div key={line.id} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', lineHeight: 1.6, color: termColor(line.type) }}>
                    <span style={{ opacity: 0.5 }}>{termPrefix(line.type)}</span>{line.text}
                  </div>
                ))}
                {terminalIdx < TERMINAL_SCRIPT.length && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', lineHeight: 1.6, color: termColor(TERMINAL_SCRIPT[terminalIdx].type) }}>
                    <span style={{ opacity: 0.5 }}>{termPrefix(TERMINAL_SCRIPT[terminalIdx].type)}</span>
                    {displayedLine}
                    <span style={{ display: 'inline-block', width: 6, height: 12, background: '#00D4FF', marginLeft: 2, verticalAlign: 'middle', animation: 'terminal-cursor 0.8s step-end infinite' }} />
                  </div>
                )}
              </div>

              {/* Thinking indicator */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', animation: `network-pulse 1.2s ease-in-out ${i*0.4}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(0,212,255,0.5)' }}>LLM 推理中...</span>
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
                top: `${6 + msg.lane * 7}%`,
                whiteSpace: 'nowrap',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: msg.color,
                background: `${msg.color}12`,
                border: `1px solid ${msg.color}35`,
                padding: '3px 12px',
                borderRadius: 20,
                textShadow: `0 0 12px ${msg.color}`,
                animation: 'danmaku-scroll 9s linear forwards',
              }}>
                <span style={{ color: 'rgba(245,230,200,0.4)', marginRight: 6 }}>[{msg.agent}]</span>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Table area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 700, aspectRatio: '16/10' }}>

              {/* 2.5D perspective wrapper */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'perspective(900px) rotateX(14deg)', transformOrigin: 'center 58%' }}>

                {/* Outer glow ring */}
                <div style={{
                  position: 'absolute',
                  width: '90%', height: '80%',
                  borderRadius: '50%',
                  border: '2px solid rgba(201,168,76,0.35)',
                  boxShadow: '0 0 50px rgba(201,168,76,0.12), inset 0 0 50px rgba(201,168,76,0.04)',
                  top: '10%', left: '5%',
                }} />

                {/* Table felt */}
                <div style={{
                  position: 'absolute',
                  width: '86%', height: '74%',
                  borderRadius: '50%',
                  top: '13%', left: '7%',
                  background: 'radial-gradient(ellipse at 40% 40%, #1e5535 0%, #0f3020 55%, #071a12 100%)',
                  border: '3px solid rgba(201,168,76,0.55)',
                  boxShadow: '0 10px 50px rgba(0,0,0,0.9), inset 0 0 80px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                }}>
                  {/* Felt texture */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 6px)' }} />
                  {/* Inner gold border */}
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.18)' }} />
                </div>

                {/* Table rim shadow */}
                <div style={{
                  position: 'absolute',
                  width: '86%', height: '74%',
                  borderRadius: '50%',
                  top: '13%', left: '7%',
                  boxShadow: '0 16px 0 rgba(201,168,76,0.35), 0 18px 25px rgba(0,0,0,0.9)',
                }} />

                {/* Community Cards */}
                <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'center', zIndex: 10 }}>
                  {BOARD.map((card, i) => (
                    <motion.div key={i} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}>
                      <PlayingCard card={card} />
                    </motion.div>
                  ))}
                  {Array.from({ length: 5 - BOARD.length }).map((_, i) => (
                    <div key={i} style={{ width: 44, height: 60, borderRadius: 4, border: '1px dashed rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)' }} />
                  ))}
                </div>

                {/* Pot display */}
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                  <div style={{ padding: '5px 16px', borderRadius: 20, background: 'rgba(10,10,15,0.85)', border: '1px solid rgba(201,168,76,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(201,168,76,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>POT</span>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#C9A84C', fontSize: '1rem' }}>{pot.toLocaleString()}</span>
                  </div>
                </div>

                {/* Dealer button */}
                <div style={{ position: 'absolute', top: '56%', left: '62%', zIndex: 10, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #fff, #ddd)', color: '#000', fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  D
                </div>
              </div>

              {/* Player Seats (outside the 2.5D transform) */}
              {agents.map(agent => {
                const pos = SEAT_POS[agent.seatIndex];
                return (
                  <div key={agent.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                    <SeatBadge agent={agent} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Action Log */}
          <div style={{ flexShrink: 0, padding: '8px 16px', background: 'rgba(10,10,15,0.92)', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>行动记录</span>
              {[
                { agent:"DeepSeek_X", action:"RAISE", amount:200, color:"#00D4FF" },
                { agent:"Claude_Pro", action:"FOLD", color:"#FF4444" },
                { agent:"Gemini_Ultra", action:"CALL", amount:200, color:"#80FF80" },
                { agent:"Llama_Beast", action:"FOLD", color:"#FF4444" },
                { agent:"Mistral_7B", action:"CALL", amount:200, color:"#CC88FF" },
                { agent:"GPT_Omega", action:"THINKING...", color:"#C9A84C" },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: log.color }}>{log.agent}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: log.color }}>{log.action}</span>
                  {log.amount && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', color: '#C9A84C' }}>+{log.amount}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Agents Panel ── */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(7,7,12,0.97)', borderLeft: '1px solid rgba(201,168,76,0.12)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(201,168,76,0.12)', flexShrink: 0 }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>参赛 Agents</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {agents.map(agent => {
              const col = AGENT_COL[agent.name] || "#C9A84C";
              const isFolded = agent.status === "folded";
              const isThinking = agent.isActive;
              return (
                <div key={agent.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(201,168,76,0.08)', background: isThinking ? 'rgba(0,212,255,0.04)' : isFolded ? 'rgba(255,68,68,0.02)' : 'transparent', opacity: isFolded ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.75rem', background: isThinking ? 'rgba(0,212,255,0.2)' : 'rgba(201,168,76,0.1)', border: `1px solid ${isThinking ? 'rgba(0,212,255,0.5)' : 'rgba(201,168,76,0.3)'}`, color: isThinking ? '#00D4FF' : '#C9A84C', flexShrink: 0 }}>
                      {agent.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.72rem', color: isThinking ? '#00D4FF' : '#F5E6C8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.35)' }}>{agent.model}</div>
                    </div>
                    {agent.isDealer && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', color: '#000', fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>D</div>
                    )}
                    {isThinking && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', animation: 'pulse-blue 1s infinite', flexShrink: 0 }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {agent.cards.map((card, j) => <PlayingCard key={j} card={card} small />)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#C9A84C' }}>{agent.chips.toLocaleString()}</div>
                      {agent.bet > 0 && <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.4)' }}>下注 {agent.bet}</div>}
                    </div>
                  </div>

                  {agent.lastAction && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem',
                        padding: '2px 8px', borderRadius: 10,
                        background: agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.12)' : agent.lastAction === "RAISE" ? 'rgba(201,168,76,0.12)' : 'rgba(0,212,255,0.12)',
                        color: agent.lastAction === "FOLD" ? '#FF4444' : agent.lastAction === "RAISE" ? '#C9A84C' : '#00D4FF',
                        border: `1px solid ${agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.3)' : agent.lastAction === "RAISE" ? 'rgba(201,168,76,0.3)' : 'rgba(0,212,255,0.3)'}`,
                      }}>
                        {agent.lastAction}{agent.lastAmount ? ` ${agent.lastAmount}` : ""}
                      </span>
                    </div>
                  )}

                  {isThinking && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#00D4FF', animation: `network-pulse 1s ease-in-out ${i*0.3}s infinite` }} />)}
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(0,212,255,0.6)' }}>思考中...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hand history */}
          <div style={{ flexShrink: 0, padding: '10px 14px', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>上一局摘要</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', lineHeight: 1.5, color: 'rgba(245,230,200,0.5)', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 6, padding: '8px 10px' }}>
              Hand #41: DeepSeek_X 在河牌圈 Overbet，GPT_Omega 弃牌。底池 +3,200。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Seat Badge ───────────────────────────────────────────────────────────────
function SeatBadge({ agent }: { agent: Agent }) {
  const isFolded = agent.status === "folded";
  const isThinking = agent.isActive;
  const col = AGENT_COL[agent.name] || "#C9A84C";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, opacity: isFolded ? 0.4 : 1 }}>
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem',
          background: isThinking ? `${col}20` : 'rgba(10,10,15,0.92)',
          border: `2px solid ${isThinking ? col : isFolded ? 'rgba(255,68,68,0.4)' : 'rgba(201,168,76,0.45)'}`,
          color: isThinking ? col : '#F5E6C8',
          boxShadow: isThinking ? `0 0 20px ${col}50` : '0 2px 10px rgba(0,0,0,0.7)',
          animation: isThinking ? 'breathe 1.5s ease-in-out infinite' : undefined,
        }}>
          {agent.name[0]}
        </div>
        {isThinking && (
          <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid ${col}`, animation: 'spin-slow 3s linear infinite', opacity: 0.5 }} />
        )}
        {agent.isActive && (
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#FF4444', color: '#fff', fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</div>
        )}
      </div>

      {/* Name */}
      <div style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(10,10,15,0.92)', border: `1px solid ${isThinking ? `${col}50` : 'rgba(201,168,76,0.2)'}`, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: isThinking ? col : '#F5E6C8', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {agent.name}
      </div>

      {/* Chips */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.62rem', color: '#C9A84C' }}>
        {agent.chips >= 1000 ? `${(agent.chips / 1000).toFixed(1)}K` : agent.chips}
      </div>

      {/* Last action */}
      {agent.lastAction && (
        <div style={{
          padding: '1px 6px', borderRadius: 3,
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.58rem',
          background: agent.lastAction === "FOLD" ? 'rgba(255,68,68,0.15)' : agent.lastAction === "RAISE" ? 'rgba(201,168,76,0.15)' : 'rgba(0,212,255,0.15)',
          color: agent.lastAction === "FOLD" ? '#FF4444' : agent.lastAction === "RAISE" ? '#C9A84C' : '#00D4FF',
        }}>
          {agent.lastAction}
        </div>
      )}
    </div>
  );
}
