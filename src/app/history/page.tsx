"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";

import { createClient } from "@/lib/supabase/client";
import { useConversionResult } from "@/lib/use-conversion-result";

const TONE_LABELS: Record<string, string> = {
  dragonquest: "ドラクエ風",
  ghibli: "ジブリ風",
  jump: "少年ジャンプ風",
  ijin: "偉人風",
  ff: "FF風",
  onepiece: "ワンピース風",
  slamdunk: "スラダン風",
};

const TONES = [
  { key: "dragonquest", label: "ドラクエ風" },
  { key: "ghibli", label: "ジブリ風" },
  { key: "jump", label: "少年ジャンプ風" },
  { key: "ijin", label: "偉人風" },
  { key: "ff", label: "FF風" },
  { key: "onepiece", label: "ワンピース風" },
  { key: "slamdunk", label: "スラダン風" },
];

type Conversion = {
  id: string;
  negative_text: string;
  positive_text: string;
  tone: string;
  created_at: string;
  is_favorite: boolean;
};

export default function HistoryPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTones, setSelectedTones] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"history" | "favorites">("history");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const { setDraft, setDraftTone } = useConversionResult();

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("conversions")
      .select("*")
      .order("created_at", { ascending: false });
    setConversions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setTimeout(async () => {
      await supabase.from("conversions").delete().eq("id", id);
      setConversions((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) setExpandedId(null);
      setDeletingId(null);
    }, 400);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelectTone = (conversionId: string, toneKey: string) => {
    setSelectedTones((prev) => ({
      ...prev,
      [conversionId]: prev[conversionId] === toneKey ? "" : toneKey,
    }));
  };

  const handleToggleFavorite = async (id: string) => {
    const conv = conversions.find((c) => c.id === id);
    if (!conv) return;
    const newValue = !conv.is_favorite;
    setConversions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_favorite: newValue } : c))
    );
    await fetch("/api/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversionId: id, isFavorite: newValue }),
    });
  };

  const handleReuse = (negativeText: string, conversionId: string) => {
    const tone = selectedTones[conversionId] || "default";
    setDraft(negativeText);
    setDraftTone(tone);
    router.push("/");
  };

  const filtered = tab === "favorites"
    ? conversions.filter((c) => c.is_favorite)
    : conversions;

  return (
    <div className="min-h-screen flex flex-col max-w-[420px] mx-auto bg-[#fafafa] border-x-[3px] border-[#0a0a0a] shadow-[8px_8px_0_#0a0a0a] relative">
      <Header />

      {/* Tab switcher */}
      <div className="flex border-b-[3px] border-[#0a0a0a]">
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer transition-all duration-250 ${
            tab === "history" ? "bg-[#0a0a0a] text-white" : "text-[#999] hover:text-[#0a0a0a]"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
        >
          履歴
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer border-l-[3px] border-[#0a0a0a] transition-all duration-250 ${
            tab === "favorites" ? "bg-[#0a0a0a] text-white" : "text-[#999] hover:text-[#0a0a0a]"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
        >
          お気に入り
        </button>
      </div>

      <div className="flex-1 px-5 py-6 overflow-y-auto premium-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="loading-bar" />
            <p
              className="mt-4 text-[10px] tracking-[3px] text-[#999]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              LOADING
            </p>
          </div>
        ) : conversions.length === 0 ? (
          <div className="text-center mt-20 stagger">
            <p className="text-[#999] mb-6">
              まだモヤモヤを吐き出してないみたい
            </p>
            <a
              href="/"
              className="btn-brutalist inline-block border-[3px] border-[#0a0a0a] px-6 py-3 text-sm font-bold"
            >
              変換してみる
            </a>
          </div>
        ) : (
          <div className="stagger">
            {/* Header with count */}
            <div className="flex justify-between items-baseline mb-6">
              <div className="text-[22px] font-black tracking-[-0.5px]">変換履歴</div>
              <div
                className="text-[11px] text-[#999] tracking-[1px]"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                {filtered.length} RECORDS
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center mt-12">
                <p className="text-[#999]">お気に入りはまだありません</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((c) => {
                  const isExpanded = expandedId === c.id;
                  const selectedTone = selectedTones[c.id] || "";
                  const isDeleting = deletingId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`border-[3px] border-[#0a0a0a] overflow-hidden transition-all duration-200 ${
                        isDeleting
                          ? "history-card-deleting"
                          : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#0a0a0a]"
                      }`}
                      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                    >
                      {/* Card header */}
                      <div className="px-4 py-3 flex justify-between items-center border-b-[1.5px] border-[#0a0a0a]">
                        <span
                          className="text-[10px] text-[#999] tracking-[1px]"
                          style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                          {new Date(c.created_at).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }).replace(/\//g, ".")}
                          {" — "}
                          {new Date(c.created_at).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(c.id);
                            }}
                            className="p-0.5 cursor-pointer"
                            title="お気に入り"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={c.is_favorite ? "black" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="w-7 h-7 border-2 border-[#c0c0c0] bg-[#fafafa] cursor-pointer flex items-center justify-center text-[14px] text-[#999] hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-[#f0f0f0] transition-all duration-200"
                            style={{ fontFamily: "var(--font-dm-mono)" }}
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* BEFORE section */}
                      <div className="relative px-4 py-3.5 text-[12px] text-[#666] leading-[1.6] border-b border-dashed border-[#e0e0e0]">
                        <span
                          className="absolute top-3.5 right-4 text-[9px] text-[#c0c0c0] tracking-[1px]"
                          style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                          B
                        </span>
                        <button
                          onClick={() => toggleExpand(c.id)}
                          className="w-full text-left cursor-pointer truncate pr-6"
                        >
                          {c.negative_text}
                        </button>
                      </div>

                      {/* AFTER section */}
                      <div className="relative px-4 py-4 text-[14px] font-bold leading-[1.7] bg-[#0a0a0a] text-white">
                        <span
                          className="absolute top-4 right-4 text-[9px] text-[#444] tracking-[1px]"
                          style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                          A
                        </span>
                        <p className={`whitespace-pre-line pr-4 ${!isExpanded ? "line-clamp-2" : ""}`}>
                          {c.positive_text}
                        </p>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <>
                          {/* Tone for reuse */}
                          <div className="px-4 py-3 border-t-[1.5px] border-[#0a0a0a]">
                            <p
                              className="text-[10px] text-[#999] mb-2 tracking-[2px]"
                              style={{ fontFamily: "var(--font-dm-mono)" }}
                            >
                              TONE
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              {TONES.map((t) => (
                                <button
                                  key={t.key}
                                  onClick={() => handleSelectTone(c.id, t.key)}
                                  className={`border-2 px-2.5 py-1 text-[11px] cursor-pointer transition-all duration-200 ${
                                    selectedTone === t.key
                                      ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                                      : "border-[#c0c0c0] text-[#666] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                                  }`}
                                  style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="px-4 py-3 border-t-[1.5px] border-[#e0e0e0] flex justify-between">
                            <button
                              onClick={() => handleReuse(c.negative_text, c.id)}
                              className="btn-brutalist text-[11px] border-2 border-[#0a0a0a] px-4 py-1.5 font-bold cursor-pointer"
                            >
                              再入力
                            </button>
                            <span
                              className="text-[10px] text-[#999] flex items-center tracking-[1px]"
                              style={{ fontFamily: "var(--font-dm-mono)" }}
                            >
                              {TONE_LABELS[c.tone] || c.tone}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
