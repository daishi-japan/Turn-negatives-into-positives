"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { index: "01", label: "変換", path: "/" },
  { index: "02", label: "結果", path: "/result" },
  { index: "03", label: "ログイン", path: "/login" },
  { index: "04", label: "履歴", path: "/history" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  // Build nav links based on auth state
  const navLinks = NAV_LINKS.filter((link) => {
    // Hide "ログイン" when logged in
    if (link.path === "/login" && user) return false;
    return true;
  });

  return (
    <>
      {/* Overlay Navigation */}
      <div className={`nav-overlay ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link, i) => (
          <a
            key={link.path}
            onClick={() => handleNavigate(link.path)}
          >
            <span
              className="text-[12px] font-normal text-[#666] min-w-[28px]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {link.label}
          </a>
        ))}
        {/* Auth action: login or logout */}
        {user ? (
          <a onClick={handleLogout}>
            <span
              className="text-[12px] font-normal text-[#666] min-w-[28px]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              {String(navLinks.length + 1).padStart(2, "0")}
            </span>
            ログアウト
          </a>
        ) : (
          <a onClick={() => handleNavigate("/login")}>
            <span
              className="text-[12px] font-normal text-[#666] min-w-[28px]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              {String(navLinks.length + 1).padStart(2, "0")}
            </span>
            ログイン
          </a>
        )}
      </div>

      {/* Header Bar */}
      <header className="border-b-[3px] border-[#0a0a0a] px-6 py-[18px] flex justify-between items-center relative z-50 bg-[#fafafa] shrink-0">
        <button
          onClick={() => handleNavigate("/")}
          className="text-[11px] font-black tracking-[6px] uppercase cursor-pointer relative group"
        >
          ネガポジ変換
          <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#0a0a0a] scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100" style={{ transitionTimingFunction: "var(--ease-out-expo)" }} />
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-7 h-5 flex flex-col justify-between cursor-pointer relative z-[60] ${menuOpen ? "hamburger-active" : ""}`}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </header>
    </>
  );
}
