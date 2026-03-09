"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[420px] mx-auto bg-[#fafafa] border-x-[3px] border-[#0a0a0a] shadow-[8px_8px_0_#0a0a0a] relative">
      <div className="flex-1 flex flex-col justify-center px-7">
        <div className="stagger">
          <h1 className="text-[24px] font-black mb-2 tracking-[-0.5px]">
            おかえりなさい
          </h1>
          <p className="text-[13px] text-[#666] mb-8 leading-[1.6]">
            ログインすると変換履歴が保存されます
          </p>

          {/* Auth tabs */}
          <div className="flex border-[3px] border-[#0a0a0a] mb-7">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3.5 text-center text-[13px] font-bold cursor-pointer tracking-[1px] transition-all duration-250 ${
                isLogin
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-[#fafafa] text-[#999]"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              ログイン
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3.5 text-center text-[13px] font-bold cursor-pointer tracking-[1px] border-l-[3px] border-[#0a0a0a] transition-all duration-250 ${
                !isLogin
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-[#fafafa] text-[#999]"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              サインアップ
            </button>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-0">
              {/* Email field */}
              <div className="border-[3px] border-[#0a0a0a] relative">
                <label
                  className="absolute top-[-9px] left-3.5 bg-[#fafafa] px-1.5 text-[10px] tracking-[2px] text-[#999] uppercase"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full py-4 px-5 text-[14px] border-none outline-none bg-transparent placeholder:text-[#c0c0c0] placeholder:font-light"
                  required
                />
              </div>

              {/* Password field */}
              <div className="border-[3px] border-[#0a0a0a] border-t-0 relative">
                <label
                  className="absolute top-[-9px] left-3.5 bg-[#fafafa] px-1.5 text-[10px] tracking-[2px] text-[#999] uppercase"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-4 px-5 text-[14px] border-none outline-none bg-transparent placeholder:text-[#c0c0c0] placeholder:font-light"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brutalist w-full mt-5 py-[18px] text-center border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white text-[14px] font-black tracking-[2px] disabled:opacity-40 cursor-pointer"
            >
              {loading
                ? "処理中..."
                : isLogin
                ? "はじめる"
                : "アカウント作成"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1.5px] bg-[#e0e0e0]" />
            <span
              className="text-[10px] text-[#999] tracking-[2px]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              OR
            </span>
            <div className="flex-1 h-[1.5px] bg-[#e0e0e0]" />
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="btn-brutalist w-full py-4 border-[3px] border-[#0a0a0a] text-[13px] font-bold flex items-center justify-center gap-3 cursor-pointer bg-[#fafafa] text-[#0a0a0a] tracking-[1px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
