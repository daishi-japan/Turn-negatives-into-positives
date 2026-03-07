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
    <div className="min-h-screen flex flex-col max-w-[480px] mx-auto bg-white border-x-2 border-black">
      <div className="flex-1 flex flex-col justify-center px-8">
        <h1 className="text-2xl font-black text-center mb-1">モヤポジ</h1>
        <p className="text-sm text-gray-400 text-center mb-2">
          モヤモヤを入れたら、笑って戻れる。
        </p>
        <p className="text-xs text-gray-300 text-center mb-10">
          モヤモヤをクスッと笑えるポジティブに変換
        </p>

        <div className="flex border-2 border-black mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-bold text-center border-r border-black cursor-pointer ${
              isLogin ? "bg-black text-white" : ""
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer ${
              !isLogin ? "bg-black text-white" : ""
            }`}
          >
            サインアップ
          </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 border-2 border-black text-sm font-bold flex items-center justify-center gap-3 mb-6 cursor-pointer hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Googleでログイン
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-xs text-gray-400">または</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs text-gray-500 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-black p-3 text-sm mb-4 focus:outline-none"
            required
          />

          <label className="block text-xs text-gray-500 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-black p-3 text-sm mb-6 focus:outline-none"
            required
          />

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 border-2 border-black bg-black text-white text-sm font-bold disabled:opacity-40 cursor-pointer"
          >
            {loading
              ? "処理中..."
              : isLogin
              ? "ログイン"
              : "サインアップ"}
          </button>
        </form>
      </div>
    </div>
  );
}
