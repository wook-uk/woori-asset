"use client";

import { useState } from "react";
import type { ISAAccount } from "@/types/asset";

const CURRENT_YEAR = new Date().getFullYear();

function newISA(): ISAAccount {
  return {
    id: crypto.randomUUID(),
    type: "일반형",
    mode: "투자중개형",
    balance: 0,
    annualLimit: 2000,
    expiryYear: CURRENT_YEAR + 5,
  };
}

interface ISAFormProps {
  accounts: ISAAccount[];
  onChange: (accounts: ISAAccount[]) => void;
}

export default function ISAForm({ accounts, onChange }: ISAFormProps) {
  const add = () => onChange([...accounts, newISA()]);
  const remove = (id: string) => onChange(accounts.filter((a) => a.id !== id));
  const update = (id: string, partial: Partial<ISAAccount>) =>
    onChange(accounts.map((a) => (a.id === id ? { ...a, ...partial } : a)));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <span className="text-2xl">🏦</span> ISA (개인종합자산관리계좌)
        </h2>
        <button onClick={add} className="btn-secondary">+ 계좌 추가</button>
      </div>

      {accounts.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          ISA 계좌가 없으면 클릭하여 추가하세요
        </p>
      )}

      <div className="space-y-4">
        {accounts.map((acc, idx) => (
          <div key={acc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-600">ISA #{idx + 1}</span>
              <button onClick={() => remove(acc.id)} className="btn-danger">삭제</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">계좌 유형</label>
                <select
                  value={acc.type}
                  onChange={(e) => update(acc.id, { type: e.target.value as ISAAccount["type"] })}
                  className="input-base text-sm"
                >
                  {["일반형", "서민형", "농어민형"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">운용 방식</label>
                <select
                  value={acc.mode}
                  onChange={(e) => update(acc.id, { mode: e.target.value as ISAAccount["mode"] })}
                  className="input-base text-sm"
                >
                  {["투자중개형", "신탁형"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
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
                <label className="block text-xs font-medium text-slate-500 mb-1">연간 납입 한도 (만원)</label>
                <input
                  type="number"
                  min={0}
                  value={acc.annualLimit}
                  onChange={(e) => update(acc.id, { annualLimit: Number(e.target.value) })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">만기 연도</label>
                <input
                  type="number"
                  min={CURRENT_YEAR}
                  value={acc.expiryYear}
                  onChange={(e) => update(acc.id, { expiryYear: Number(e.target.value) })}
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
