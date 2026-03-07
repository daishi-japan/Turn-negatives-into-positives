"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversionResult } from "@/lib/use-conversion-result";

const MAX_LENGTH = 500;

const TONES = [
  { key: "dragonquest", label: "ドラクエ風" },
  { key: "ghibli", label: "ジブリ風" },
  { key: "jump", label: "少年ジャンプ風" },
  { key: "ijin", label: "偉人風" },
  { key: "ff", label: "FF風" },
  { key: "onepiece", label: "ワンピース風" },
  { key: "slamdunk", label: "スラダン風" },
];

const FEELINGS = [
  { key: "irritated", label: "#イライラ" },
  { key: "anxious", label: "#不安" },
  { key: "sad", label: "#悲しい" },
  { key: "tired", label: "#疲れた" },
  { key: "frustrated", label: "#悔しい" },
  { key: "insecure", label: "#自信ない" },
];

const LOADING_MESSAGES: Record<string, string[]> = {
  dragonquest: [
    "じゅもんを となえている…",
    "スライムが 応援している…",
    "レベルアップの 準備中…",
    "つよい ことばを みつけた！",
  ],
  ghibli: [
    "風が言葉を運んでいます…",
    "森の奥で声を聴いています…",
    "小さな光が集まっています…",
    "もうすぐ届きますよ…",
  ],
  jump: [
    "全力で背中を押してます…",
    "仲間がエールを送ってます…",
    "限界を超える言葉を探し中…",
    "もうすぐ届く、信じろ…！",
  ],
  ijin: [
    "古今東西の知恵を集めています…",
    "偉人たちが会議中…",
    "歴史に残る一言を探しています…",
    "もうすぐ届きます…",
  ],
  ff: [
    "召喚獣を呼び出し中…",
    "クリスタルが共鳴しています…",
    "光の戦士が言葉を紡いでいます…",
    "リミットブレイク発動準備中…",
  ],
  onepiece: [
    "仲間を集めています…",
    "グランドラインを航海中…",
    "麦わらの意志を受け継ぎ中…",
    "ドン！！の準備中…",
  ],
  slamdunk: [
    "タイムアウト中…作戦会議してます",
    "安西先生が考え中…",
    "左手はそえるだけ…",
    "諦めない言葉を探しています…",
  ],
};

export function ConversionForm() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("dragonquest");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [msgFade, setMsgFade] = useState(true);
  const router = useRouter();
  const { setResult, getDraft, setDraft, getDraftTone } = useConversionResult();

  useEffect(() => {
    const draft = getDraft();
    if (draft) setText(draft);
    const draftTone = getDraftTone();
    if (draftTone) setTone(draftTone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle loading messages with fade
  useEffect(() => {
    if (!loading) return;
    const messages = LOADING_MESSAGES[tone] || LOADING_MESSAGES.dragonquest;
    let index = 0;
    setLoadingMsg(messages[0]);
    setMsgFade(true);

    const interval = setInterval(() => {
      setMsgFade(false);
      setTimeout(() => {
        index = (index + 1) % messages.length;
        setLoadingMsg(messages[index]);
        setMsgFade(true);
      }, 300);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading, tone]);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negativeText: text.trim(), tone, feelings }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "変換に失敗しました");
        return;
      }

      setDraft(text.trim());
      setResult({ negative: text.trim(), positive: data.positiveText, conversionId: data.conversionId });
      router.push("/result");
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDraft = () => {
    setText("");
    setDraft("");
  };

  const charCount = text.length;
  const isNearLimit = charCount > MAX_LENGTH * 0.8;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <div className="flex-1 flex flex-col px-8 pt-10 pb-12">
      <h1 className="text-[22px] font-black text-center mb-8 leading-relaxed">
        モヤモヤを入れたら、
        <br />
        <span className="inline-block bg-black text-white px-2 py-0.5">
          笑って戻れる。
        </span>
      </h1>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"例：上司に理不尽に怒られた\n例：プレゼンで頭が真っ白になった\n例：月曜日が来るのが怖い"}
          maxLength={MAX_LENGTH}
          className="w-full border-2 border-black p-5 min-h-[140px] text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
        />
        {text && (
          <button
            onClick={handleClearDraft}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-black text-sm cursor-pointer"
            title="クリア"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex justify-end mt-1">
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-red-500 font-bold"
              : isNearLimit
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>

      {/* Tone selection */}
      <div className="flex gap-2 flex-wrap mt-3 mb-3">
        {TONES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTone(t.key)}
            className={`border-2 px-3 py-1.5 text-xs font-bold cursor-pointer ${
              tone === t.key
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-400 hover:border-black hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feeling selection */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FEELINGS.map((f) => (
          <button
            key={f.key}
            onClick={() =>
              setFeelings((prev) =>
                prev.includes(f.key)
                  ? prev.filter((k) => k !== f.key)
                  : [...prev, f.key]
              )
            }
            className={`px-3 py-1 text-[11px] rounded-full border cursor-pointer ${
              feelings.includes(f.key)
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-400 hover:border-black hover:text-black"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 px-4 py-3 border-2 border-black bg-gray-100 text-sm text-black">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim() || isOverLimit}
        className="w-full mt-4 py-[18px] text-center border-2 border-black text-[15px] font-black bg-black text-white tracking-[2px] hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            変換中...
          </span>
        ) : (
          "気持ちを切り替える"
        )}
      </button>

      {loading && loadingMsg && (
        <p
          className={`text-center text-xs text-gray-400 mt-3 transition-opacity duration-300 ${
            msgFade ? "opacity-100" : "opacity-0"
          }`}
        >
          {loadingMsg}
        </p>
      )}
    </div>
  );
}
