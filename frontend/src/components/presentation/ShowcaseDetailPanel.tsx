import { FileText } from 'lucide-react'
import type { ShowcaseTab } from './showcaseContent'
import { ACCENT_STYLES } from './showcaseContent'

interface SummaryProps {
  tab: ShowcaseTab
  onOpenReport: () => void
}

export function ShowcaseSummaryPanel({ tab, onOpenReport }: SummaryProps) {
  const accent = ACCENT_STYLES[tab.accent]

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {tab.modalPhoto && (
        <div className="shrink-0 h-[100px] flex items-center justify-center rounded-xl bg-slate-100 border border-indigo-100 p-2">
          <img
            src={tab.modalPhoto}
            alt={tab.imageCaption}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <ul className="flex-1 min-h-0 flex flex-col justify-center gap-3">
        {tab.summaryBullets.map((bullet, i) => {
          const Icon = bullet.icon
          return (
            <li key={i} className="flex items-start gap-3">
              <div
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accent.badge}`}
              >
                <Icon size={22} strokeWidth={2} />
              </div>
              <p className="text-sm text-slate-700 leading-snug pt-2 font-medium">
                <span className="text-slate-400 mr-1.5">•</span>
                {bullet.text}
              </p>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={onOpenReport}
        className={`shrink-0 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-opacity hover:opacity-90 ${accent.bg}`}
      >
        <FileText size={18} />
        📄 관련 산업 리포트 읽기
      </button>
    </div>
  )
}

interface ReportProps {
  tab: ShowcaseTab
}

export function ShowcaseReportPanel({ tab }: ReportProps) {
  return (
    <article className="space-y-4">
      {tab.reportSections.map((section, i) => (
        <section key={i}>
          {section.heading && (
            <h4 className="text-sm font-bold text-slate-900 mb-2">{section.heading}</h4>
          )}
          {section.paragraphs.map((p, j) => (
            <p key={j} className="text-[13px] text-slate-700 leading-[1.85] mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  )
}
