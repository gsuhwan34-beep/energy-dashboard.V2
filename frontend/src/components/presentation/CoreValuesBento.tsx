import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  Server,
  Network,
  Home,
  Building,
  Zap,
  XCircle,
  FileText,
  CheckCircle,
  Box,
  CircleDollarSign,
  Landmark,
  RefreshCw,
  Search,
  X,
  ShieldAlert,
  Cpu,
  Activity,
  type LucideIcon,
} from 'lucide-react'

const GRID_BG =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0L0 0 0 60 60 60 60 0z' fill='none' stroke='%231E292E' stroke-opacity='0.5' stroke-width='1'/%3E%3C/svg%3E\")"

const TABS = [
  {
    id: 0,
    icon: ShieldCheck,
    title: '단일 장애점(SPOF) 해소',
    desc: '중앙 서버가 없습니다. 서버 다운·해킹으로 인한 정산망 마비와 데이터 위변조 위험을 100% 원천 차단했습니다.',
  },
  {
    id: 1,
    icon: ArrowRightLeft,
    title: '중개인 없는 P2P 직거래',
    desc: '거대 중개 기관 없이, 누구나 생산한 에너지를 투명하게 시장에 내놓고 직거래할 수 있는 진정한 분산 생태계입니다.',
  },
  {
    id: 2,
    icon: Leaf,
    title: 'RE100 인증 프리패스',
    desc: '수개월 걸리던 RE100 인증 과정을 파괴했습니다. 블록체인에 영구 기록된 데이터 자체가 즉각적인 증명서가 됩니다.',
  },
  {
    id: 3,
    icon: Database,
    title: '고품질 데이터의 자산화',
    desc: '오염되지 않은 무결점 오라클 데이터는 단순한 기록을 넘어, 향후 AI 모델 학습에 쓰이는 엄청난 데이터 자산입니다.',
  },
  {
    id: 4,
    icon: Coins,
    title: 'CBDC 연계 차세대 핀테크',
    desc: '스테이블 코인 기반 정산 인프라입니다. 향후 한국은행 CBDC에 연동되어 에너지 핀테크 혁신을 이끕니다.',
  },
] as const

const MODAL_PROOFS: Record<number, string> = {
  0: `// [Hardware RAM Queue Logging]
Network status: OFFLINE
[WARN] Main power loss detected! Switching to Backup Power.
[INFO] Data safely locked in volatile memory (RAM).
[INFO] Preventing physical disk write to avoid manipulation.
Status: SECURED`,

  1: `// [Arbiscan Transaction Receipt]
Transaction Hash: 0x9f8e...2b1a
Status: Success
Block: 12948572
From: [Consumer_Wallet] 0xAbC...123
To: [Prosumer_Wallet] 0xDeF...456
Value: 145.76 WON Tokens
Gas Used: Optimized via L2 Event Logs (0.0001 ETH)`,

  2: `// [Smart Contract Event: Green Energy Proven]
Event: EnergyDataRecorded(address indexed sender, uint256 powerValue)
Sender: 0xEdgeDeviceID_1042
PowerValue (kWh): 1.1205
Timestamp: 1684930129
Verification: VALID (100% On-chain Oracle Match)`,

  3: `// [Isolation Forest AI Alert Trigger]
[WARNING] Abnormal Power Usage Detected!
Current Usage: 10.4W (Expected: < 3.2W)
Deviation Score: 0.94 (Top 1% Outlier)
Action: Firing Telegram Alert API...
Bot Response: OK (Message Delivered to Admin)`,

  4: `// [CBDC Hook Integration Protocol]
Network: BOK Phase II Testnet
Connecting to Smart Contract...
Bridging Local WON Token -> CBDC Deposit Token
Conversion Rate: 1:1 Pegged
Status: READY FOR NATIONAL FINTECH GRID`,
}

function ShowcaseStyles() {
  return (
    <style>{`
      @keyframes showcase-flow-right {
        0% { transform: translateX(-50px); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateX(150px); opacity: 0; }
      }
      @keyframes showcase-flow-up {
        0% { transform: translateY(20px); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
      }
      @keyframes showcase-pulse-red {
        0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 10px rgba(239,68,68,0.8)); }
        50% { opacity: 0.5; transform: scale(0.95); filter: drop-shadow(0 0 2px rgba(239,68,68,0)); }
      }
      @keyframes showcase-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .showcase-flow { animation: showcase-flow-right 2s linear infinite; }
      .showcase-flow-delay { animation: showcase-flow-right 2s linear infinite 1s; }
      .showcase-flow-up { animation: showcase-flow-up 2s ease-in-out infinite; }
      .showcase-pulse-red { animation: showcase-pulse-red 1.5s ease-in-out infinite; }
      .showcase-float { animation: showcase-float 3s ease-in-out infinite; }
    `}</style>
  )
}

