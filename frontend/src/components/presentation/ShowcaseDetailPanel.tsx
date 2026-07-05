import type { DetailItem, ShowcaseDetailContent, TextSegment } from './showcaseContent'

function HighlightLine({ segments }: { segments: TextSegment[] }) {
  return (
    <p className="text-slate-300 text-sm md:text-[15px] leading-relaxed pl-3 border-l-2 border-slate-700">
      {segments.map((s, i) =>
        s.highlight ? (
          <span
            key={i}
            className="font-extrabold text-white bg-slate-800/90 px-1 rounded mx-0.5"
          >
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
      className={`p-4 md:p-5 rounded-xl mb-4 last:mb-0 ${
        isCrisis
          ? 'bg-red-950/20 border border-red-900/40'
          : 'bg-emerald-950/20 border border-emerald-900/40'
      }`}
    >
      <h5
        className={`font-bold text-base md:text-lg mb-4 flex items-center gap-2 ${
          isCrisis ? 'text-red-400' : 'text-emerald-400'
        }`}
      >
        <span aria-hidden>{isCrisis ? '⚠️' : '✨'}</span>
        {title}
      </h5>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-white font-semibold text-sm md:text-base mb-2">{item.headline}</p>
            <div className="space-y-2">
              {item.points.map((line, j) => (
                <HighlightLine key={j} segments={line} />
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
    <div className="space-y-4">
      <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-xl">
        <p className="text-[10px] md:text-xs font-bold text-blue-300/80 uppercase tracking-wider mb-2">
          💡 핵심 가치
        </p>
        <p className="text-blue-400 font-extrabold text-base md:text-xl leading-snug">
          &ldquo;{detail.punchline}&rdquo;
        </p>
      </div>

      <DetailBlock variant="crisis" title={detail.crisisTitle} items={detail.crisisItems} />
      <DetailBlock variant="innovation" title={detail.innovationTitle} items={detail.innovationItems} />
    </div>
  )
}
