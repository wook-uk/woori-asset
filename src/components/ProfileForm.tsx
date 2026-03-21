"use client";

import type { UserProfile } from "@/types/asset";

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export default function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    onChange({ ...profile, [key]: value });

  return (
    <div className="card">
      <h2 className="section-title">
        <span className="text-2xl">👤</span> 기본 정보
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">나이</label>
          <input
            type="number"
            min={20}
            max={80}
            value={profile.age}
            onChange={(e) => update("age", Number(e.target.value))}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            연 소득 <span className="text-slate-400 text-xs">(만원)</span>
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={profile.annualIncome}
            onChange={(e) => update("annualIncome", Number(e.target.value))}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">투자 목표</label>
          <select
            value={profile.investmentGoal}
            onChange={(e) => update("investmentGoal", e.target.value as UserProfile["investmentGoal"])}
            className="input-base"
          >
            {["노후준비", "내집마련", "자녀교육", "여유자금", "기타"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">투자 성향</label>
          <select
            value={profile.riskTolerance}
            onChange={(e) => update("riskTolerance", e.target.value as UserProfile["riskTolerance"])}
            className="input-base"
          >
            {["안정형", "안정추구형", "위험중립형", "적극투자형", "공격투자형"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
