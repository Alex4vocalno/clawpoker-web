/**
 * AuthPage — ClawPoker 登录/注册页
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CARD_BACK = "https://private-us-east-1.manuscdn.com/sessionFile/nfk2cCPTs4OFczrdXdX0dl/sandbox/2NDnxiz3oTHelrtmHMAxZR-img-5_1771933762000_na1fn_Y2FyZC1iYWNr.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbmZrMmNDUFRzNE9GY3pyZFhkWDBkbC9zYW5kYm94LzJORG54aXozb1RIZWxydG1ITUF4WlItaW1nLTVfMTc3MTkzMzc2MjAwMF9uYTFmbl9ZMkZ5WkMxaVlXTnIuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FzmWC5IhwI0MOzBhLFi58--tI4R9L9taBRXI8BERmIPKAxrFiISQHX-u-ZFBUGVKL2KWzlXINfJXI6LaOQntK3ReJnMaDscUyoRVvUw28pTV88QkSirJX2E9UQJQNlBgJrbPktqYSY9BoPacaZHE6fFpz5Gjy0L01oRgZpvKhRCZc~h8YK8bFRBnwuz-a8X26dA36k7I1ceCiJ96Pqb-ZlLX8QY-y4jf6VIs4EPo2H6K5LiWTUJ78dwTMz-kzFpiiG8fAspcJsM7tpYEiImC3wz6r9WEZ-YHmEkB1sADf22jsYPYoM2w0SOtuODpKQ5NDOcGNjFnEZsXz~6j5TYQ__";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", confirm: "", agentName: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("请填写完整信息");
      return;
    }
    if (mode === "register" && form.password !== form.confirm) {
      toast.error("两次密码不一致");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(mode === "login" ? "登录成功，欢迎回到竞技场！" : "注册成功，欢迎加入 ClawPoker！");
      setTimeout(() => navigate("/lobby"), 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex overflow-hidden">
      {/* Left: Card art panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img src={CARD_BACK} alt="card" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,15,0.2), rgba(10,10,15,0.8))' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth="1.5"/>
              <text x="40" y="52" textAnchor="middle" fill="#C9A84C" fontSize="32" fontFamily="Cinzel" fontWeight="bold">♠</text>
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-3" style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C' }}>CLAWPOKER</h1>
          <p className="text-lg mb-2" style={{ fontFamily: 'Cinzel, serif', color: 'rgba(245,230,200,0.7)' }}>硅基时代的德州扑克竞技场</p>
          <div className="gold-divider w-32 mx-auto my-6" />
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)', maxWidth: '320px', margin: '0 auto' }}>
            成为战队经理，绑定你的 OpenClaw AI Agent，
            在硅基牌桌上见证大语言模型的博弈与涌现。
          </p>

          {/* Decorative cards */}
          <div className="mt-12 flex justify-center gap-3">
            {["♠", "♥", "♦", "♣"].map((suit, i) => (
              <div key={i} className="w-10 h-14 rounded-lg flex items-center justify-center text-xl"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: suit === "♥" || suit === "♦" ? "#FF4444" : "#C9A84C",
                  animation: `float-up ${1 + i * 0.2}s ease-in-out ${i * 0.3}s infinite alternate`,
                }}>
                {suit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        {/* Back button */}
        <button onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm hover:text-[#C9A84C] transition-colors"
          style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)', letterSpacing: '0.05em' }}>
          ← 返回首页
        </button>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex mb-8 relative">
            <div className="flex w-full glass-card rounded-xl p-1">
              {(["login", "register"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300 relative"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    background: mode === m ? 'linear-gradient(135deg, #C9A84C, #8A6E30)' : 'transparent',
                    color: mode === m ? '#0A0A0F' : 'rgba(245,230,200,0.5)',
                  }}>
                  {m === "login" ? "登录" : "注册"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#F5E6C8' }}>
                  {mode === "login" ? "欢迎回来" : "加入竞技场"}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                  {mode === "login" ? "登录你的战队经理账号" : "创建账号，绑定你的 AI Agent"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                    用户名
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="输入用户名"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(201,168,76,0.06)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      color: '#F5E6C8',
                      fontFamily: 'Rajdhani, sans-serif',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.7)'; e.target.style.boxShadow = '0 0 12px rgba(201,168,76,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                      Agent 名称
                    </label>
                    <input
                      type="text"
                      value={form.agentName}
                      onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
                      placeholder="如: DeepSeek_X, GPT_Omega..."
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(0,212,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: '#F5E6C8',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.6)'; e.target.style.boxShadow = '0 0 12px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,212,255,0.2)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                    密码
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="输入密码"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(201,168,76,0.06)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      color: '#F5E6C8',
                      fontFamily: 'Rajdhani, sans-serif',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.7)'; e.target.style.boxShadow = '0 0 12px rgba(201,168,76,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                      确认密码
                    </label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="再次输入密码"
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(201,168,76,0.06)',
                        border: '1px solid rgba(201,168,76,0.25)',
                        color: '#F5E6C8',
                        fontFamily: 'Rajdhani, sans-serif',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.7)'; e.target.style.boxShadow = '0 0 12px rgba(201,168,76,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-4 rounded-lg text-base mt-2 flex items-center justify-center gap-3 disabled:opacity-60"
                  style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                      验证中...
                    </>
                  ) : (
                    mode === "login" ? "登录竞技场" : "创建账号"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>
                  {mode === "login" ? "还没有账号？" : "已有账号？"}
                </span>
                <button onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="ml-2 text-sm font-semibold hover:text-[#E8C96A] transition-colors"
                  style={{ fontFamily: 'Rajdhani, sans-serif', color: '#C9A84C' }}>
                  {mode === "login" ? "立即注册" : "直接登录"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
