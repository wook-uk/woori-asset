"use client";

import type { ETFHolding } from "@/types/asset";

function newETF(): ETFHolding {
  return {
    id: crypto.randomUUID(),
    name: "",
    ticker: "",
    quantity: 0,
    currentPrice: 0,
    avgPrice: 0,
  };
}

interface ETFFormProps {
  holdings: ETFHolding[];
  onChange: (holdings: ETFHolding[]) => void;
}

export default function ETFForm({ holdings, onChange }: ETFFormProps) {
  const add = () => onChange([...holdings, newETF()]);
  const remove = (id: string) => onChange(holdings.filter((h) => h.id !== id));
  const update = (id: string, partial: Partial<ETFHolding>) =>
    onChange(holdings.map((h) => (h.id === id ? { ...h, ...partial } : h)));

  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0);
  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <span className="text-2xl">📈</span> ETF 보유 현황
        </h2>
        <button onClick={add} className="btn-secondary">+ 종목 추가</button>
      </div>

      {holdings.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-0.5">평가금액</div>
            <div className="text-sm font-bold text-slate-800">
              {totalValue.toLocaleString()}원
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-0.5">매입금액</div>
            <div className="text-sm font-bold text-slate-800">
              {totalCost.toLocaleString()}원
            </div>
          </div>
          <div className={`flex-1 rounded-xl p-3 text-center ${totalReturn >= 0 ? "bg-red-50" : "bg-blue-50"}`}>
            <div className="text-xs text-slate-500 mb-0.5">수익률</div>
            <div className={`text-sm font-bold ${totalReturn >= 0 ? "text-red-600" : "text-blue-600"}`}>
              {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {holdings.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          ETF 보유 종목이 없으면 클릭하여 추가하세요
        </p>
      )}

      <div className="space-y-3">
        {holdings.map((h, idx) => {
          const value = h.quantity * h.currentPrice;
          const cost = h.quantity * h.avgPrice;
          const ret = cost > 0 ? ((value - cost) / cost) * 100 : 0;

          return (
            <div key={h.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">#{idx + 1}</span>
                  {h.name && (
                    <span className="tag bg-blue-100 text-blue-700">{h.name}</span>
                  )}
                  {value > 0 && (
                    <span className={`tag ${ret >= 0 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                      {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                    </span>
                  )}
                </div>
                <button onClick={() => remove(h.id)} className="btn-danger">삭제</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ETF명</label>
                  <input
                    type="text"
                    placeholder="예: TIGER 미국S&P500"
                    value={h.name}
                    onChange={(e) => update(h.id, { name: e.target.value })}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">종목코드 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 360750"
                    value={h.ticker}
                    onChange={(e) => update(h.id, { ticker: e.target.value })}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">보유 수량</label>
                  <input
                    type="number"
                    min={0}
                    value={h.quantity}
                    onChange={(e) => update(h.id, { quantity: Number(e.target.value) })}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">현재가 (원)</label>
                  <input
                    type="number"
                    min={0}
                    value={h.currentPrice}
                    onChange={(e) => update(h.id, { currentPrice: Number(e.target.value) })}
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">평균 매입가 (원)</label>
                  <input
                    type="number"
                    min={0}
                    value={h.avgPrice}
                    onChange={(e) => update(h.id, { avgPrice: Number(e.target.value) })}
                    className="input-base text-sm"
                  />
                </div>
                <div className="flex items-end">
                  {value > 0 && (
                    <div className="w-full bg-white rounded-lg p-2 border border-slate-200">
                      <div className="text-xs text-slate-400">평가금액</div>
                      <div className="text-sm font-bold text-slate-800">{value.toLocaleString()}원</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
