const RESULT_KEY = "negaposi-result";
const DRAFT_KEY = "negaposi-draft";
const DRAFT_TONE_KEY = "negaposi-draft-tone";

type ConversionResult = {
  negative: string;
  positive: string;
  conversionId?: string;
};

export function useConversionResult() {
  const setResult = (result: ConversionResult) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    }
  };

  const getResult = (): ConversionResult | null => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem(RESULT_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const setDraft = (text: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DRAFT_KEY, text);
    }
  };

  const getDraft = (): string => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(DRAFT_KEY) || "";
  };

  const setDraftTone = (tone: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DRAFT_TONE_KEY, tone);
    }
  };

  const getDraftTone = (): string => {
    if (typeof window === "undefined") return "";
    const tone = sessionStorage.getItem(DRAFT_TONE_KEY) || "";
    // 一度読んだらクリア（使い捨て）
    if (tone) sessionStorage.removeItem(DRAFT_TONE_KEY);
    return tone;
  };

  return { setResult, getResult, setDraft, getDraft, setDraftTone, getDraftTone };
}
