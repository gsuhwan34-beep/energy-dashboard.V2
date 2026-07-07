import { FileText } from 'lucide-react'
import type { ShowcaseTab, SummarySegment } from './showcaseContent'
import { ACCENT_STYLES } from './showcaseContent'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

function SegmentSpan({ segment, accentText, accentBoldText }: { segment: SummarySegment; accentText: string; accentBoldText: string }) {
  const className = [
    segment.bold ? `font-bold ${accentBoldText}` : '',
    segment.underline ? 'underline decoration-dotted underline-offset-[3px] cursor-help' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = <span className={className || undefined}>{segment.text}</span>

  if (segment.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={className || undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {segment.text}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] text-left leading-relaxed bg-white text-slate-700 border-slate-200 shadow-lg"
        >
          {segment.tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

function BulletText({ segments, accentText, accentBoldText }: { segments: SummarySegment[]; accentText: string; accentBoldText: string }) {
  return (
    <p className="text-[15px] text-slate-600 leading-relaxed">
      {segments.map((s, i) => (
        <SegmentSpan key={i} segment={s} accentText={accentText} accentBoldText={accentBoldText} />
      ))}
    </p>
  )
}

interface SummaryProps {
  tab: ShowcaseTab
  onOpenReport: () => void
}

export function ShowcaseSummaryPanel({ tab, onOpenReport }: SummaryProps) {
  const accent = ACCENT_STYLES[tab.accent]

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {tab.modalPhoto && (
        <div className="shrink-0 min-h-[min(280px,36vh)] max-h-[min(360px,42vh)] flex items-center justify-center rounded-xl bg-slate-100 border border-indigo-100 p-3 mb-1">
          <img
            src={tab.modalPhoto}
            alt={tab.imageCaption}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-sm"
          />
        </div>
      )}

      <ul className="flex-1 min-h-0 flex flex-col justify-center gap-4">
        {tab.summaryBullets.map((bullet, i) => {
          const Icon = bullet.icon
          return (
            <li key={i} className="flex items-start gap-3.5">
              <div
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${accent.badge}`}
              >
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="pt-1.5 min-w-0">
                <BulletText segments={bullet.segments} accentText={accent.text} accentBoldText={accent.boldText} />
              </div>
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
        📄상세 보고서 읽기
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
