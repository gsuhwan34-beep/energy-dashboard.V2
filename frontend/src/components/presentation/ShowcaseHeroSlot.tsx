import { ImageIcon } from 'lucide-react'
import type { ShowcaseTab } from './showcaseContent'

export function ShowcaseHeroSlot({ tab }: { tab: ShowcaseTab }) {
  if (tab.heroImage) {
    return (
      <div className="h-full rounded-xl border border-indigo-200 bg-slate-100 flex items-center justify-center p-3 min-h-[200px]">
        <img
          src={tab.heroImage}
          alt={tab.imageCaption}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
        />
      </div>
    )
  }

  return (
    <div className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 flex flex-col items-center justify-center gap-2 px-6 py-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-200/60 flex items-center justify-center">
        <ImageIcon className="text-slate-400" size={28} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-bold text-slate-400">이미지 영역</p>
      <p className="text-xs text-slate-400 text-center leading-relaxed max-w-sm">{tab.imageCaption}</p>
    </div>
  )
}
