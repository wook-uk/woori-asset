"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";

// ─── marked 설정 ─────────────────────────────────────────────
marked.use({ breaks: true, gfm: true });

// ─── 전처리 ──────────────────────────────────────────────────
function preprocess(text: string): string {
  return (
    text
      .replace(/~~/g, "~")
      .replace(/(\w)\^(\d)/g, "$1\\^$2")
      .replace(/\$\$[\s\S]+?\$\$/g, (m) => m.slice(2, -2))
      .replace(/\$[^$\n]+?\$/g, (m) => m.slice(1, -1))
  );
}

// ─── 마크다운 → HTML ─────────────────────────────────────────
function toHtml(text: string): string {
  try {
    const result = marked.parse(preprocess(text));
    return typeof result === "string" ? result : "";
  } catch {
    return `<p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
  }
}

// ─── 섹션 파싱 ───────────────────────────────────────────────
interface Section {
  type: "summary" | "analysis" | "recommendation" | "warning" | "general";
  icon?: string;
  title?: string;
  html: string;
}

const SECTION_PATTERNS: Array<{ re: RegExp; type: Section["type"]; icon: string }> = [
  { re: /종합|요약|진단|현황/,             type: "summary",        icon: "📊" },
  { re: /분석|평가/,                       type: "analysis",       icon: "🔍" },
  { re: /추천|제안|전략|방향|개선|액션/,   type: "recommendation", icon: "💡" },
  { re: /주의|위험|리스크|경고/,           type: "warning",        icon: "⚠️" },
];

function classifyTitle(title: string): { type: Section["type"]; icon?: string } {
  for (const { re, type, icon } of SECTION_PATTERNS) {
    if (re.test(title)) return { type, icon };
  }
  return { type: "general" };
}

function getSectionStyle(type: Section["type"]): string {
  switch (type) {
    case "summary":        return "border-l-4 border-blue-400 bg-blue-50/50";
    case "analysis":       return "border-l-4 border-purple-400 bg-purple-50/30";
    case "recommendation": return "border-l-4 border-green-400 bg-green-50/30";
    case "warning":        return "border-l-4 border-amber-400 bg-amber-50/30";
    default:               return "";
  }
}

function parseIntoSections(raw: string): Section[] {
  if (!raw) return [];

  const lines = raw.split("\n");
  const sections: Section[] = [];
  let body: string[] = [];
  let title: string | undefined;
  let type: Section["type"] = "general";
  let icon: string | undefined;

  const flush = () => {
    const text = body.join("\n").trim();
    if (!text) return;
    sections.push({ type, icon, title, html: toHtml(text) });
  };

  for (const line of lines) {
    const m = line.match(/^#{1,4}\s+(.+)$/);
    if (m) {
      flush();
      body = [];
      title = m[1].trim();
      ({ type, icon } = classifyTitle(title));
    } else {
      body.push(line);
    }
  }
  flush();

  return sections.filter((s) => s.html.replace(/<[^>]+>/g, "").trim().length > 0);
}

// ─── 타입 ────────────────────────────────────────────────────
interface AssetSummary {
  isa: number;
  irp: number;
  etf: number;
  deposit: number;
  total: number;
}

interface AnalysisResultProps {
  content: string;
  isStreaming: boolean;
  error?: string;
  assetSummary?: AssetSummary;
}

// ─── 컴포넌트 ────────────────────────────────────────────────
export default function AnalysisResult({
  content,
  isStreaming,
  error,
  assetSummary,
}: AnalysisResultProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [content, isStreaming]);

  const downloadPDF = async () => {
    if (!captureRef.current || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - 2 * margin;
      const usableH = pageH - 2 * margin;

      // 캔버스 → PDF 좌표 변환 비율
      const pxPerMM = canvas.width / usableW;
      const pageHeightPx = usableH * pxPerMM;
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const srcY = Math.round(page * pageHeightPx);
        const srcH = Math.min(Math.round(pageHeightPx), canvas.height - srcY);
        if (srcH <= 0) break;

        // 페이지 크기만큼 캔버스 슬라이스
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const pageImgH = srcH / pxPerMM;
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", margin, margin, usableW, pageImgH);
      }

      const today = new Date()
        .toLocaleDateString("ko-KR")
        .replace(/\. /g, "")
        .replace(".", "");
      pdf.save(`AI자산진단_${today}.pdf`);
    } catch (err) {
      console.error("PDF 생성 오류:", err);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (error) {
    return (
      <div className="card border-red-100 bg-red-50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-800 mb-1">오류가 발생했습니다</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content && !isStreaming) return null;

  const sections = parseIntoSections(content);
  const dateStr = new Date().toLocaleDateString("ko-KR");

  return (
    <div className="space-y-4" ref={captureRef}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-800">AI 자산 진단 결과</h2>
          {isStreaming && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">분석 중...</span>
            </div>
          )}
        </div>

        {/* PDF 다운로드 버튼 */}
        {!isStreaming && content && (
          <button
            onClick={downloadPDF}
            disabled={isPdfLoading}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPdfLoading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF 저장
              </>
            )}
          </button>
        )}
      </div>

      {/* 리포트 메타 (날짜 + 자산 요약 — PDF에 포함) */}
      {content && !isStreaming && (
        <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-medium text-slate-600">진단일: {dateStr}</span>
          {assetSummary && assetSummary.total > 0 && (
            <>
              {assetSummary.isa > 0 && <span>ISA {assetSummary.isa.toLocaleString()}만원</span>}
              {assetSummary.irp > 0 && <span>IRP {assetSummary.irp.toLocaleString()}만원</span>}
              {assetSummary.etf > 0 && <span>ETF {assetSummary.etf.toLocaleString()}만원</span>}
              {assetSummary.deposit > 0 && <span>예적금 {assetSummary.deposit.toLocaleString()}만원</span>}
              <span className="font-semibold text-slate-700">
                총 {assetSummary.total.toLocaleString()}만원
              </span>
            </>
          )}
        </div>
      )}

      {/* 섹션별 카드 */}
      {sections.map((section, idx) => (
        <div
          key={idx}
          className={`card overflow-hidden min-w-0 ${getSectionStyle(section.type)}`}
        >
          {section.title && (
            <div className="flex items-center gap-2 mb-3">
              {section.icon && <span className="text-xl flex-shrink-0">{section.icon}</span>}
              <h3 className="font-bold text-slate-800 min-w-0 break-keep">{section.title}</h3>
            </div>
          )}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        </div>
      ))}

      {/* 스트리밍 로딩 */}
      {isStreaming && (
        <div className="card animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
