import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { spaces, nickname, question } = await req.json();

  const spaceList = (spaces as { name: string; type: string }[])
    .map((s) => {
      const labels: Record<string, string> = { official: "관광지", business: "맛집/카페", user: "유저공간", event: "이벤트" };
      return `- ${s.name} (${labels[s.type] ?? s.type})`;
    })
    .join("\n");

  let prompt: string;

  if (question) {
    // 자유 질문 모드
    prompt = `당신은 제주도 전문 AI 여행 비서입니다. 친근하고 따뜻한 말투로 답변해주세요.

${nickname}님의 컬렉션:
${spaceList || "없음"}

질문: ${question}

제주도의 날씨, 음식, 교통, 숙소, 명소 등에 대해 실용적이고 감성적인 답변을 3~5문장으로 해주세요.`;
  } else {
    // 일정 생성 모드
    prompt = `당신은 제주도 전문 AI 여행 비서입니다.

${nickname}님이 저장한 제주 공간들:
${spaceList}

위 공간들을 바탕으로 하루 여행 일정을 짜주세요.
- 이동 동선을 고려해 효율적으로 배치
- 오전/점심/오후/저녁 순서로 구성
- 각 장소에 짧은 감성 멘트 한 줄 추가
- 전체 3~5줄로 간결하게`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return NextResponse.json({ plan: result.response.text().trim() });
  } catch {
    return NextResponse.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
