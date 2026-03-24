"use client";

import { useState, useCallback } from "react";
import type { AssetData, ISAAccount, IRPAccount, ETFHolding, DepositAccount, UserProfile } from "@/types/asset";
import ProfileForm from "@/components/ProfileForm";
import ISAForm from "@/components/ISAForm";
import IRPForm from "@/components/IRPForm";
import ETFForm from "@/components/ETFForm";
import DepositForm from "@/components/DepositForm";
import AnalysisResult from "@/components/AnalysisResult";
import AssetAllocationChart from "@/components/AssetAllocationChart";
import RetirementSimulator from "@/components/RetirementSimulator";

const INITIAL_PROFILE: UserProfile = {
  age: 35,
  annualIncome: 5000,
  investmentGoal: "노후준비",
  riskTolerance: "위험중립형",
};

export default function Home() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isa, setISA] = useState<ISAAccount[]>([]);
  const [irp, setIRP] = useState<IRPAccount[]>([]);
  const [etf, setETF] = useState<ETFHolding[]>([]);
  const [deposits, setDeposits] = useState<DepositAccount[]>([]);

  const [result, setResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isaTotal = isa.reduce((s, a) => s + a.balance, 0);
  const irpTotal = irp.reduce((s, a) => s + a.balance, 0);
  const etfTotal = Math.round(etf.reduce((s, h) => s + h.quantity * h.currentPrice, 0) / 10000);
  const depositTotal = deposits.reduce((s, a) => s + a.balance, 0);

  const totalAssets = useCallback(() => {
    return isaTotal + irpTotal + etfTotal + depositTotal;
  }, [isaTotal, irpTotal, etfTotal, depositTotal]);

  const handleAnalyze = async () => {
    setResult("");
    setError(undefined);
    setIsStreaming(true);

    const data: AssetData = { profile, isa, irp, etf, deposits };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "서버 오류가 발생했습니다." }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("응답 스트림을 받지 못했습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setResult((prev) => prev + text);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  };

  const hasAnyAsset = isa.length > 0 || irp.length > 0 || etf.length > 0 || deposits.length > 0;

  return (
    <main className="min-h-screen">
      {/* ── 상단 네비게이션 ───────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">AI 자산진단</h1>
              <p className="text-xs text-slate-500">스마트 자산 분석 서비스</p>
            </div>
          </div>
          {hasAnyAsset && (
            <div className="text-right">
              <div className="text-xs text-slate-500">총 자산</div>
              <div className="text-base font-bold text-blue-600">
                {totalAssets().toLocaleString()}만원
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── 히어로 섹션 ──────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center">
          {/* 뱃지 */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs font-medium mb-5">
            <span className="text-yellow-300">✦</span>
            AI 기반 무료 자산 분석
          </div>

          {/* 헤드라인 */}
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3 tracking-tight">
            내 ISA · IRP · ETF · 예적금<br />
            <span className="text-blue-200">AI가 3분 만에 진단해요</span>
          </h2>

          <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            복잡한 금융 자산을 한곳에 입력하면<br className="sm:hidden" />
            절세 방법부터 포트폴리오 개선까지<br className="sm:hidden" />
            AI가 상세히 분석해드립니다
          </p>

          {/* 핵심 가치 제안 */}
          <div className="flex flex-wrap justify-center gap-2 mb-9">
            {[
              { icon: "✅", label: "완전 무료" },
              { icon: "⏱️", label: "3분 완성" },
              { icon: "🔒", label: "가입 불필요" },
              { icon: "📊", label: "AI 맞춤 분석" },
            ].map((v) => (
              <span
                key={v.label}
                className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5 text-sm font-medium"
              >
                {v.icon} {v.label}
              </span>
            ))}
          </div>

          {/* CTA 버튼 */}
          <a
            href="#start"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            🤖 지금 바로 진단받기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </a>

          {/* 3단계 흐름 */}
          <div className="flex items-center justify-center gap-2.5 mt-9 text-blue-200 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span>자산 입력</span>
            </div>
            <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span>AI 분석</span>
            </div>
            <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span>결과 확인</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 메인 콘텐츠 ──────────────────────────────────────── */}
      <div id="start" className="max-w-6xl mx-auto px-4 py-6 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: 입력 폼 */}
          <div className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-800">자산 정보 입력</h2>
              <p className="text-sm text-slate-500 mt-1">
                보유 중인 자산을 입력하면 AI가 종합 분석합니다
              </p>
            </div>

            <ProfileForm profile={profile} onChange={setProfile} />
            <ISAForm accounts={isa} onChange={setISA} />
            <IRPForm accounts={irp} onChange={setIRP} />
            <ETFForm holdings={etf} onChange={setETF} />
            <DepositForm accounts={deposits} onChange={setDeposits} />

            {/* 분석 버튼 */}
            <div className="sticky bottom-4">
              <button
                onClick={handleAnalyze}
                disabled={isStreaming}
                className="btn-primary w-full shadow-lg shadow-blue-200"
              >
                {isStreaming ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI 분석 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🤖</span> 무료로 AI 자산진단 받기
                  </span>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                ✅ 완전 무료&nbsp;&nbsp;·&nbsp;&nbsp;⏱️ 3분 소요&nbsp;&nbsp;·&nbsp;&nbsp;🔒 가입 불필요
              </p>
            </div>
          </div>

          {/* 우측: 결과 */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
            {/* 자산 배분 차트 */}
            <AssetAllocationChart
              isa={isaTotal}
              irp={irpTotal}
              etf={etfTotal}
              deposit={depositTotal}
            />

            {/* 노후 시뮬레이터 */}
            <RetirementSimulator
              age={profile.age}
              currentAssets={totalAssets()}
            />

            {!result && !isStreaming && !error && (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  자산 진단 대기 중
                </h3>
                <p className="text-sm text-slate-400">
                  좌측에서 자산 정보를 입력한 후<br />
                  &apos;무료로 AI 자산진단 받기&apos; 버튼을 누르세요
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  {[
                    { icon: "🏦", title: "ISA 분석", desc: "세제 혜택 최적화" },
                    { icon: "🏢", title: "IRP 분석", desc: "노후 준비 현황" },
                    { icon: "📈", title: "ETF 분석", desc: "포트폴리오 진단" },
                    { icon: "💰", title: "예적금 분석", desc: "수익률 비교" },
                  ].map((item) => (
                    <div key={item.title} className="bg-slate-50 rounded-xl p-3">
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="text-sm font-semibold text-slate-700">{item.title}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AnalysisResult
              content={result}
              isStreaming={isStreaming}
              error={error}
              assetSummary={{
                isa: isaTotal,
                irp: irpTotal,
                etf: etfTotal,
                deposit: depositTotal,
                total: totalAssets(),
              }}
            />

            {result && !isStreaming && (
              <button
                onClick={() => { setResult(""); setError(undefined); }}
                className="btn-secondary w-full"
              >
                결과 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 면책 안내 ─────────────────────────────────────────── */}
      <footer className="mt-12 border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs text-slate-400 text-center">
            본 서비스는 AI 기반 참고 정보 제공 서비스로, 실제 투자 결정에 앞서 전문 금융인과 상담하시기 바랍니다.
            투자에는 원금 손실 위험이 있습니다.
          </p>
        </div>
      </footer>
    </main>
  );
}
