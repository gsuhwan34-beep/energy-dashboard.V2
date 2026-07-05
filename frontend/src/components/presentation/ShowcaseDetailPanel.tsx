import type { ShowcaseDetailContent, TextSegment } from './showcaseContent'

function Line({ segments, variant }: { segments: TextSegment[]; variant: 'crisis' | 'innovation' }) {
  const hi = variant === 'crisis' ? 'text-red-600' : 'text-emerald-700'
  return (
    <p className="text-[11px] md:text-xs text-slate-600 leading-snug">
      {segments.map((s, i) =>
        s.highlight ? (
          <span key={i} className={`${hi} font-bold`}>
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  )
}

function Column({
  variant,
  title,
  items,
}: {
  variant: 'crisis' | 'innovation'
  title: string
  items: { headline: string; points: TextSegment[][] }[]
}) {
  const isCrisis = variant === 'crisis'
  return (
    <div
      className={`flex flex-col rounded-xl border overflow-hidden min-h-0 ${
        isCrisis ? 'border-red-200 bg-white' : 'border-emerald-200 bg-white'
      }`}
    >
      <div
        className={`px-3 py-2 shrink-0 flex items-center gap-1.5 text-xs font-bold ${
          isCrisis ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
        }`}
      >
        <span>{isCrisis ? '⚠️' : '✨'}</span>
        <span className="leading-tight">{title}</span>
      </div>
      <div className="p-3 space-y-2.5 flex-1 min-h-0">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[11px] md:text-xs font-bold text-slate-900 leading-tight mb-1">{item.headline}</p>
            {item.points.slice(0, 1).map((line, j) => (
              <Line key={j} segments={line} variant={variant} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShowcaseDetailPanel({ detail }: { detail: ShowcaseDetailContent }) {
  return (
    <div className="flex flex-col gap-2.5 h-full min-h-0">
      <div className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">핵심 한 줄</p>
        <p className="text-sm md:text-base font-black text-slate-900 leading-snug">&ldquo;{detail.punchline}&rdquo;</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
        <Column variant="crisis" title={detail.crisisTitle} items={detail.crisisItems} />
        <Column variant="innovation" title={detail.innovationTitle} items={detail.innovationItems} />
      </div>
    </div>
  )
}
