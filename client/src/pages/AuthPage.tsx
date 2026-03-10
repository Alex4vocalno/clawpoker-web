/**
 * AuthPage — ClawPoker 登录/注册页
 * Design: 暗金电竞神殿 | Dark Luxury E-sports × Temple Aesthetics
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { login, register, sendVerifyCode, resetPassword, createAgent, setToken, googleLogin } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";

const CARD_BACK = "https://private-us-east-1.manuscdn.com/sessionFile/nfk2cCPTs4OFczrdXdX0dl/sandbox/2NDnxiz3oTHelrtmHMAxZR-img-5_1771933762000_na1fn_Y2FyZC1iYWNr.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbmZrMmNDUFRzNE9GY3pyZFhkWDBkbC9zYW5kYm94LzJORG54aXozb1RIZWxydG1ITUF4WlItaW1nLTVfMTc3MTkzMzc2MjAwMF9uYTFmbl9ZMkZ5WkMxaVlXTnIuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FzmWC5IhwI0MOzBhLFi58--tI4R9L9taBRXI8BERmIPKAxrFiISQHX-u-ZFBUGVKL2KWzlXINfJXI6LaOQntK3ReJnMaDscUyoRVvUw28pTV88QkSirJX2E9UQJQNlBgJrbPktqYSY9BoPacaZHE6fFpz5Gjy0L01oRgZpvKhRCZc~h8YK8bFRBnwuz-a8X26dA36k7I1ceCiJ96Pqb-ZlLX8QY-y4jf6VIs4EPo2H6K5LiWTUJ78dwTMz-kzFpiiG8fAspcJsM7tpYEiImC3wz6r9WEZ-YHmEkB1sADf22jsYPYoM2w0SOtuODpKQ5NDOcGNjFnEZsXz~6j5TYQ__";

const inputStyle = {
  background: 'rgba(201,168,76,0.06)',
  border: '1px solid rgba(201,168,76,0.25)',
  color: '#F5E6C8',
  fontFamily: 'Rajdhani, sans-serif',
};

function InputField({ label, type = "text", value, onChange, placeholder, style: extraStyle }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder: string; style?: React.CSSProperties;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
        style={{ ...inputStyle, ...extraStyle }}
        onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.7)'; e.target.style.boxShadow = '0 0 12px rgba(201,168,76,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", code: "", username: "", password: "", confirm: "", agentName: "" });
  const [countdown, setCountdown] = useState(0);
  const googleHandlerRef = useRef<(resp: { credential: string }) => void>();
  googleHandlerRef.current = async (response: { credential: string }) => {
    setLoading(true);
    try {
      const res = await googleLogin({ credential: response.credential });
      setToken(res.token);
      toast.success(res.isNewUser ? "Google 账号注册成功，欢迎！" : "Google 登录成功！");
      setTimeout(() => navigate("/lobby"), 600);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google 登录失败");
    } finally {
      setLoading(false);
    }
  };

  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp) => googleHandlerRef.current?.(resp),
      });
      setGoogleReady(true);
    };
    if (window.google) { initGoogle(); return; }
    const timer = setInterval(() => { if (window.google) { clearInterval(timer); initGoogle(); } }, 200);
    return () => clearInterval(timer);
  }, []);

  const googleBtnRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !GOOGLE_CLIENT_ID || !window.google) return;
    try {
      window.google.accounts.id.renderButton(node, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        width: 380,
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
      });
    } catch { /* GSI not loaded yet */ }
  }, [googleReady]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    try {
      const purpose = mode === "reset" ? "reset_password" : "register";
      await sendVerifyCode({ email: form.email, purpose });
      setCountdown(60);
      toast.success("验证码已发送，请查收邮箱");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发送失败");
    }
  }, [form.email, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        if (!form.username || !form.password) { toast.error("请填写完整信息"); return; }
        const res = await login({ username: form.username, password: form.password });
        setToken(res.token);
        toast.success("登录成功，欢迎回到竞技场！");
        setTimeout(() => navigate("/lobby"), 600);
      } else if (mode === "register") {
        if (!form.email || !form.code || !form.username || !form.password) { toast.error("请填写完整信息"); return; }
        if (form.password !== form.confirm) { toast.error("两次密码不一致"); return; }
        const res = await register({
          email: form.email, code: form.code, username: form.username,
          password: form.password, displayName: form.username
        });
        setToken(res.token);
        if (form.agentName?.trim()) {
          try { await createAgent({ name: form.agentName.trim() }); } catch { /* ignore */ }
        }
        toast.success("注册成功，欢迎加入 ClawPoker！");
        setTimeout(() => navigate("/lobby"), 600);
      } else if (mode === "reset") {
        if (!form.email || !form.code || !form.password) { toast.error("请填写完整信息"); return; }
        if (form.password !== form.confirm) { toast.error("两次密码不一致"); return; }
        await resetPassword({ email: form.email, code: form.code, newPassword: form.password });
        toast.success("密码已重置，请用新密码登录");
        setMode("login");
        setForm(f => ({ ...f, code: "", password: "", confirm: "" }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<string, { h: string; p: string }> = {
    login: { h: "欢迎回来", p: "登录你的战队经理账号（邮箱或用户名）" },
    register: { h: "加入竞技场", p: "使用邮箱注册，绑定你的 AI Agent" },
    reset: { h: "重置密码", p: "通过邮箱验证码重置你的密码" },
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
        <button onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm hover:text-[#C9A84C] transition-colors"
          style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)', letterSpacing: '0.05em' }}>
          ← 返回首页
        </button>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex mb-8 relative">
            <div className="flex w-full glass-card rounded-xl p-1">
              {(["login", "register", "reset"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300 relative"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    background: mode === m ? 'linear-gradient(135deg, #C9A84C, #8A6E30)' : 'transparent',
                    color: mode === m ? '#0A0A0F' : 'rgba(245,230,200,0.5)',
                  }}>
                  {m === "login" ? "登录" : m === "register" ? "注册" : "找回密码"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#F5E6C8' }}>
                  {titles[mode].h}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                  {titles[mode].p}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Login ── */}
                {mode === "login" && (
                  <>
                    <InputField label="邮箱 / 用户名" value={form.username}
                      onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="输入邮箱或用户名" />
                    <InputField label="密码" type="password" value={form.password}
                      onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="输入密码" />
                  </>
                )}

                {/* ── Register ── */}
                {mode === "register" && (
                  <>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                        邮箱
                      </label>
                      <div className="flex gap-2">
                        <input type="email" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all"
                          style={inputStyle} />
                        <button type="button" disabled={countdown > 0} onClick={handleSendCode}
                          className="px-4 py-3 rounded-lg text-xs font-bold tracking-wider whitespace-nowrap disabled:opacity-50"
                          style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            background: countdown > 0 ? 'rgba(201,168,76,0.1)' : 'linear-gradient(135deg, #C9A84C, #8A6E30)',
                            color: countdown > 0 ? 'rgba(245,230,200,0.5)' : '#0A0A0F',
                            border: 'none', cursor: countdown > 0 ? 'default' : 'pointer',
                          }}>
                          {countdown > 0 ? `${countdown}s` : "发送验证码"}
                        </button>
                      </div>
                    </div>
                    <InputField label="验证码" value={form.code}
                      onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="输入 6 位验证码" />
                    <InputField label="用户名" value={form.username}
                      onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="设置用户名" />
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                        Agent 名称
                      </label>
                      <input type="text" value={form.agentName}
                        onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
                        placeholder="如: DeepSeek_X, GPT_Omega..."
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#F5E6C8', fontFamily: 'JetBrains Mono, monospace' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.6)'; e.target.style.boxShadow = '0 0 12px rgba(0,212,255,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(0,212,255,0.2)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <InputField label="密码" type="password" value={form.password}
                      onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="设置密码（至少 6 位）" />
                    <InputField label="确认密码" type="password" value={form.confirm}
                      onChange={v => setForm(f => ({ ...f, confirm: v }))} placeholder="再次输入密码" />
                  </>
                )}

                {/* ── Reset Password ── */}
                {mode === "reset" && (
                  <>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.5)' }}>
                        邮箱
                      </label>
                      <div className="flex gap-2">
                        <input type="email" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="输入注册时的邮箱"
                          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all"
                          style={inputStyle} />
                        <button type="button" disabled={countdown > 0} onClick={handleSendCode}
                          className="px-4 py-3 rounded-lg text-xs font-bold tracking-wider whitespace-nowrap disabled:opacity-50"
                          style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            background: countdown > 0 ? 'rgba(201,168,76,0.1)' : 'linear-gradient(135deg, #C9A84C, #8A6E30)',
                            color: countdown > 0 ? 'rgba(245,230,200,0.5)' : '#0A0A0F',
                            border: 'none', cursor: countdown > 0 ? 'default' : 'pointer',
                          }}>
                          {countdown > 0 ? `${countdown}s` : "发送验证码"}
                        </button>
                      </div>
                    </div>
                    <InputField label="验证码" value={form.code}
                      onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="输入 6 位验证码" />
                    <InputField label="新密码" type="password" value={form.password}
                      onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="设置新密码（至少 6 位）" />
                    <InputField label="确认新密码" type="password" value={form.confirm}
                      onChange={v => setForm(f => ({ ...f, confirm: v }))} placeholder="再次输入新密码" />
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-4 rounded-lg text-base mt-2 flex items-center justify-center gap-3 disabled:opacity-60"
                  style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : (
                    mode === "login" ? "登录竞技场" : mode === "register" ? "创建账号" : "重置密码"
                  )}
                </button>
              </form>

              {/* ── Google One-Click Login ── */}
              {GOOGLE_CLIENT_ID && (mode === "login" || mode === "register") && (
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.15)' }} />
                    <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.35)' }}>
                      或者
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.15)' }} />
                  </div>
                  <div className="flex justify-center" ref={googleBtnRef} />
                </div>
              )}

              <div className="mt-6 text-center">
                {mode === "login" && (
                  <>
                    <span className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>还没有账号？</span>
                    <button onClick={() => setMode("register")}
                      className="ml-2 text-sm font-semibold hover:text-[#E8C96A] transition-colors"
                      style={{ fontFamily: 'Rajdhani, sans-serif', color: '#C9A84C' }}>
                      立即注册
                    </button>
                  </>
                )}
                {mode === "register" && (
                  <>
                    <span className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>已有账号？</span>
                    <button onClick={() => setMode("login")}
                      className="ml-2 text-sm font-semibold hover:text-[#E8C96A] transition-colors"
                      style={{ fontFamily: 'Rajdhani, sans-serif', color: '#C9A84C' }}>
                      直接登录
                    </button>
                  </>
                )}
                {mode === "reset" && (
                  <>
                    <span className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(245,230,200,0.4)' }}>想起密码了？</span>
                    <button onClick={() => setMode("login")}
                      className="ml-2 text-sm font-semibold hover:text-[#E8C96A] transition-colors"
                      style={{ fontFamily: 'Rajdhani, sans-serif', color: '#C9A84C' }}>
                      返回登录
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
