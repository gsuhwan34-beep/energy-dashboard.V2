import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, ChevronLeft, Sparkles, type LucideIcon } from 'lucide-react'
import { SHOWCASE_TABS, ACCENT_STYLES, type ShowcaseTab } from './showcaseContent'
import { ShowcaseDetailPanel } from './ShowcaseDetailPanel'

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
      className={`group flex items-start gap-3 p-3 md:p-3.5 rounded-xl transition-all duration-200 text-left shrink-0 md:shrink w-full border ${
        isActive
          ? `${accent.bg} border-transparent text-white shadow-md`
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-xs font-black ${
          isActive ? 'bg-white/25 text-white' : `${accent.badge}`
        }`}
      >
        {isActive ? <Icon size={16} /> : String(index + 1).padStart(2, '0')}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
          {tab.title}
        </p>
        <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
          {tab.tagline}
        </p>
      </div>
    </button>
  )
}

function HeroImagePanel({ tab }: { tab: ShowcaseTab }) {
  const accent = ACCENT_STYLES[tab.accent]
  const isContained = tab.heroStyle === 'contained'

  if (isContained) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} flex items-center justify-center p-6 md:p-10`}>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-lg"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-2xl blur-lg" />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/80 bg-white">
            <img
              src={tab.mainImage}
              alt={tab.imageCaption}
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="mt-3 text-center text-[11px] md:text-xs text-slate-500 font-medium px-2">
            {tab.imageCaption}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <motion.img
        key={tab.mainImage}
        src={tab.mainImage}
        alt={tab.title}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${accent.badge} shadow-sm`}>
          <Sparkles size={10} />
          {tab.tagline}
        </span>
      </div>
    </>
  )
}

function SlideImagePanel({ tab }: { tab: ShowcaseTab }) {
  const isNews = tab.id === 4

  return (
    <div className="relative h-full min-h-[200px] lg:min-h-0 bg-slate-100 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <img
          src={tab.slideImage}
          alt={tab.imageCaption}
          className={`w-full h-full ${isNews ? 'object-cover object-top' : 'object-cover'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/50 via-transparent to-transparent lg:from-transparent lg:to-white/90 pointer-events-none" />
      </div>
      <div className="shrink-0 px-4 py-3 bg-white border-t border-slate-200">
        <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed font-medium">
          {tab.imageCaption}
        </p>
        {isNews && (
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">
            국회 기획재정위원회 업무보고 · 원화 스테이블코인
          </p>
        )}
      </div>
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="h-1 bg-slate-100 shrink-0">
          <div
            className={`h-full ${accent.bg} transition-all duration-300`}
            style={{ width: `${((activeTab + 1) / SHOWCASE_TABS.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center gap-3 px-4 md:px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`${accent.bg} p-2 rounded-xl text-white shrink-0 shadow-sm`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${accent.text}`}>
                {activeTab + 1} / {SHOWCASE_TABS.length} · {tab.tagline}
              </p>
              <h3 className="text-sm md:text-lg font-bold text-slate-900 truncate">{tab.detailTitle}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full shrink-0 transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          <div className="lg:w-[42%] shrink-0 lg:shrink border-b lg:border-b-0 lg:border-r border-slate-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-48 sm:h-56 lg:h-full"
              >
                <SlideImagePanel tab={tab} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:w-[58%] flex flex-col min-h-0 bg-slate-50/80">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <ShowcaseDetailPanel detail={tab.detail} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-2 px-4 md:px-6 py-3.5 border-t border-slate-200 bg-white">
              <button
                type="button"
                disabled={activeTab === 0}
                onClick={() => onChangeTab(activeTab - 1)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-25 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={18} /> 이전
              </button>
              {activeTab < SHOWCASE_TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onChangeTab(activeTab + 1)}
                  className={`flex items-center gap-1.5 text-sm font-semibold ${accent.text} hover:opacity-80 transition-opacity`}
                >
                  다음 · {SHOWCASE_TABS[activeTab + 1].title}
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  발표 계속하기 ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CoreValuesBento() {
  const [activeTab, setActiveTab] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const tab = SHOWCASE_TABS[activeTab]
  const accent = ACCENT_STYLES[tab.accent]

  return (
    <div className="flex flex-col lg:flex-row min-h-[580px] md:min-h-[calc(100vh-10rem)] bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
        <div className="px-5 md:px-6 pt-6 pb-4 shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">MVP Grid Lab</p>
              <p className="text-xs text-slate-400">KMU Capstone · 2026</p>
            </div>
          </div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">핵심 가치 5선</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            탭 선택 후 화면 클릭 → 상세 슬라이드
          </p>
        </div>

        <nav className="flex lg:flex-col gap-2 p-3 md:p-4 overflow-x-auto lg:overflow-visible">
          {SHOWCASE_TABS.map((t, i) => (
            <TabButton
              key={t.id}
              tab={t}
              index={i}
              isActive={activeTab === t.id}
              onSelect={() => setActiveTab(t.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Hero */}
      <main
        role="button"
        tabIndex={0}
        className="flex-1 relative flex flex-col min-h-[400px] lg:min-h-0 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-inset"
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsModalOpen(true)
          }
        }}
      >
        <div className="absolute inset-0 overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} className="absolute inset-0">
              <HeroImagePanel tab={tab} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
          <div className={`${accent.bg} text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold text-sm md:text-base shadow-xl`}>
            <Search size={18} />
            상세 슬라이드 열기
          </div>
        </div>

        {/* Bottom card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 mt-auto m-4 md:m-6"
          >
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl p-5 md:p-7 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${accent.badge}`}>
                  0{activeTab + 1}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {tab.tagline}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl xl:text-3xl font-black text-slate-900 leading-tight mb-2">
                {tab.title}
              </h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {tab.shortDesc}
              </p>
              <p className={`mt-3 text-xs font-semibold ${accent.text} flex items-center gap-1`}>
                클릭하여 상세 보기
                <ChevronRight size={14} />
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <DetailModal
            activeTab={activeTab}
            onClose={() => setIsModalOpen(false)}
            onChangeTab={setActiveTab}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
