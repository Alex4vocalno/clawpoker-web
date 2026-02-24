/**
 * RechargePage — ClawPoker 游戏币充值中心
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 * 产品逻辑：用户充值游戏币 → AI Agent 参赛消耗游戏币 → 赢取更多游戏币
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── 套餐数据 ─────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "starter",
    name: "入门包",
    coins: 10000,
    price: 6,
    bonus: 0,
    tag: null,
    desc: "适合初次体验，够 Agent 参加约 5 场低额桌",
    color: "#C9A84C",
    glow: "rgba(201,168,76,0.18)",
  },
  {
    id: "standard",
    name: "标准包",
    coins: 50000,
    price: 25,
    bonus: 5000,
    tag: "热门",
    desc: "最受欢迎，赠送 5,000 游戏币，参加约 25 场中额桌",
    color: "#00D4FF",
    glow: "rgba(0,212,255,0.18)",
  },
  {
    id: "pro",
    name: "进阶包",
    coins: 120000,
    price: 50,
    bonus: 20000,
    tag: "超值",
    desc: "赠送 20,000 游戏币，可参加高额桌及锦标赛",
    color: "#80FF80",
    glow: "rgba(128,255,128,0.18)",
  },
  {
    id: "elite",
    name: "精英包",
    coins: 300000,
    price: 100,
    bonus: 80000,
    tag: "最佳",
    desc: "赠送 80,000 游戏币，专为顶级锦标赛设计",
    color: "#FF8C00",
    glow: "rgba(255,140,0,0.18)",
  },
  {
    id: "champion",
    name: "冠军包",
    coins: 800000,
    price: 250,
    bonus: 300000,
    tag: "VIP",
    desc: "赠送 30 万游戏币，解锁 VIP 专属牌桌与 AI 模型",
    color: "#FF4444",
    glow: "rgba(255,68,68,0.18)",
  },
  {
    id: "legend",
    name: "传奇包",
    coins: 2000000,
    price: 500,
    bonus: 1000000,
    tag: "传奇",
    desc: "赠送 100 万游戏币，专属传奇徽章 + 优先 API 通道",
    color: "#C9A84C",
    glow: "rgba(201,168,76,0.22)",
    special: true,
  },
];

// ─── 消耗说明数据 ─────────────────────────────────────────────────────────────
const COST_RULES = [
  { table: "低额桌", stakes: "100/200", cost: "每手 ~200", color: "#C9A84C" },
  { table: "中额桌", stakes: "500/1,000", cost: "每手 ~1,000", color: "#00D4FF" },
  { table: "高额桌", stakes: "2,000/4,000", cost: "每手 ~4,000", color: "#80FF80" },
  { table: "锦标赛", stakes: "5,000/10,000", cost: "买入 10,000+", color: "#FF8C00" },
];

// ─── 充值记录（模拟） ─────────────────────────────────────────────────────────
const HISTORY = [
  { id: "TXN-8821", time: "2026-02-24 11:42", pkg: "进阶包", coins: 140000, price: 50, status: "成功" },
  { id: "TXN-7734", time: "2026-02-23 18:05", pkg: "标准包", coins: 55000, price: 25, status: "成功" },
  { id: "TXN-6619", time: "2026-02-21 09:30", pkg: "入门包", coins: 10000, price: 6, status: "成功" },
];

// ─── 支付方式 ─────────────────────────────────────────────────────────────────
const PAY_METHODS = [
  { id: "alipay", name: "支付宝", icon: "💳" },
  { id: "wechat", name: "微信支付", icon: "💚" },
  { id: "card", name: "银行卡", icon: "🏦" },
  { id: "usdt", name: "USDT", icon: "₮" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RechargePage() {
  const [, navigate] = useLocation();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState("alipay");
  const [payStep, setPayStep] = useState<"select" | "confirm" | "processing" | "success">("select");
  const [activeTab, setActiveTab] = useState<"recharge" | "history" | "rules">("recharge");
  const [balance] = useState(125000);

  const pkg = PACKAGES.find(p => p.id === selectedPkg);

  const handleBuy = (pkgId: string) => {
    setSelectedPkg(pkgId);
    setPayStep("select");
    setShowPayModal(true);
  };

  const handleConfirmPay = () => {
    setPayStep("processing");
    setTimeout(() => {
      setPayStep("success");
    }, 2200);
  };

  const handleSuccessClose = () => {
    setShowPayModal(false);
    setPayStep("select");
    toast.success(`充值成功！${pkg ? (pkg.coins + pkg.bonus).toLocaleString() : 0} 游戏币已到账`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F5E6C8', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate("/lobby")} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
              <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1.5"/>
              <text x="16" y="21" textAnchor="middle" fill="#C9A84C" fontSize="14" fontFamily="Cinzel" fontWeight="bold">♠</text>
            </svg>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: '#C9A84C', letterSpacing: '0.12em' }}>CLAWPOKER</span>
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.2)' }} />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', color: 'rgba(245,230,200,0.5)', letterSpacing: '0.06em' }}>游戏币充值中心</span>
        </div>

        {/* Balance display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <span style={{ fontSize: '1.1rem' }}>🪙</span>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#C9A84C' }}>{balance.toLocaleString()}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.6rem', color: 'rgba(201,168,76,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: -2 }}>当前余额</div>
            </div>
          </div>
          <button onClick={() => navigate("/lobby")} style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(245,230,200,0.15)', color: 'rgba(245,230,200,0.45)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', cursor: 'pointer' }}>
            ← 返回大厅
          </button>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div style={{ padding: '36px 24px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', marginBottom: 14 }}>
            <span style={{ fontSize: '0.75rem' }}>🪙</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>游戏币 · AI 竞技燃料</span>
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F5E6C8', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            充值游戏币
          </h1>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', color: 'rgba(245,230,200,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            游戏币是 AI Agent 参赛的燃料。每手牌消耗少量游戏币，赢得底池即可回收。
            充值越多，Agent 可参与的牌桌等级越高。
          </p>
        </motion.div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { label: "当前余额", value: balance.toLocaleString(), unit: "游戏币", color: "#C9A84C" },
            { label: "本月消耗", value: "38,400", unit: "游戏币", color: "#00D4FF" },
            { label: "累计充值", value: "205,000", unit: "游戏币", color: "#80FF80" },
            { label: "累计盈利", value: "+12,600", unit: "游戏币", color: "#FF8C00" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
              style={{ textAlign: 'center', padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label} · {s.unit}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 20px' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
          {([
            { key: "recharge", label: "充值套餐" },
            { key: "history", label: "充值记录" },
            { key: "rules", label: "消耗说明" },
          ] as { key: typeof activeTab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '8px 22px', borderRadius: 7, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', cursor: 'pointer', border: 'none', transition: 'all 0.18s', background: activeTab === t.key ? 'linear-gradient(135deg, #C9A84C, #8A6E30)' : 'transparent', color: activeTab === t.key ? '#0A0A0F' : 'rgba(245,230,200,0.5)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">

          {/* ── Recharge Packages ── */}
          {activeTab === "recharge" && (
            <motion.div key="recharge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                {PACKAGES.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={() => handleBuy(p.id)}
                    style={{
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      background: p.special ? `linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${p.glow.replace('0.18', '0.35').replace('0.22', '0.45')}`,
                      boxShadow: `0 4px 24px ${p.glow}`,
                      transition: 'all 0.22s',
                      position: 'relative',
                    }}
                    whileHover={{ scale: 1.025, boxShadow: `0 8px 40px ${p.glow.replace('0.18', '0.35')}` }}>

                    {/* Tag */}
                    {p.tag && (
                      <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 20, background: p.color, color: p.id === "starter" || p.id === "legend" ? '#0A0A0F' : '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                        {p.tag}
                      </div>
                    )}

                    {/* Header */}
                    <div style={{ padding: '20px 22px 14px', borderBottom: `1px solid ${p.glow.replace('0.18', '0.12')}` }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.05rem', color: p.color, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#F5E6C8' }}>{p.coins.toLocaleString()}</span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(245,230,200,0.4)' }}>游戏币</span>
                        {p.bonus > 0 && (
                          <span style={{ marginLeft: 4, padding: '2px 8px', borderRadius: 12, background: `${p.color}18`, border: `1px solid ${p.color}40`, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: p.color }}>
                            +{p.bonus.toLocaleString()} 赠送
                          </span>
                        )}
                      </div>
                      {p.bonus > 0 && (
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(245,230,200,0.35)', marginTop: 2 }}>
                          实得 {(p.coins + p.bonus).toLocaleString()} 游戏币
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '14px 22px 20px' }}>
                      <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.82rem', color: 'rgba(245,230,200,0.5)', lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>

                      {/* Value bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`, width: `${Math.min(100, (p.bonus / p.coins) * 200 + 30)}%` }} />
                        </div>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: 'rgba(245,230,200,0.3)', flexShrink: 0 }}>
                          {p.bonus > 0 ? `赠送 ${Math.round(p.bonus / p.coins * 100)}%` : '基础套餐'}
                        </span>
                      </div>

                      <button style={{ width: '100%', padding: '11px', borderRadius: 8, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.08em', cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${p.color}, ${p.color}88)`, color: '#0A0A0F', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        ¥{p.price} 立即充值
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Notice */}
              <div style={{ marginTop: 28, padding: '14px 20px', borderRadius: 10, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(245,230,200,0.45)', lineHeight: 1.7, margin: 0 }}>
                  游戏币仅用于平台内 AI Agent 参赛消耗，不可提现，不可转让。充值完成后即时到账。
                  AI Agent 每次参赛将从您的余额中扣除对应盲注金额作为买入费用；赢得底池的游戏币将实时返还至您的账户。
                  如有疑问请联系客服。
                </p>
              </div>
            </motion.div>
          )}

          {/* ── History ── */}
          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.04)' }}>
                  {["交易编号", "时间", "套餐", "到账游戏币", "状态"].map(h => (
                    <div key={h} style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: 'rgba(201,168,76,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>
                {HISTORY.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: i < HISTORY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#00D4FF' }}>{r.id}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.78rem', color: 'rgba(245,230,200,0.45)' }}>{r.time}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#F5E6C8' }}>{r.pkg}</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#C9A84C' }}>+{r.coins.toLocaleString()}</div>
                    <div>
                      <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(128,255,128,0.1)', border: '1px solid rgba(128,255,128,0.25)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#80FF80' }}>{r.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.78rem', color: 'rgba(245,230,200,0.25)' }}>仅显示最近 90 天记录</p>
            </motion.div>
          )}

          {/* ── Rules ── */}
          {activeTab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
                {COST_RULES.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ padding: '20px', borderRadius: 12, background: `${r.color}08`, border: `1px solid ${r.color}25` }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: r.color, marginBottom: 8 }}>{r.table}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(245,230,200,0.5)', marginBottom: 6 }}>盲注：{r.stakes}</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F5E6C8' }}>{r.cost}</div>
                  </motion.div>
                ))}
              </div>

              <div style={{ borderRadius: 14, padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: '#C9A84C', marginBottom: 16 }}>游戏币消耗机制</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: "🤖", title: "Agent 买入", desc: "您的 AI Agent 每次入场参赛，系统自动从您的游戏币余额中扣除对应牌桌的买入金额（通常为大盲注的 100 倍）。" },
                    { icon: "♠️", title: "每手消耗", desc: "每手牌 Agent 参与下注时，消耗的游戏币即为实际下注额。弃牌则仅损失已下注部分，赢得底池则全额返还。" },
                    { icon: "🏆", title: "赢取奖励", desc: "Agent 赢得底池后，奖池中的游戏币将实时返还至您的账户余额。锦标赛冠军可获得额外游戏币奖励。" },
                    { icon: "📊", title: "余额不足", desc: "当余额不足以支付买入费用时，Agent 将无法参赛。建议保持足够余额以确保 Agent 持续参赛。" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#F5E6C8', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(245,230,200,0.45)', lineHeight: 1.65 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {showPayModal && pkg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget && payStep !== "processing") { setShowPayModal(false); setPayStep("select"); } }}>

            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '100%', maxWidth: 460, borderRadius: 16, background: '#0F0F18', border: `1px solid ${pkg.glow.replace('0.18', '0.4')}`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${pkg.glow}`, overflow: 'hidden' }}>

              {/* Modal Header */}
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${pkg.glow.replace('0.18', '0.06')}` }}>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: pkg.color }}>
                    {payStep === "success" ? "✅ 充值成功" : payStep === "processing" ? "⏳ 处理中..." : `充值 · ${pkg.name}`}
                  </div>
                  {payStep === "select" && (
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: 'rgba(245,230,200,0.35)', marginTop: 2 }}>
                      选择支付方式完成充值
                    </div>
                  )}
                </div>
                {payStep !== "processing" && (
                  <button onClick={() => { setShowPayModal(false); setPayStep("select"); }}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(245,230,200,0.5)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div style={{ padding: '22px' }}>

                {/* Success state */}
                {payStep === "success" && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>🎉</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#C9A84C', marginBottom: 6 }}>
                      +{(pkg.coins + pkg.bonus).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', color: 'rgba(245,230,200,0.5)', marginBottom: 22 }}>
                      游戏币已到账，Agent 可立即参赛！
                    </div>
                    <button onClick={handleSuccessClose} style={{ padding: '11px 32px', borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #8A6E30)', border: 'none', color: '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                      返回大厅参赛
                    </button>
                  </motion.div>
                )}

                {/* Processing state */}
                {payStep === "processing" && (
                  <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${pkg.color}`, borderTopColor: 'transparent', margin: '0 auto 18px', animation: 'spin-slow 0.8s linear infinite' }} />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'rgba(245,230,200,0.55)' }}>正在处理支付...</div>
                  </div>
                )}

                {/* Select / Confirm state */}
                {(payStep === "select" || payStep === "confirm") && (
                  <>
                    {/* Order summary */}
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(245,230,200,0.4)' }}>套餐</span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#F5E6C8' }}>{pkg.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(245,230,200,0.4)' }}>游戏币</span>
                        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#C9A84C' }}>{pkg.coins.toLocaleString()}{pkg.bonus > 0 ? ` + ${pkg.bonus.toLocaleString()} 赠` : ""}</span>
                      </div>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(245,230,200,0.6)' }}>应付金额</span>
                        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: pkg.color }}>¥{pkg.price}</span>
                      </div>
                    </div>

                    {/* Payment methods */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: 'rgba(245,230,200,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>选择支付方式</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {PAY_METHODS.map(m => (
                          <button key={m.id} onClick={() => setPayMethod(m.id)}
                            style={{ padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: `1px solid ${payMethod === m.id ? `${pkg.color}60` : 'rgba(255,255,255,0.08)'}`, background: payMethod === m.id ? `${pkg.glow.replace('0.18', '0.1')}` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                            <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: payMethod === m.id ? pkg.color : 'rgba(245,230,200,0.55)' }}>{m.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleConfirmPay}
                      style={{ width: '100%', padding: '13px', borderRadius: 10, background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}88)`, border: 'none', color: '#0A0A0F', fontFamily: 'Rajdhani, sans-serif', fontWeight: 900, fontSize: '1rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                      确认支付 ¥{pkg.price}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.68rem', color: 'rgba(245,230,200,0.2)' }}>
                      支付即表示同意《游戏币充值协议》· 游戏币不可提现
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
