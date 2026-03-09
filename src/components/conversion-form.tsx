"use client";

import { useState, useEffect, useRef } from "react";
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
  const [shaking, setShaking] = useState(false);
  const textareaWrapRef = useRef<HTMLDivElement>(null);
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
    if (loading) return;
    if (!text.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
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
    <div className="flex-1 flex flex-col relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#fafafa] flex flex-col items-center justify-center z-20">
          <div className="loading-bar" />
          <p
            className={`mt-4 text-[10px] tracking-[3px] text-[#999] transition-opacity duration-300 ${
              msgFade ? "opacity-100" : "opacity-0"
            }`}
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            {loadingMsg}
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-7 py-8">
        <div className="stagger">
          {/* Catchcopy */}
          <h1 className="text-[26px] font-black leading-[1.7] mb-10 tracking-[-0.5px]">
            モヤモヤを入れたら、
            <br />
            <span className="inline bg-[#0a0a0a] text-[#fafafa] px-2.5 py-[3px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              笑って戻れる。
            </span>
          </h1>

          {/* Textarea */}
          <div className="flex flex-col gap-0">
            <div
              ref={textareaWrapRef}
              className={`border-[3px] border-[#0a0a0a] relative transition-shadow duration-300 ${
                shaking ? "animate-shake" : ""
              }`}
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"ここに書いてみて..."}
                maxLength={MAX_LENGTH}
                className="w-full min-h-[140px] p-5 text-[15px] leading-[1.8] resize-vertical border-none outline-none bg-transparent placeholder:text-[#c0c0c0] placeholder:font-light focus-within:shadow-none"
                onFocus={() => {
                  if (textareaWrapRef.current) {
                    textareaWrapRef.current.style.boxShadow = "4px 4px 0 #0a0a0a";
                  }
                }}
                onBlur={() => {
                  if (textareaWrapRef.current) {
                    textareaWrapRef.current.style.boxShadow = "none";
                  }
                }}
              />
              {text && (
                <button
                  onClick={handleClearDraft}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[#c0c0c0] hover:text-[#0a0a0a] text-sm cursor-pointer"
                  title="クリア"
                >
                  ×
                </button>
              )}
              <span
                className={`absolute bottom-2 right-3 text-[11px] transition-colors duration-200 ${
                  isOverLimit ? "text-red-500 font-bold" : charCount > 0 ? "text-[#666]" : "text-[#c0c0c0]"
                }`}
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                {charCount}
              </span>
            </div>
          </div>

          {/* Tone chips */}
          <div className="mt-5">
            <div
              className="text-[10px] tracking-[2px] text-[#999] mb-3"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              TONE
            </div>
            <div className="flex gap-2 flex-wrap">
              {TONES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTone(t.key)}
                  className={`border-2 border-[#0a0a0a] px-4 py-2 text-[12px] font-bold tracking-[1px] cursor-pointer transition-all duration-200 ${
                    tone === t.key
                      ? "bg-[#0a0a0a] text-white translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0_#0a0a0a]"
                      : "bg-[#fafafa] text-[#0a0a0a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[2px_2px_0_#0a0a0a]"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feeling chips */}
          <div className="mt-4">
            <div
              className="text-[10px] tracking-[2px] text-[#999] mb-3"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              FEELING
            </div>
            <div className="flex gap-2 flex-wrap">
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
                  className={`border-2 px-4 py-2 text-[11px] cursor-pointer transition-all duration-200 ${
                    feelings.includes(f.key)
                      ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                      : "border-[#c0c0c0] text-[#999] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 px-5 py-4 border-[3px] border-[#0a0a0a] bg-[#f0f0f0] text-sm text-[#0a0a0a]">
              {error}
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={handleSubmit}
            disabled={loading || isOverLimit}
            className="btn-brutalist w-full mt-5 py-5 text-center border-[3px] border-[#0a0a0a] text-[15px] font-black bg-[#0a0a0a] text-white tracking-[3px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            気持ちを切り替える
          </button>
        </div>
      </div>
    </div>
  );
}
