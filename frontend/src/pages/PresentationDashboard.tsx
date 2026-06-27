import { useState, useEffect, useMemo } from 'react'
import { useEnergyData, useNetworkStatus } from '../hooks/useEnergyData'
import { useProducerData } from '../hooks/useProducerData'
import { DEMO_CONSUMER_WALLET, DEMO_PRODUCER_WALLET, buildChainEvents } from '../lib/presentation'
import SystemFlowBanner from '../components/presentation/SystemFlowBanner'
import EnergyHeatmap from '../components/presentation/EnergyHeatmap'
import OnChainLiveFeed from '../components/presentation/OnChainLiveFeed'
import ProducerInventoryGauge from '../components/presentation/ProducerInventoryGauge'
import SettlementShowcase from '../components/presentation/SettlementShowcase'
import { Zap, Activity, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const SLIDES = [
  { id: 'overview', label: '통합 대시보드' },
  { id: 'heatmap', label: '에너지 히트맵' },
  { id: 'settlement', label: 'P2P 정산' },
  { id: 'producer', label: '생산 · 판매' },
  { id: 'architecture', label: '시스템 구조' },
]

const AUTO_MS = 10000

export default function PresentationDashboard() {
  const [slideIdx, setSlideIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const { data: consumerData } = useEnergyData(DEMO_CONSUMER_WALLET)
  const { data: producerData } = useProducerData(DEMO_PRODUCER_WALLET)
  const { network } = useNetworkStatus()

  const consumerReadings = consumerData?.readings ?? []
  const producerReadings = producerData?.productions ?? []
  const sales = producerData?.sales ?? []

  const chainEvents = useMemo(
    () => buildChainEvents(consumerReadings, producerReadings, sales),
    [consumerReadings, producerReadings, sales],
  )

  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SLIDES.length)
    }, AUTO_MS)
    return () => clearInterval(t)
  }, [autoPlay])

  const slide = SLIDES[slideIdx]
  const consumerKWh = consumerData?.overview.totalKWh ?? 0
  const consumerWh = consumerData?.overview.totalWh ?? 0

  return (
    <div className="presentation-mode -mx-4 -mb-6 md:-mx-0 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-slate-950 via-[#0f172a] to-indigo-950 min-h-[calc(100vh-12rem)] p-4 md:p-6 lg:p-8">
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">
                P2P 에너지 온체인 거래 시스템
              </h2>
            </div>
            <p className="text-xs md:text-sm text-white/50">
              하드웨어 계량 → 스마트 컨트랙트 → WON 토큰 정산 · Arbitrum Sepolia Live
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              LIVE
            </span>
            {network?.latestBlock && (
              <span className="text-[10px] font-mono text-white/40 hidden sm:block">
                Block #{network.latestBlock.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <SystemFlowBanner />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          {[
            { label: '소비 계량', value: `${consumerKWh.toFixed(2)}`, unit: 'kWh', color: 'from-emerald-600 to-teal-600' },
            { label: '생산 계량', value: `${(producerData?.overview.totalProductionKWh ?? 0).toFixed(2)}`, unit: 'kWh', color: 'from-amber-600 to-orange-600' },
            { label: '검증 정산', value: `${sales.length}`, unit: '건', color: 'from-violet-600 to-purple-600' },
            { label: '온체인 이벤트', value: `${chainEvents.length}`, unit: '최근', color: 'from-indigo-600 to-blue-600' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl bg-gradient-to-br ${kpi.color} p-3 md:p-4 shadow-lg`}
            >
              <p className="text-[10px] md:text-xs text-white/80 font-medium">{kpi.label}</p>
              <p className="text-xl md:text-3xl font-black text-white mt-0.5">
                {kpi.value}
                <span className="text-sm font-normal text-white/70 ml-1">{kpi.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Slide nav */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  i === slideIdx
                    ? 'bg-white text-slate-900'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setAutoPlay((p) => !p)}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSlideIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIdx((i) => (i + 1) % SLIDES.length)}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide content */}
        <div className="min-h-[420px] md:min-h-[480px]">
          {slide.id === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              <EnergyHeatmap readings={consumerReadings} title="소비자 · 시간대별 전력" />
              <OnChainLiveFeed events={chainEvents} latestBlock={network?.latestBlock ?? undefined} />
            </div>
          )}

          {slide.id === 'heatmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EnergyHeatmap readings={consumerReadings} title="소비 계량 히트맵" />
              <EnergyHeatmap readings={producerReadings} title="생산 계량 히트맵" />
            </div>
          )}

          {slide.id === 'settlement' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              <SettlementShowcase sales={sales} consumerKWh={consumerKWh} consumerWh={consumerWh} />
              <OnChainLiveFeed
                events={chainEvents.filter((e) => e.type === 'settle')}
                latestBlock={network?.latestBlock ?? undefined}
              />
            </div>
          )}

          {slide.id === 'producer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              <ProducerInventoryGauge
                totalKWh={producerData?.overview.totalProductionKWh ?? 0}
                soldKWh={producerData?.overview.soldKWh ?? 0}
                availableKWh={producerData?.overview.availableKWh ?? 0}
                totalWon={producerData?.overview.totalWonReceived ?? 0}
              />
              <EnergyHeatmap readings={producerReadings} title="생산 · 시간대별 출력" />
            </div>
          )}

          {slide.id === 'architecture' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6 text-center">시스템 아키텍처</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  {
                    title: '소비자 미터',
                    addr: '0xb551…a7B',
                    event: 'EnergyDataRecorded',
                    desc: '하드웨어가 사용 전력(Wh)을 주기적으로 온체인 기록',
                    color: 'border-emerald-500/40 bg-emerald-500/10',
                  },
                  {
                    title: '생산자 미터',
                    addr: '0x9F90…2A8',
                    event: 'EnergyProduced',
                    desc: '발전소가 생산 전력(kWh)을 온체인 기록',
                    color: 'border-amber-500/40 bg-amber-500/10',
                  },
                  {
                    title: 'WON 토큰',
                    addr: '0x8844…fdBB',
                    event: 'Transfer',
                    desc: '주차별 kWh × 단가로 P2P 정산 · 계량과 교차 검증',
                    color: 'border-violet-500/40 bg-violet-500/10',
                  },
                ].map((box) => (
                  <div key={box.title} className={`rounded-xl border p-5 ${box.color}`}>
                    <p className="text-base font-bold text-white">{box.title}</p>
                    <p className="text-[10px] font-mono text-white/40 mt-1">{box.addr}</p>
                    <p className="text-xs text-violet-300 font-semibold mt-2">{box.event}</p>
                    <p className="text-xs text-white/60 mt-2 leading-relaxed">{box.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-8 flex-wrap text-sm text-white/50">
                <span className="px-3 py-1 rounded-full bg-white/10">IoT 계량기</span>
                <span>→</span>
                <span className="px-3 py-1 rounded-full bg-white/10">Arbitrum Sepolia</span>
                <span>→</span>
                <span className="px-3 py-1 rounded-full bg-white/10">대시보드 정산</span>
                <span>→</span>
                <span className="px-3 py-1 rounded-full bg-white/10">Arbiscan 검증</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom ticker */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-white/10 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs text-white/40">
            {[...chainEvents, ...chainEvents].map((ev, i) => (
              <span key={`${ev.id}-${i}`} className="inline-flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ev.type === 'consume' ? 'bg-emerald-400' : ev.type === 'produce' ? 'bg-amber-400' : 'bg-violet-400'
                }`} />
                {ev.label} · {new Date(ev.timestamp * 1000).toLocaleString('ko-KR')} · Tx {ev.txHash.slice(0, 10)}…
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
