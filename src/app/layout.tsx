import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 자산진단 | 스마트 자산 분석 서비스",
  description: "ISA, IRP, ETF, 예적금 자산을 AI가 종합 분석해 드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {children}
      </body>
    </html>
  );
}
