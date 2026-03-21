"use client";

import type { IRPAccount } from "@/types/asset";

function newIRP(): IRPAccount {
  return {
    id: crypto.randomUUID(),
    balance: 0,
    mode: "원리금보장",
    expectedRetirementAge: 65,
    monthlyContribution: 0,
  };
}

interface IRPFormProps {
  accounts: IRPAccount[];
  onChange: (accounts: IRPAccount[]) => void;
}

export default function IRPForm({ accounts, onChange }: IRPFormProps) {
  const add = () => onChange([...accounts, newIRP()]);
  const remove = (id: string) => onChange(accounts.filter((a) => a.id !== id));
  const update = (id: string, partial: Partial<IRPAccount>) =>
    onChange(accounts.map((a) => (a.id === id ? { ...a, ...partial } : a)));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <span className="text-2xl">🏢</span> IRP (개인형 퇴직연금)
        </h2>
        <button onClick={add} className="btn-secondary">+ 계좌 추가</button>
      </div>

      {accounts.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          IRP 계좌가 없으면 클릭하여 추가하세요
        </p>
      )}

      <div className="space-y-4">
        {accounts.map((acc, idx) => (
          <div key={acc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600">IRP #{idx + 1}</span>
              <button onClick={() => remove(acc.id)} className="btn-danger">삭제</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">운용 방식</label>
                <select
                  value={acc.mode}
                  onChange={(e) => update(acc.id, { mode: e.target.value as IRPAccount["mode"] })}
                  className="input-base text-sm"
                >
                  {["원리금보장", "실적배당", "혼합"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">총 잔액 (만원)</label>
                <input
                  type="number"
                  min={0}
                  value={acc.balance}
                  onChange={(e) => update(acc.id, { balance: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">월 납입액 (만원)</label>
                <input
                  type="number"
                  min={0}
                  value={acc.monthlyContribution}
                  onChange={(e) => update(acc.id, { monthlyContribution: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">예상 수령 나이</label>
                <input
                  type="number"
                  min={55}
                  max={80}
                  value={acc.expectedRetirementAge}
                  onChange={(e) => update(acc.id, { expectedRetirementAge: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
