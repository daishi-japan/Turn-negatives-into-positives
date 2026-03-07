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