function TabVisual({ activeTab }: { activeTab: number }) {
  switch (activeTab) {
    case 0:
      return (
        <div className="relative flex items-center justify-center w-full h-full min-h-[240px]">
          <div className="absolute flex flex-col items-center showcase-pulse-red z-10">
            <Server size={64} className="text-red-500 md:w-20 md:h-20" />
            <ShieldAlert size={32} className="text-red-400 absolute -bottom-3 md:w-10 md:h-10" />
            <div className="text-red-400 font-bold mt-3 text-sm md:text-base">Legacy Central Server</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center showcase-float opacity-80">
            <div className="w-64 h-64 md:w-96 md:h-96 border-[3px] border-dashed border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center relative">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ transform: `rotate(${deg}deg) translateY(-128px) rotate(-${deg}deg)` }}
                >
                  <Network
                    size={32}
                    className="md:w-10 md:h-10 text-cyan-400 bg-slate-900 rounded-full p-2 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 md:bottom-8 px-4 py-1.5 md:px-6 md:py-2 bg-blue-900/40 border border-blue-400 text-blue-300 rounded-full font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(96,165,250,0.3)]">
            Blockchain Node Network Active
          </div>
        </div>
      )

    case 1:
      return (
        <div className="relative flex items-center justify-between w-full max-w-3xl h-full min-h-[240px] px-4 md:px-12 mx-auto">
          <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-600 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
              <Home size={36} className="text-emerald-400 md:w-[50px] md:h-[50px]" />
              <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-emerald-500 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-white">
                + Energy
              </div>
            </div>
            <div className="mt-2 md:mt-4 text-slate-300 font-bold text-sm md:text-lg">Prosumer</div>
          </div>

          <div className="flex flex-col items-center opacity-30 grayscale relative">
            <Building size={40} className="text-slate-500 md:w-[60px] md:h-[60px]" />
            <XCircle size={56} className="text-red-500 absolute -inset-2 md:w-20 md:h-20" />
            <div className="mt-1 md:mt-2 font-bold text-slate-500 text-xs md:text-base">중개 기관 패스</div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full flex justify-between absolute top-[40%] px-16 md:px-32">
              <Zap size={24} className="md:w-[30px] md:h-[30px] text-yellow-400 showcase-flow drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            </div>
            <div className="w-full flex justify-between absolute top-[60%] px-16 md:px-32">
              <CircleDollarSign
                size={24}
                className="md:w-[30px] md:h-[30px] text-blue-400 showcase-flow-delay rotate-180 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-600 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Home size={36} className="text-blue-400 md:w-[50px] md:h-[50px]" />
            </div>
            <div className="mt-2 md:mt-4 text-slate-300 font-bold text-sm md:text-lg">Consumer</div>
          </div>
        </div>
      )

    case 2:
      return (
        <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[240px]">
          <div className="absolute left-[10%] md:left-[20%] bottom-[25%] md:bottom-[30%] flex flex-col items-center opacity-30">
            <FileText size={48} className="text-slate-400 showcase-flow-up md:w-[60px] md:h-[60px]" />
            <div className="mt-2 text-red-400 font-bold text-xs md:text-base">복잡한 서류 절차</div>
          </div>
          <div className="z-10 flex flex-col items-center showcase-float">
            <div className="relative flex items-center justify-center">
              <Box size={88} className="text-slate-700 md:w-[120px] md:h-[120px]" />
              <Leaf size={44} className="text-green-400 absolute drop-shadow-[0_0_20px_rgba(74,222,128,0.8)] md:w-[60px] md:h-[60px]" />
              <CheckCircle size={24} className="text-white bg-green-500 rounded-full absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 border-4 border-slate-900 md:w-[30px] md:h-[30px]" />
            </div>
            <div className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-green-400 drop-shadow-md tracking-wider">
              RE100 자동 인증 완료
            </div>
            <div className="mt-2 px-3 py-1 bg-slate-800 rounded text-slate-400 font-mono text-xs md:text-sm border border-slate-700">
              TxHash: 0x8f...3a9c
            </div>
          </div>
        </div>
      )

    case 3:
      return (
        <div className="relative flex items-center justify-center w-full h-full min-h-[240px] gap-8 md:gap-16 px-4">
          <div className="flex flex-col items-center z-10">
            <Activity size={56} className="text-cyan-400 showcase-float md:w-20 md:h-20" />
            <div className="mt-3 md:mt-4 font-bold text-slate-300 text-sm md:text-base">Raw Data (계측)</div>
          </div>
          <div className="relative w-24 md:w-48 h-2 bg-slate-800 rounded-full overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent showcase-flow" />
          </div>
          <div className="flex flex-col items-center z-10">
            <div className="relative flex items-center justify-center">
              <Database size={72} className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] md:w-[100px] md:h-[100px]" />
              <Coins size={28} className="text-white absolute mt-2 md:w-10 md:h-10" />
            </div>
            <div className="mt-3 md:mt-4 font-bold text-yellow-400 text-sm md:text-xl text-center">
              High-Value AI Data Asset
            </div>
          </div>
        </div>
      )

    case 4:
      return (
        <div className="relative flex items-center justify-center w-full h-full min-h-[240px] gap-10 md:gap-20 px-4">
          <div className="flex flex-col items-center z-10 showcase-float">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-blue-900/30 rounded-full border-2 border-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(96,165,250,0.5)]">
              <Cpu size={36} className="text-blue-300 md:w-[50px] md:h-[50px]" />
            </div>
            <div className="mt-3 md:mt-4 font-bold text-blue-300 text-base md:text-xl">WON Token</div>
          </div>
          <RefreshCw size={44} className="text-emerald-400 animate-spin shrink-0 md:w-[60px] md:h-[60px]" style={{ animationDuration: '3s' }} />
          <div className="flex flex-col items-center z-10 showcase-float" style={{ animationDelay: '1s' }}>
            <div className="w-20 h-20 md:w-28 md:h-28 bg-emerald-900/30 rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)]">
              <Landmark size={36} className="text-emerald-300 md:w-[50px] md:h-[50px]" />
            </div>
            <div className="mt-3 md:mt-4 font-bold text-emerald-400 text-base md:text-xl text-center">
              BOK 예금토큰 (CBDC)
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

