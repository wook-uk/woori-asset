"use client";

import { useState, useMemo } from "react";

interface Props {
  age: number;
  currentAssets: number; // 만원
}

const RATES = [
  { label: "3%", value: 3 },
  { label: "5%", value: 5 },
  { label: "7%", value: 7 },
];

function formatAmount(manwon: number): string {
  if (manwon >= 10000) {
    const eok = manwon / 10000;
    return eok % 1 === 0 ? `${Math.round(eok)}억원` : `${eok.toFixed(1)}억원`;
  }
  if (manwon === 0) return "0원";
  return `${Math.round(manwon).toLocaleString()}만원`;
}

function formatYAxis(manwon: number): string {
  if (manwon >= 10000) return `${(manwon / 10000).toFixed(0)}억`;
  if (manwon >= 1000) return `${(manwon / 1000).toFixed(0)}천`;
  return `${Math.round(manwon)}`;
}

export default function RetirementSimulator({ age, currentAssets }: Props) {
  const [monthlySavings, setMonthlySavings] = useState(100);
  const [rateIdx, setRateIdx] = useState(1);

  const retirementAge = 65;
  const years = Math.max(0, retirementAge - age);
  const annualRate = RATES[rateIdx].value / 100;
  const annualSavings = monthlySavings * 12;

  const yearlyData = useMemo(() => {
    const data: { age: number; assets: number }[] = [];
    let assets = currentAssets;
    for (let y = 0; y <= years; y++) {
      data.push({ age: age + y, assets: Math.round(assets) });
      assets = (assets + annualSavings) * (1 + annualRate);
    }
    return data;
  }, [currentAssets, annualSavings, annualRate, age, years]);

  const finalAssets = yearlyData[yearlyData.length - 1]?.assets ?? 0;

  if (age >= retirementAge) return null;

  // ── SVG 차트 설정 ────────────────────────────────────────
  const W = 380, H = 148;
  const PL = 48, PR = 12, PT = 12, PB = 28;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;
  const n = yearlyData.length;
  const maxV = Math.max(...yearlyData.map((d) => d.assets), 1);

  const toX = (i: number) => PL + (i / Math.max(n - 1, 1)) * plotW;
  const toY = (v: number) => PT + plotH - (v / maxV) * plotH;

  const polyPoints = yearlyData.map((d, i) => `${toX(i)},${toY(d.assets)}`).join(" ");
  const areaPoints = `${PL},${PT + plotH} ${polyPoints} ${PL + plotW},${PT + plotH}`;

  const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(t * maxV), y: toY(t * maxV) }));

  const step = Math.max(1, Math.ceil(n / 5));
  const xTicks = yearlyData.filter((_, i) => i % step === 0 || i === n - 1);

  return (
    <div className="card">
      <h2 className="section-title">
        <span className="text-2xl">🏖️</span> 노후 시뮬레이터
      </h2>

      {/* 핵심 숫자 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 text-center">
        <p className="text-xs text-slate-500 mb-1">이대로 가면 65세에</p>
        <p className="text-3xl font-bold text-blue-600">{formatAmount(finalAssets)}</p>
        <p className="text-xs text-slate-400 mt-1">
          {years}년 후 · 연 {RATES[rateIdx].value}% 수익률 가정
        </p>
      </div>

      {/* 입력 컨트롤 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            월 저축액 <span className="text-slate-400">(만원)</span>
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(Math.max(0, Number(e.target.value)))}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">기대 수익률</label>
          <div className="flex gap-1.5">
            {RATES.map((r, i) => (
              <button
                key={r.value}
                onClick={() => setRateIdx(i)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rateIdx === i
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG 라인 차트 */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 240 }}>
        <defs>
          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y축 그리드 + 레이블 */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PL - 4} y={t.y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
              {formatYAxis(t.v)}
            </text>
          </g>
        ))}

        {/* X축 레이블 */}
        {xTicks.map((d) => {
          const i = yearlyData.indexOf(d);
          return (
            <text key={d.age} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {d.age}세
            </text>
          );
        })}

        {/* 영역 채우기 */}
        <polygon points={areaPoints} fill="url(#retGrad)" />

        {/* 라인 */}
        <polyline
          points={polyPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 끝 점 */}
        {n > 0 && (
          <circle
            cx={toX(n - 1)}
            cy={toY(yearlyData[n - 1].assets)}
            r={4}
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>

      <p className="text-xs text-slate-400 mt-2 text-center">
        현재 자산 {formatAmount(currentAssets)} · 월 {monthlySavings.toLocaleString()}만원 저축 ·
        세금·물가 미반영
      </p>
    </div>
  );
}
