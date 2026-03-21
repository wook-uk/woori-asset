"use client";

import { useEffect, useState } from "react";

interface Props {
  isa: number;
  irp: number;
  etf: number;      // 만원 단위
  deposit: number;
}

const CATEGORIES = [
  {
    key: "tax",
    label: "절세자산",
    sub: "ISA · IRP",
    bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    pill: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "safe",
    label: "안전자산",
    sub: "예금 · 적금",
    bar: "bg-gradient-to-r from-blue-400 to-blue-500",
    dot: "bg-blue-500",
    text: "text-blue-600",
    pill: "bg-blue-50 text-blue-700",
  },
  {
    key: "risk",
    label: "위험자산",
    sub: "ETF",
    bar: "bg-gradient-to-r from-orange-400 to-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-600",
    pill: "bg-orange-50 text-orange-700",
  },
] as const;

export default function AssetAllocationChart({ isa, irp, etf, deposit }: Props) {
  const [animated, setAnimated] = useState(false);

  const amounts: Record<string, number> = {
    tax: isa + irp,
    safe: deposit,
    risk: etf,
  };
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  // 값이 바뀔 때마다 애니메이션 재실행
  useEffect(() => {
    setAnimated(false);
    const id = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(id);
  }, [total]);

  if (total === 0) return null;

  const items = CATEGORIES.map((cat) => ({
    ...cat,
    amount: amounts[cat.key],
    pct: (amounts[cat.key] / total) * 100,
  }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title mb-0">
          <span className="text-xl">📊</span> 자산 배분 구조
        </h2>
        <div className="text-right">
          <div className="text-xs text-slate-400">총 자산</div>
          <div className="text-sm font-bold text-slate-800">
            {total.toLocaleString()}만원
          </div>
        </div>
      </div>

      {/* 개별 막대 */}
      <div className="space-y-4 mb-5">
        {items.map((item) => (
          <div key={item.key}>
            {/* 레이블 행 */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                <span className="text-xs text-slate-400">{item.sub}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400">
                  {item.amount.toLocaleString()}만원
                </span>
                <span className={`text-sm font-bold tabular-nums ${item.text}`}>
                  {item.pct.toFixed(1)}%
                </span>
              </div>
            </div>
            {/* 막대 트랙 */}
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${item.bar} shadow-sm transition-all duration-700 ease-out`}
                style={{
                  width: animated ? `${item.pct}%` : "0%",
                  minWidth: animated && item.pct > 0 ? "6px" : "0px",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 구분선 */}
      <div className="border-t border-slate-100 pt-4">
        {/* 스택 바 */}
        <div className="text-xs text-slate-400 mb-2">전체 비율</div>
        <div className="h-4 rounded-full overflow-hidden flex gap-0.5 bg-slate-100 p-0.5">
          {items.map((item, idx) => (
            <div
              key={item.key}
              className={`h-full rounded-full ${item.bar} transition-all duration-700 ease-out`}
              style={{
                width: animated ? `${item.pct}%` : "0%",
                transitionDelay: `${idx * 80}ms`,
                minWidth: animated && item.pct > 0 ? "8px" : "0px",
              }}
              title={`${item.label} ${item.pct.toFixed(1)}%`}
            />
          ))}
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {items.map((item) => (
            <span key={item.key} className={`tag ${item.pill}`}>
              {item.label} {item.pct.toFixed(0)}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
