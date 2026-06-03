import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { text, spaceName, spaceType } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "텍스트가 없습니다." }, { status: 400 });
  }

  const spaceContext: Record<string, string> = {
    official: "제주 관광지",
    business: "제주 맛집/카페",
    user: "나만의 공간",
    event: "이벤트 현장",
  };

  const prompt = `당신은 제주도 여행 감성 기록 작가입니다.
아래의 짧은 메모를 읽고, 제주도의 ${spaceContext[spaceType] ?? "공간"} "${spaceName}"에서의 순간을 감성적이고 따뜻한 한국어 문장으로 2~3문장 다듬어주세요.
장소의 분위기, 감각적 묘사, 감정을 자연스럽게 녹여주세요.
또한 이 기록에 어울리는 해시태그 3개를 생성해주세요.

원본 메모: "${text}"

응답 형식 (JSON):
{
  "refined": "감성적으로 정리된 문장",
  "tags": ["태그1", "태그2", "태그3"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const json = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(json);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
