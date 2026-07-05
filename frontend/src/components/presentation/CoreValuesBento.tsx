import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, Pause, Play, type LucideIcon } from 'lucide-react'
import {
  SHOWCASE_TABS,
  ACCENT_STYLES,
  AUTO_SLIDE_MS,
  type ShowcaseTab,
} from './showcaseContent'
import { ShowcaseDetailPanel } from './ShowcaseDetailPanel'
import { ShowcaseContrastVisual } from './ShowcaseContrastVisual'

function TabButton({
  tab,
  index,
  isActive,
  onSelect,
}: {
  tab: ShowcaseTab
  index: number
  isActive: boolean
  onSelect: () => void
}) {
  const Icon = tab.icon as LucideIcon
  const accent = ACCENT_STYLES[tab.accent]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left shrink-0 lg:shrink w-full border ${
        isActive
          ? `${accent.bg} border-transparent text-white shadow-md`
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-[10px] font-black ${
          isActive ? 'bg-white/25 text-white' : accent.badge
        }`}
      >
        {isActive ? <Icon size={14} /> : String(index + 1).padStart(2, '0')}
      </div>
      <div className="min-w-0">
        <p className={`font-bold text-xs leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
          {tab.title}
        </p>
        <p className={`text-[9px] mt-0.5 truncate ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
          {tab.tagline}
        </p>
      </div>
    </button>
  )
}

function AutoProgressBar({
  activeTab,
  paused,
  resetKey,
}: {
  activeTab: number
  paused: boolean
  resetKey: number
}) {
  const accent = ACCENT_STYLES[SHOWCASE_TABS[activeTab].accent]
  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 z-30">
      <motion.div
        key={`${activeTab}-${resetKey}`}
        className={`h-full ${accent.bg}`}
        initial={{ width: '0%' }}
        animate={{ width: paused ? undefined : '100%' }}
        transition={{ duration: paused ? 0 : AUTO_SLIDE_MS / 1000, ease: 'linear' }}
        style={paused ? { width: '100%' } : undefined}
      />
    </div>
  )
}

function DetailModal({
  activeTab,
  onClose,
  onChangeTab,
}: {
  activeTab: number
  onClose: () => void
  onChangeTab: (idx: number) => void
}) {
  const tab = SHOWCASE_TABS[activeTab]
  if (!tab) return null
  const Icon = tab.icon as LucideIcon
  const accent = ACCENT_STYLES[tab.accent]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4"
    >
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl h-[min(520px,calc(100dvh-2rem))] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`${accent.bg} p-1.5 rounded-lg text-white shrink-0`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-bold uppercase ${accent.text}`}>
                {activeTab + 1}/{SHOWCASE_TABS.length} · {tab.tagline}
              </p>
              <h3 className="text-sm font-bold text-slate-900 truncate">{tab.detailTitle}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4 gap-3 overflow-hidden">
          {tab.modalPhoto ? (
            <div className="shrink-0 flex gap-3 items-stretch h-[88px]">
              <div className="w-[140px] shrink-0 rounded-lg overflow-hidden border border-indigo-200 bg-slate-100">
                <img src={tab.modalPhoto} alt="" className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex-1 min-w-0">
                <ShowcaseContrastVisual tab={tab} variant="strip" />
              </div>
            </div>
          ) : (
            <div className="shrink-0 h-[100px]">
              <ShowcaseContrastVisual tab={tab} variant="strip" />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <ShowcaseDetailPanel detail={tab.detail} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            disabled={activeTab === 0}
            onClick={() => onChangeTab(activeTab - 1)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> 이전
          </button>
          {activeTab < SHOWCASE_TABS.length - 1 ? (
            <button
              type="button"
              onClick={() => onChangeTab(activeTab + 1)}
              className={`flex items-center gap-1 text-xs font-semibold ${accent.text}`}
            >
              다음 <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={onClose} className="text-xs font-semibold text-emerald-600">
              닫기 ✓
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CoreValuesBento() {
  const [activeTab, setActiveTab] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [progressKey, setProgressKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tab = SHOWCASE_TABS[activeTab]
  const accent = ACCENT_STYLES[tab.accent]

  const bumpProgress = useCallback(() => setProgressKey((k) => k + 1), [])

  const goNext = useCallback(() => {
    setActiveTab((prev) => (prev + 1) % SHOWCASE_TABS.length)
    bumpProgress()
  }, [bumpProgress])

  const selectTab = useCallback(
    (id: number) => {
      setActiveTab(id)
      bumpProgress()
    },
    [bumpProgress],
  )

  useEffect(() => {
    if (!autoPlay || isModalOpen) return
    timerRef.current = setInterval(goNext, AUTO_SLIDE_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, isModalOpen, goNext, activeTab, progressKey])

  return (
    <div className="flex flex-col lg:flex-row h-[min(680px,calc(100dvh-9rem))] bg-slate-50 text-slate-900 overflow-hidden">
      <aside className="lg:w-[240px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
        <div className="px-4 pt-4 pb-3 shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-blue-600 uppercase">MVP Grid Lab</p>
                <p className="text-[10px] text-slate-400">KMU · 2026</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAutoPlay((p) => !p)
                bumpProgress()
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label={autoPlay ? '자동 재생 일시정지' : '자동 재생'}
            >
              {autoPlay ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
          <h1 className="text-lg font-black text-slate-900">핵심 가치 5선</h1>
          <p className="text-[10px] text-slate-500 mt-1">6초마다 자동 전환 · 탭 클릭 시 상세</p>
        </div>

        <nav className="flex lg:flex-col gap-1.5 p-2.5 overflow-x-auto lg:overflow-y-auto lg:flex-1">
          {SHOWCASE_TABS.map((t, i) => (
            <TabButton
              key={t.id}
              tab={t}
              index={i}
              isActive={activeTab === t.id}
              onSelect={() => selectTab(t.id)}
            />
          ))}
        </nav>
      </aside>

      <main className="flex-1 relative flex flex-col min-h-[320px] min-w-0">
        <AutoProgressBar activeTab={activeTab} paused={!autoPlay || isModalOpen} resetKey={progressKey} />

        <div
          role="button"
          tabIndex={0}
          className="flex-1 flex flex-col min-h-0 cursor-pointer outline-none"
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsModalOpen(true)
            }
          }}
        >
          <div className="flex-1 min-h-0 p-4 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ShowcaseContrastVisual tab={tab} variant="hero" />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${activeTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="shrink-0 px-4 pb-4"
            >
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${accent.badge}`}>
                    0{activeTab + 1}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase">{tab.tagline}</span>
                </div>
                <h2 className="text-base md:text-lg font-black text-slate-900 leading-tight">{tab.title}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tab.shortDesc}</p>
                <p className={`text-[10px] font-semibold mt-1.5 ${accent.text}`}>
                  탭하여 상세 보기 →
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <DetailModal
            activeTab={activeTab}
            onClose={() => setIsModalOpen(false)}
            onChangeTab={selectTab}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
