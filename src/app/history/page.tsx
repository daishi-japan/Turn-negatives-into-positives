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
    await supabase.from("conversions").delete().eq("id", id);
    setConversions((prev) => prev.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
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

  return (
    <div className="min-h-screen flex flex-col max-w-[480px] mx-auto bg-white border-x-2 border-black">
      <Header />
      {/* Tab switcher */}
      <div className="flex border-b-2 border-black">
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer ${
            tab === "history" ? "bg-black text-white" : "text-gray-400 hover:text-black"
          }`}
        >
          履歴
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer ${
            tab === "favorites" ? "bg-black text-white" : "text-gray-400 hover:text-black"
          }`}
        >
          お気に入り
        </button>
      </div>

      <div className="flex-1 px-5 py-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-20">読み込み中...</p>
        ) : conversions.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 mb-6">
              まだモヤモヤを吐き出してないみたい
            </p>
            <a
              href="/"
              className="inline-block border-2 border-black px-6 py-3 text-sm font-bold hover:bg-black hover:text-white"
            >
              変換してみる
            </a>
          </div>
        ) : (() => {
          const filtered = tab === "favorites"
            ? conversions.filter((c) => c.is_favorite)
            : conversions;
          if (filtered.length === 0) {
            return (
              <div className="text-center mt-20">
                <p className="text-gray-400">お気に入りはまだありません</p>
              </div>
            );
          }
          return filtered.map((c) => {
            const isExpanded = expandedId === c.id;
            const selectedTone = selectedTones[c.id] || "";
            return (
              <div key={c.id} className="border-2 border-black mb-3">
                <button
                  onClick={() => toggleExpand(c.id)}
                  className="w-full px-3 py-2.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 text-left"
                >
                  <span className="text-[13px] text-gray-500 truncate flex-1 mr-3">
                    {c.negative_text}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
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
                    <span className="text-[10px] border border-black px-1.5 py-0.5 font-bold">
                      {TONE_LABELS[c.tone] || c.tone}
                    </span>
                    <span className="text-gray-300 text-xs">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <>
                    <div className="px-3 py-2 border-t border-gray-200 text-[11px] text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="px-3 py-3 text-[13px] text-gray-500 bg-[#f9f9f9] border-t border-dashed border-gray-300">
                      {c.negative_text}
                    </div>
                    <div className="text-center text-gray-300 text-sm py-1">↓</div>
                    <div className="px-3 py-3 text-[13px] font-medium whitespace-pre-line">
                      {c.positive_text}
                    </div>

                    {/* Tone selection for reuse */}
                    <div className="px-3 py-2 border-t border-gray-200">
                      <p className="text-[11px] text-gray-400 mb-2">トーンを選んで再入力：</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {TONES.map((t) => (
                          <button
                            key={t.key}
                            onClick={() => handleSelectTone(c.id, t.key)}
                            className={`border px-2.5 py-1 text-[11px] cursor-pointer ${
                              selectedTone === t.key
                                ? "border-black bg-black text-white"
                                : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-2 border-t border-gray-200 flex justify-between">
                      <button
                        onClick={() => handleReuse(c.negative_text, c.id)}
                        className="text-[11px] border border-gray-300 px-3 py-1 font-bold hover:border-black hover:text-black cursor-pointer text-gray-500"
                      >
                        再入力
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-[11px] text-gray-400 border border-gray-300 px-2 py-1 hover:border-black hover:text-black cursor-pointer"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
