"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversionResult } from "@/lib/use-conversion-result";

export function ConversionResult() {
  const router = useRouter();
  const { getResult } = useConversionResult();

  const [negative, setNegative] = useState("");
  const [currentPositive, setCurrentPositive] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const [conversionId, setConversionId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const result = getResult();
    if (!result) {
      router.push("/");
      return;
    }
    setNegative(result.negative);
    setCurrentPositive(result.positive);
    if (result.conversionId) setConversionId(result.conversionId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentPositive) return;
    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentPositive.length) {
        setDisplayText(currentPositive.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [currentPositive]);

  const handleToggleFavorite = async () => {
    if (!conversionId) return;
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    await fetch("/api/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversionId, isFavorite: newValue }),
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPositive);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!negative) return null;

  return (
    <div className="flex-1 flex flex-col px-7 pt-7 pb-10 premium-scroll overflow-y-auto">
      <div className="stagger">
        {/* BEFORE label */}
        <div
          className="text-[10px] tracking-[3px] text-[#999] mb-2 uppercase"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          YOUR INPUT
        </div>

        {/* Original text - dashed border with BEFORE label */}
        <div className="relative text-[13px] text-[#666] leading-[1.7] p-4 px-5 border-[1.5px] border-dashed border-[#0a0a0a] mb-7">
          <span
            className="absolute top-[-8px] left-3 bg-[#fafafa] px-1.5 text-[9px] tracking-[2px] text-[#999]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            BEFORE
          </span>
          {negative}
        </div>

        {/* CONVERTED label */}
        <div
          className="text-[10px] tracking-[3px] text-[#999] mb-2 uppercase"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          CONVERTED
        </div>

        {/* Converted text - black bg with AFTER label */}
        <div className="relative text-[20px] font-bold leading-[1.8] p-6 border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white mb-6">
          <span
            className="absolute top-[-8px] left-3 bg-[#0a0a0a] px-1.5 text-[9px] tracking-[2px] text-[#666]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            AFTER
          </span>
          <p className="whitespace-pre-line">
            {displayText}
            {isTyping && (
              <span className="inline-block w-[2px] h-[20px] bg-white ml-0.5 align-text-bottom animate-pulse" />
            )}
          </p>

          {/* Actions */}
          {!isTyping && (
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {conversionId && (
                <button
                  onClick={handleToggleFavorite}
                  className="p-1.5 cursor-pointer text-[#666] hover:text-white"
                  title="お気に入り"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleCopy}
                className="relative p-1.5 text-[#666] hover:text-white cursor-pointer"
                title="コピー"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="0" ry="0" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#0a0a0a] text-[10px] px-2 py-1 whitespace-nowrap">
                    コピーしました
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Retry button */}
        {!isTyping && (
          <button
            onClick={() => router.push("/")}
            className="btn-brutalist w-full py-[18px] text-center border-[3px] border-[#0a0a0a] text-[14px] font-bold bg-[#fafafa] text-[#0a0a0a] tracking-[2px] cursor-pointer"
          >
            もう一回吐き出す
          </button>
        )}
      </div>
    </div>
  );
}
