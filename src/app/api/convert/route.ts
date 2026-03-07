import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { convertToPositive } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_TEXT_LENGTH = 500;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // レート制限チェック
  const { allowed, remaining } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "1時間あたりの変換回数の上限に達しました。しばらくお待ちください。" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const { negativeText, tone = "dragonquest", feelings = [] } = await request.json();

  if (!negativeText || typeof negativeText !== "string" || negativeText.trim().length === 0) {
    return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
  }

  // 入力文字数制限
  if (negativeText.trim().length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `${MAX_TEXT_LENGTH}文字以内で入力してください` },
      { status: 400 }
    );
  }

  try {
    const positiveText = await convertToPositive(negativeText.trim(), tone, feelings);

    const { data: inserted } = await supabase.from("conversions").insert({
      user_id: user.id,
      negative_text: negativeText.trim(),
      positive_text: positiveText,
      tone,
    }).select("id").single();

    return NextResponse.json(
      { positiveText, conversionId: inserted?.id },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "変換に失敗しました" },
      { status: 500 }
    );
  }
}
