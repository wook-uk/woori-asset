import Anthropic from "@anthropic-ai/sdk";
import type { AssetData } from "@/types/asset";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(data: AssetData): string {
  const { profile, isa, irp, etf, deposits } = data;

  const isaInfo = isa.length > 0
    ? isa.map((a, i) => `
  ISA #${i + 1}:
  - 유형: ${a.type}
  - 운용방식: ${a.mode}
  - 잔액: ${a.balance.toLocaleString()}만원
  - 연간 납입 한도: ${a.annualLimit.toLocaleString()}만원
  - 만기 연도: ${a.expiryYear}년`).join("")
    : "  - 없음";

  const irpInfo = irp.length > 0
    ? irp.map((a, i) => `
  IRP #${i + 1}:
  - 운용방식: ${a.mode}
  - 잔액: ${a.balance.toLocaleString()}만원
  - 월 납입액: ${a.monthlyContribution.toLocaleString()}만원
  - 예상 수령 나이: ${a.expectedRetirementAge}세`).join("")
    : "  - 없음";

  const etfInfo = etf.length > 0
    ? etf.map((h, i) => {
        const value = h.quantity * h.currentPrice;
        const cost = h.quantity * h.avgPrice;
        const ret = cost > 0 ? (((value - cost) / cost) * 100).toFixed(2) : "0.00";
        return `
  ETF #${i + 1}:
  - 종목명: ${h.name}${h.ticker ? ` (${h.ticker})` : ""}
  - 보유수량: ${h.quantity}주
  - 현재가: ${h.currentPrice.toLocaleString()}원
  - 평균매입가: ${h.avgPrice.toLocaleString()}원
  - 평가금액: ${value.toLocaleString()}원
  - 수익률: ${ret}%`;
      }).join("")
    : "  - 없음";

  const depositInfo = deposits.length > 0
    ? deposits.map((a, i) => `
  ${a.type} #${i + 1}:
  - 은행: ${a.bank || "미입력"}
  - 잔액: ${a.balance.toLocaleString()}만원
  - 금리: ${a.interestRate}%
  - 만기일: ${a.maturityDate}${a.type === "적금" && a.monthlyAmount ? `\n  - 월 납입액: ${a.monthlyAmount.toLocaleString()}만원` : ""}`).join("")
    : "  - 없음";

  const totalISA = isa.reduce((s, a) => s + a.balance, 0);
  const totalIRP = irp.reduce((s, a) => s + a.balance, 0);
  const totalETF = etf.reduce((s, h) => s + h.quantity * h.currentPrice, 0) / 10000;
  const totalDeposit = deposits.reduce((s, a) => s + a.balance, 0);
  const totalAsset = totalISA + totalIRP + totalETF + totalDeposit;

  return `
[고객 기본 정보]
- 나이: ${profile.age}세
- 연 소득: ${profile.annualIncome.toLocaleString()}만원
- 투자 목표: ${profile.investmentGoal}
- 투자 성향: ${profile.riskTolerance}

[자산 현황 요약]
- ISA 총액: ${totalISA.toLocaleString()}만원
- IRP 총액: ${totalIRP.toLocaleString()}만원
- ETF 평가액: ${Math.round(totalETF).toLocaleString()}만원
- 예적금 총액: ${totalDeposit.toLocaleString()}만원
- 총 자산: 약 ${Math.round(totalAsset).toLocaleString()}만원

[ISA 상세]
${isaInfo}

[IRP 상세]
${irpInfo}

[ETF 보유 상세]
${etfInfo}

[예금/적금 상세]
${depositInfo}
  `.trim();
}

const SYSTEM_PROMPT = `당신은 대한민국 금융 자산 전문가입니다. 고객의 ISA, IRP, ETF, 예적금 자산 현황을 분석하여 맞춤형 자산 진단 리포트를 제공합니다.

분석 시 다음 사항을 반드시 포함하세요:

1. **종합 자산 현황 진단** - 자산 배분 현황 및 특징
2. **세제 혜택 분석** - ISA/IRP 세금 혜택 활용 현황 및 절세 가능성
3. **자산 배분 평가** - 안전자산/위험자산 비율, 투자 목표 대비 적합성
4. **ETF 포트폴리오 분석** - 분산투자 현황, 섹터/지역 분석 (ETF가 있는 경우)
5. **노후 준비 현황** - IRP 기반 은퇴 자금 예측 (나이/소득 대비)
6. **구체적 개선 전략** - 우선순위별 실천 가능한 액션 아이템

마크다운 작성 규칙 (반드시 준수):
- 한국어로 작성하세요
- 마크다운 형식으로 구조화하세요 (##, ###, -, **굵게** 등 사용)
- 취소선(~~텍스트~~) 문법은 절대 사용하지 마세요. ~~ 두 개 연속은 절대 금지
- 숫자 범위는 반드시 ~ 하나만 사용하세요 (올바른 예: 100~200만원 / 잘못된 예: 100~~200만원)
- 수식·수학적 표현은 마크다운 특수문자 없이 일반 텍스트로 작성하세요
  예) 250만원 × 1.025의 30승 ≈ 524만원 (^기호 사용 금지, LaTeX 금지)
- 자산 배분 차트는 별도 UI가 처리하므로 막대(█ ▇) 같은 유니코드 아트나 ASCII 그래픽을 사용하지 마세요. 숫자와 텍스트로만 표현하세요
- 숫자는 구체적으로 계산하여 제시하세요
- 투자 성향과 목표를 반드시 반영하세요
- 과도한 위험 투자는 경고하고, 합리적인 대안을 제시하세요
- 법적 면책 문구보다는 실질적으로 도움이 되는 정보를 우선하세요
- 분석은 상세하고 전문적으로, 최소 600자 이상 작성하세요`;

export async function POST(req: Request) {
  try {
    const body = await req.json() as AssetData;

    const userPrompt = buildPrompt(body);

    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음 고객의 자산 현황을 분석하고 상세한 진단 리포트를 작성해주세요:\n\n${userPrompt}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
