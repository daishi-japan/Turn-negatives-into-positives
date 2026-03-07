"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="border-b-2 border-black px-6 py-4 flex justify-between items-center">
      <button
        onClick={() => router.push("/")}
        className="text-xs font-black tracking-[4px] cursor-pointer"
      >
        モヤポジ
      </button>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-6 h-4 flex flex-col justify-between cursor-pointer"
        >
          <span className="block h-[2px] bg-black" />
          <span className="block h-[2px] bg-black" />
          <span className="block h-[2px] bg-black" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 border-2 border-black bg-white z-50 min-w-[120px]">
            <button
              onClick={() => {
                router.push("/");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm font-bold hover:bg-black hover:text-white border-b border-black cursor-pointer"
            >
              変換
            </button>
            <button
              onClick={() => {
                router.push("/history");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm font-bold hover:bg-black hover:text-white border-b border-black cursor-pointer"
            >
              履歴
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-sm font-bold hover:bg-black hover:text-white cursor-pointer"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
