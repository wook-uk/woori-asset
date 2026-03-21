"use client";

import type { DepositAccount } from "@/types/asset";

function newDeposit(): DepositAccount {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return {
    id: crypto.randomUUID(),
    bank: "",
    type: "예금",
    balance: 0,
    interestRate: 3.5,
    maturityDate: nextYear.toISOString().slice(0, 10),
  };
}

interface DepositFormProps {
  accounts: DepositAccount[];
  onChange: (accounts: DepositAccount[]) => void;
}

export default function DepositForm({ accounts, onChange }: DepositFormProps) {
  const add = () => onChange([...accounts, newDeposit()]);
  const remove = (id: string) => onChange(accounts.filter((a) => a.id !== id));
  const update = (id: string, partial: Partial<DepositAccount>) =>
    onChange(accounts.map((a) => (a.id === id ? { ...a, ...partial } : a)));

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const avgRate =
    accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.interestRate, 0) / accounts.length
      : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <span className="text-2xl">💰</span> 예금 / 적금
        </h2>
        <button onClick={add} className="btn-secondary">+ 계좌 추가</button>
      </div>

      {accounts.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-0.5">총 잔액</div>
            <div className="text-sm font-bold text-slate-800">
              {totalBalance.toLocaleString()}만원
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-0.5">평균 금리</div>
            <div className="text-sm font-bold text-slate-800">
              {avgRate.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          예적금 계좌가 없으면 클릭하여 추가하세요
        </p>
      )}

      <div className="space-y-3">
        {accounts.map((acc, idx) => (
          <div key={acc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">#{idx + 1}</span>
                <span className={`tag ${acc.type === "예금" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {acc.type}
                </span>
                {acc.bank && (
                  <span className="tag bg-slate-100 text-slate-600">{acc.bank}</span>
                )}
              </div>
              <button onClick={() => remove(acc.id)} className="btn-danger">삭제</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">은행명</label>
                <input
                  type="text"
                  placeholder="예: 국민은행"
                  value={acc.bank}
                  onChange={(e) => update(acc.id, { bank: e.target.value })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">종류</label>
                <select
                  value={acc.type}
                  onChange={(e) => update(acc.id, { type: e.target.value as DepositAccount["type"] })}
                  className="input-base text-sm"
                >
                  <option value="예금">예금</option>
                  <option value="적금">적금</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">잔액 (만원)</label>
                <input
                  type="number"
                  min={0}
                  value={acc.balance}
                  onChange={(e) => update(acc.id, { balance: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">금리 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={acc.interestRate}
                  onChange={(e) => update(acc.id, { interestRate: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">만기일</label>
                <input
                  type="date"
                  value={acc.maturityDate}
                  onChange={(e) => update(acc.id, { maturityDate: e.target.value })}
                  className="input-base text-sm"
                />
              </div>
              {acc.type === "적금" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">월 납입액 (만원)</label>
                  <input
                    type="number"
                    min={0}
                    value={acc.monthlyAmount ?? 0}
                    onChange={(e) => update(acc.id, { monthlyAmount: Number(e.target.value) })}
                    className="input-base text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
