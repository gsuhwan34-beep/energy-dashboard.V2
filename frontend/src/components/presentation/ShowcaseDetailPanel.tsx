import type { DetailItem, ShowcaseDetailContent, TextSegment } from './showcaseContent'

function HighlightLine({
  segments,
  variant,
}: {
  segments: TextSegment[]
  variant: 'crisis' | 'innovation'
}) {
  const accent = variant === 'crisis' ? 'text-red-600' : 'text-emerald-600'
  return (
    <p className="text-slate-600 text-sm leading-relaxed">
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
    <div
      className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm ${
        isCrisis ? 'border border-red-100' : 'border border-emerald-100'
      }`}
    >
      <div
        className={`flex items-center gap-2 font-black text-base md:text-lg mb-4 border-b pb-2 ${
          isCrisis ? 'text-red-600 border-red-100' : 'text-emerald-600 border-emerald-100'
        }`}
      >
        <span aria-hidden>{isCrisis ? '⚠️' : '✨'}</span>
        <span>{title}</span>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <h5 className="text-slate-900 font-extrabold text-sm md:text-base mb-1">{item.headline}</h5>
            <div className="space-y-2">
              {item.points.map((line, j) => (
                <HighlightLine key={j} segments={line} variant={variant} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShowcaseDetailPanel({ detail }: { detail: ShowcaseDetailContent }) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="bg-blue-50 border border-blue-200 p-5 md:p-6 rounded-2xl shadow-sm">
        <p className="text-blue-600 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-1">
          💡 핵심 가치 (Core Value)
        </p>
        <p className="text-slate-900 font-black text-base md:text-xl leading-relaxed">
          &ldquo;{detail.punchline}&rdquo;
        </p>
      </div>

      <DetailBlock variant="crisis" title={detail.crisisTitle} items={detail.crisisItems} />
      <DetailBlock variant="innovation" title={detail.innovationTitle} items={detail.innovationItems} />
    </div>
  )
}
