export type ISAType = "일반형" | "서민형" | "농어민형";
export type ISAMode = "투자중개형" | "신탁형";
export type IRPMode = "원리금보장" | "실적배당" | "혼합";
export type DepositType = "예금" | "적금";

export interface ISAAccount {
  id: string;
  type: ISAType;
  mode: ISAMode;
  balance: number;
  annualLimit: number;
  expiryYear: number;
}

export interface IRPAccount {
  id: string;
  balance: number;
  mode: IRPMode;
  expectedRetirementAge: number;
  monthlyContribution: number;
}

export interface ETFHolding {
  id: string;
  name: string;
  ticker: string;
  quantity: number;
  currentPrice: number;
  avgPrice: number;
}

export interface DepositAccount {
  id: string;
  bank: string;
  type: DepositType;
  balance: number;
  interestRate: number;
  maturityDate: string;
  monthlyAmount?: number;
}

export interface UserProfile {
  age: number;
  annualIncome: number;
  investmentGoal: "노후준비" | "내집마련" | "자녀교육" | "여유자금" | "기타";
  riskTolerance: "안정형" | "안정추구형" | "위험중립형" | "적극투자형" | "공격투자형";
}

export interface AssetData {
  profile: UserProfile;
  isa: ISAAccount[];
  irp: IRPAccount[];
  etf: ETFHolding[];
  deposits: DepositAccount[];
}