function TabButton({
  tab,
  idx,
  isActive,
  onSelect,
}: {
  tab: (typeof TABS)[number]
  idx: number
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

function ProofModal({ activeTab, onClose }: { activeTab: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="relative bg-slate-950 w-full max-w-5xl max-h-[85vh] rounded-2xl md:rounded-3xl border border-slate-700 p-6 md:p-10 shadow-[0_0_100px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors z-10"
          aria-label="닫기"
        >
          <X size={22} />
        </button>

        <div className="border-b border-slate-700 pb-4 mb-4 shrink-0 pr-10">
          <h3 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
            <Search className="text-blue-400 shrink-0" size={22} />
            {TABS[activeTab].title} 상세 구조 및 증명
          </h3>
        </div>

        <div className="flex-1 min-h-0 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="ml-4 text-xs font-mono text-slate-400">System Verification Proof</div>
          </div>
          <pre className="p-4 md:p-6 font-mono text-xs md:text-sm text-green-400 overflow-auto whitespace-pre-wrap flex-1">
            {MODAL_PROOFS[activeTab]}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CoreValuesBento() {
  const [activeTab, setActiveTab] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="-mx-4 md:-mx-6 -mb-4 md:-mb-6 flex flex-col md:flex-row min-h-[560px] md:min-h-[calc(100vh-14rem)] bg-slate-950 text-slate-100 overflow-hidden rounded-b-2xl font-sans">
      <ShowcaseStyles />

      {/* 좌측 탭 — 모바일: 가로 스크롤 */}
      <div className="md:w-[30%] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-3 md:pb-0 shrink-0">
          <div className="text-blue-500 font-bold tracking-widest text-[10px] md:text-sm mb-1">MVP GRID LAB</div>
          <h1 className="text-xl md:text-3xl font-extrabold text-white">핵심 가치 5선</h1>
          <p className="text-slate-400 mt-1 text-xs md:text-sm hidden md:block">무신뢰 기반 차세대 전력망의 압도적 우위</p>
        </div>

        <div className="flex md:flex-col gap-2 p-3 md:p-6 md:pt-8 overflow-x-auto md:overflow-visible scrollbar-hide">
          {TABS.map((tab, idx) => (
            <TabButton
              key={tab.id}
              tab={tab}
              idx={idx}
              isActive={activeTab === idx}
              onSelect={() => setActiveTab(idx)}
            />
          ))}
        </div>
      </div>

      {/* 우측 메인 스테이지 */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0B1121] relative overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="flex-1 relative cursor-pointer group min-h-[280px] md:min-h-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
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
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <TabVisual activeTab={activeTab} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
            <div className="bg-blue-600 px-5 py-3 md:px-8 md:py-4 rounded-full flex items-center gap-2 md:gap-3 text-white font-bold text-sm md:text-lg shadow-[0_0_30px_rgba(37,99,235,0.8)] transform group-hover:scale-105 transition-transform duration-300">
              <Search size={20} className="md:w-6 md:h-6" />
              클릭해서 데이터 증명 확인하기
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
            className="shrink-0 bg-slate-900 border-t border-slate-800 p-5 md:p-8 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-blue-400 font-mono font-bold text-base md:text-xl opacity-50">
                0{activeTab + 1}.
              </div>
              <h2 className="text-lg md:text-2xl font-extrabold text-white tracking-tight">
                {TABS[activeTab].title}
              </h2>
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-4xl pl-0 md:pl-10 line-clamp-2 md:line-clamp-none">
              {TABS[activeTab].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>{isModalOpen && <ProofModal activeTab={activeTab} onClose={() => setIsModalOpen(false)} />}</AnimatePresence>
    </div>
  )
}
