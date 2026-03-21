"use client";

import { useEffect, useRef } from "react";
import { marked } from "marked";

// ─── marked 설정 ─────────────────────────────────────────────
// del(~~) 렌더러 override는 v17에서 파싱 파이프라인을 오염시키므로 사용 안 함.
// 전처리 단계에서 ~~ 를 제거하는 것만으로 충분.
marked.use({ breaks: true, gfm: true });

// ─── 전처리 ──────────────────────────────────────────────────
function preprocess(text: string): string {
  return (
    text
      // 1) ~~ → ~ : 숫자 범위 표기 교정 & del 토큰 원천 차단
      .replace(/~~/g, "~")
      // 2) 수식의 ^ 이스케이프: (1.025)^30 같은 패턴이 혹시라도 오파싱되지 않도록
      .replace(/(\w)\^(\d)/g, "$1\\^$2")
      // 3) $ ... $ LaTeX 기호 제거 (AI가 LaTeX를 쓴 경우)
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
    // 파싱 실패 시 텍스트를 p 태그로 감싸서 fallback
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

// ─── 컴포넌트 ────────────────────────────────────────────────
interface AnalysisResultProps {
  content: string;
  isStreaming: boolean;
  error?: string;
}

export default function AnalysisResult({ content, isStreaming, error }: AnalysisResultProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [content, isStreaming]);

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

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div className="min-w-0">
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
      </div>

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
          {/* prose-custom: globals.css에서 overflow/word-break 처리 */}
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
