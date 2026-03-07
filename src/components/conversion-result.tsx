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
    <div className="flex-1 flex flex-col px-8 pt-10 pb-12">
      <div className="border-2 border-black p-4 text-sm text-gray-500">
        {negative}
      </div>

      <div className="text-center text-xl text-gray-300 my-4">↓</div>

      <div className="relative border-2 border-black p-6 bg-[#fafafa]">
        <p className="text-[17px] leading-[2] font-medium whitespace-pre-line">
          {displayText}
          {isTyping && (
            <span className="inline-block w-[2px] h-[18px] bg-black ml-0.5 align-text-bottom animate-pulse" />
          )}
        </p>

        {/* Actions: favorite + copy */}
        {!isTyping && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {conversionId && (
              <button
                onClick={handleToggleFavorite}
                className="p-1.5 cursor-pointer"
                title="お気に入り"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "black" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="relative p-1.5 text-gray-400 hover:text-black cursor-pointer"
              title="コピー"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                  コピーしました
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {!isTyping && (
        <button
          onClick={() => router.push("/")}
          className="w-full mt-5 py-4 text-center border-2 border-black text-sm font-bold hover:bg-black hover:text-white cursor-pointer"
        >
          もう一回吐き出す
        </button>
      )}
    </div>
  );
}
