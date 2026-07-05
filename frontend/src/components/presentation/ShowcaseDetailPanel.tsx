import type { DetailItem, ShowcaseDetailContent, TextSegment } from './showcaseContent'

function HighlightLine({
  segments,
  variant,
}: {
  segments: TextSegment[]
  variant: 'crisis' | 'innovation'
}) {
  const accent = variant === 'crisis' ? 'text-red-600' : 'text-emerald-700'
  return (
    <p className="text-slate-600 text-[13px] md:text-sm leading-[1.75] pl-3 border-l-2 border-slate-200">
      {segments.map((s, i) =>
        s.highlight ? (
          <span key={i} className={`${accent} font-bold`}>
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  )
}

function DetailBlock({
  variant,
  title,
  items,
}: {
  variant: 'crisis' | 'innovation'
  title: string
  items: DetailItem[]
}) {
  const isCrisis = variant === 'crisis'
  return (
    <section
      className={`rounded-2xl overflow-hidden shadow-sm ${
        isCrisis
          ? 'bg-white border border-red-100'
          : 'bg-white border border-emerald-100'
      }`}
    >
      <div
        className={`px-5 py-3.5 flex items-center gap-2 font-bold text-sm md:text-base ${
          isCrisis
            ? 'bg-red-50 text-red-700 border-b border-red-100'
            : 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
        }`}
      >
        <span className="text-base" aria-hidden>
          {isCrisis ? '⚠️' : '✨'}
        </span>
        <span>{title}</span>
      </div>
      <div className="p-5 space-y-5">
        {items.map((item, i) => (
          <div key={i}>
            <h5 className="text-slate-900 font-bold text-sm md:text-[15px] mb-2 leading-snug">
              {item.headline}
            </h5>
            <div className="space-y-2.5">
              {item.points.map((line, j) => (
                <HighlightLine key={j} segments={line} variant={variant} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ShowcaseDetailPanel({ detail }: { detail: ShowcaseDetailContent }) {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 p-5 md:p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <p className="relative text-blue-600 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">
          💡 핵심 가치
        </p>
        <p className="relative text-slate-900 font-black text-base md:text-xl leading-snug">
          &ldquo;{detail.punchline}&rdquo;
        </p>
      </div>

      <DetailBlock variant="crisis" title={detail.crisisTitle} items={detail.crisisItems} />
      <DetailBlock variant="innovation" title={detail.innovationTitle} items={detail.innovationItems} />
    </div>
  )
}
