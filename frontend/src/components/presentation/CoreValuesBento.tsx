import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, ChevronLeft, type LucideIcon } from 'lucide-react'
import { SHOWCASE_TABS } from './showcaseContent'
import { ShowcaseDetailPanel } from './ShowcaseDetailPanel'

function TabButton({
  tab,
  isActive,
  onSelect,
}: {
  tab: (typeof SHOWCASE_TABS)[number]
  isActive: boolean
  onSelect: () => void
}) {
  const Icon = tab.icon as LucideIcon
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 md:p-4 rounded-xl transition-all duration-300 text-left shrink-0 md:shrink md:w-full border ${
        isActive
          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 md:scale-[1.02]'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div
        className={`p-2 rounded-lg shrink-0 ${
          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <span className={`font-bold text-sm md:text-base ${isActive ? 'text-white' : 'text-slate-800'}`}>
        {tab.title}
      </span>
    </button>
  )
}

function MainHeroImage({ tab }: { tab: (typeof SHOWCASE_TABS)[number] }) {
  const [src, setSrc] = useState(tab.mainImageLocal ?? tab.mainImage)

  useEffect(() => {
    setSrc(tab.mainImageLocal ?? tab.mainImage)
  }, [tab])

  const handleError = useCallback(() => {
    if (tab.mainImageLocal && src === tab.mainImageLocal) {
      setSrc(tab.mainImage)
    }
  }, [tab.mainImage, tab.mainImageLocal, src])

  return (
    <motion.img
      key={src + tab.id}
      src={src}
      alt={tab.title}
      onError={handleError}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 w-full h-full object-cover"
    />
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-8"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-3 p-4 md:p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
              <Icon size={22} />
            </div>
            <h3 className="text-base md:text-xl font-bold text-slate-900 truncate">{tab.detailTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full shrink-0 transition-colors"
            aria-label="닫기"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          <div className="relative lg:w-[45%] h-44 sm:h-52 lg:h-auto shrink-0 lg:shrink bg-slate-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={tab.slideImage}
                src={tab.slideImage}
                alt={`${tab.title} 부연 설명`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-white/80 pointer-events-none" />
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[10px] text-slate-600 border border-slate-200 shadow-sm font-medium">
              {activeTab + 1} / {SHOWCASE_TABS.length}
            </div>
          </div>

          <div className="lg:w-[55%] flex flex-col min-h-0 bg-slate-50">
            <div className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <ShowcaseDetailPanel detail={tab.detail} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-2 p-4 md:px-8 border-t border-slate-200 bg-white">
              <button
                type="button"
                disabled={activeTab === 0}
                onClick={() => onChangeTab(activeTab - 1)}
                className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={18} /> 이전
              </button>
              {activeTab < SHOWCASE_TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onChangeTab(activeTab + 1)}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  다음 ({SHOWCASE_TABS[activeTab + 1].title})
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-800"
                >
                  발표 계속하기
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

  return (
    <div className="-mx-4 md:-mx-6 -mb-4 md:-mb-6 flex flex-col md:flex-row min-h-[520px] md:min-h-[calc(100vh-11rem)] bg-slate-50 text-slate-900 overflow-hidden rounded-b-2xl font-sans">
      <div className="md:w-[30%] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-white z-10">
        <div className="px-4 md:px-8 pt-5 md:pt-8 pb-3 shrink-0">
          <div className="text-blue-600 font-bold tracking-widest text-[10px] md:text-sm mb-1">MVP GRID LAB</div>
          <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">핵심 가치 5선</h1>
          <p className="text-slate-500 text-xs mt-1 hidden md:block">클릭 → 3초 스캔용 상세 슬라이드</p>
        </div>
        <div className="flex md:flex-col gap-2 p-3 md:p-6 md:pt-2 overflow-x-auto md:overflow-visible">
          {SHOWCASE_TABS.map((t) => (
            <TabButton
              key={t.id}
              tab={t}
              isActive={activeTab === t.id}
              onSelect={() => setActiveTab(t.id)}
            />
          ))}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        className="flex-1 relative flex flex-col min-h-[360px] md:min-h-0 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 bg-white"
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsModalOpen(true)
          }
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <MainHeroImage key={activeTab} tab={tab} />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/95" />
        </div>

        <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] z-20">
          <div className="bg-blue-600 text-white px-5 py-3 md:px-8 md:py-4 rounded-full flex items-center gap-2 md:gap-3 font-extrabold text-sm md:text-lg shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Search size={20} className="md:w-6 md:h-6" />
            상세 설명 슬라이드 보기
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-text-${activeTab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="relative mt-auto z-10 m-4 md:m-6 p-5 md:p-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg"
          >
            <p className="text-blue-600 font-mono text-xs md:text-sm mb-2 font-semibold">
              0{activeTab + 1} · 핵심 가치
            </p>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 md:mb-3">
              {tab.title}
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-2xl leading-relaxed border-l-4 border-blue-500 pl-3 md:pl-4">
              {tab.shortDesc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

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
