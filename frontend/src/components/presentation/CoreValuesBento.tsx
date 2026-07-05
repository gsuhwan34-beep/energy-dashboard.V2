import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, type LucideIcon } from 'lucide-react'
import { SHOWCASE_TABS } from './showcaseContent'
import { TabVisual, ShowcaseStyles } from './ShowcaseVisuals'

const GRID_BG =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0L0 0 0 60 60 60 60 0z' fill='none' stroke='%231E292E' stroke-opacity='0.5' stroke-width='1'/%3E%3C/svg%3E\")"

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
      className={`flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 text-left shrink-0 md:shrink md:w-full ${
        isActive
          ? 'bg-blue-900/30 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)_inset]'
          : 'bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
      }`}
    >
      <div
        className={`p-2 rounded-xl shrink-0 ${
          isActive
            ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]'
            : 'bg-slate-800 text-slate-500'
        }`}
      >
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <span className={`font-bold text-sm md:text-base whitespace-nowrap md:whitespace-normal ${isActive ? 'text-white' : ''}`}>
        {tab.title}
      </span>
    </button>
  )
}

function DetailModal({ activeTab, onClose }: { activeTab: number; onClose: () => void }) {
  const tab = SHOWCASE_TABS[activeTab]
  if (!tab) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative bg-slate-950 w-full max-w-3xl max-h-[88vh] rounded-2xl md:rounded-3xl border border-slate-700 shadow-[0_0_80px_rgba(59,130,246,0.25)] flex flex-col overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors z-10"
          aria-label="닫기"
        >
          <X size={22} />
        </button>

        <div className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-800 pr-14">
          <p className="text-[10px] md:text-xs font-bold text-blue-400 tracking-widest uppercase mb-2">상세 설명</p>
          <h3 className="text-lg md:text-2xl font-bold text-white leading-snug">{tab.detailTitle}</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 py-5 md:py-6 space-y-4">
          {tab.detailParagraphs.map((paragraph, i) => (
            <p key={i} className="text-sm md:text-base text-slate-300 leading-relaxed md:leading-loose">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="shrink-0 px-6 md:px-8 py-4 border-t border-slate-800 bg-slate-900/50">
          <p className="text-[10px] text-slate-500 text-center">
            탭을 닫고 우측 비주얼로 Before/After를 심사위원에게 먼저 보여주세요
          </p>
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
    <div className="-mx-4 md:-mx-6 -mb-4 md:-mb-6 flex flex-col md:flex-row min-h-[580px] md:min-h-[calc(100vh-14rem)] bg-slate-950 text-slate-100 overflow-hidden rounded-b-2xl font-sans">
      <ShowcaseStyles />

      <div className="md:w-[28%] lg:w-[26%] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 shrink-0">
          <div className="text-blue-500 font-bold tracking-widest text-[10px] md:text-sm mb-1">MVP GRID LAB</div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">핵심 가치 5선</h1>
          <p className="text-slate-400 mt-1 text-xs hidden md:block">Before / After 한눈 비교</p>
        </div>

        <div className="flex md:flex-col gap-2 p-3 md:p-5 md:pt-4 overflow-x-auto md:overflow-visible">
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

      <div className="flex-1 flex flex-col min-h-0 bg-[#0B1121] relative overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="flex-1 relative cursor-pointer group min-h-[300px] md:min-h-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsModalOpen(true)
            }
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: GRID_BG }} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center py-4 md:py-6 overflow-y-auto"
            >
              <TabVisual activeTab={activeTab} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px] z-20 pointer-events-none">
            <div className="bg-blue-600 px-5 py-3 md:px-7 md:py-3.5 rounded-full flex items-center gap-2 text-white font-bold text-sm md:text-base shadow-[0_0_30px_rgba(37,99,235,0.8)]">
              <Search size={20} />
              클릭해서 상세 설명 보기
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 bg-slate-900 border-t border-slate-800 px-5 md:px-8 py-4 md:py-5 relative z-10"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-blue-400 font-mono font-bold text-sm opacity-60">0{activeTab + 1}.</span>
              <h2 className="text-base md:text-xl font-extrabold text-white">{tab.title}</h2>
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed pl-0 md:pl-8">{tab.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && <DetailModal activeTab={activeTab} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
