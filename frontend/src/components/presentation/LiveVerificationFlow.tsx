import { useState, useEffect, useMemo } from 'react'
import {
  Radio, Cpu, Calculator, ArrowRightLeft, CheckCircle2,
  ExternalLink, Zap, Loader2,
} from 'lucide-react'
import { useEnergyData, useConsumerSettlements } from '../../hooks/useEnergyData'
import { readStoredWallet, readStoredSupplierRate, STORAGE_CONSUMER_WALLET, DEMO_CONSUMER_WALLET, shortAddr } from '../../lib/presentation'
import { matchVerifiedWeeklySettlements } from '../../lib/settlementMatch'

const STEPS = [
  {
    id: 1,
    icon: Radio,
    title: '15분 주기 온체인 데이터 수신',
    subtitle: 'Data Anchoring',
    highlight: '메인 서버 DB가 아니라 블록체인에 직접 꽂힌다.',
    color: 'from-cyan-500/20 to-blue-600/10',
    border: 'border-cyan-500/40',
    iconColor: 'text-cyan-400',
  },
  {
    id: 2,
    icon: Calculator,
    title: '스마트 컨트랙트 검증 및 연산',
    subtitle: 'Contract Execution',
    highlight: '사람이 계산하거나 결제 대행사를 거치지 않는다.',
    color: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/40',
    iconColor: 'text-violet-400',
  },
  {
    id: 3,
    icon: ArrowRightLeft,
    title: 'P2P 토큰 자동 전송',
    subtitle: 'Zero-Fee Settlement',
    highlight: '결제 수수료 Zero, 정산 지연 시간 Zero.',
    color: 'from-emerald-500/20 to-green-600/10',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
] as const

export default function LiveVerificationFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [consumerWallet, setConsumerWallet] = useState(DEMO_CONSUMER_WALLET)

  const [extraRates, setExtraRates] = useState<number[]>([])

  useEffect(() => {
    setConsumerWallet(readStoredWallet(STORAGE_CONSUMER_WALLET, DEMO_CONSUMER_WALLET))
    const sync = () => {
      setConsumerWallet(readStoredWallet(STORAGE_CONSUMER_WALLET, DEMO_CONSUMER_WALLET))
      setExtraRates(readStoredSupplierRate())
    }
    sync()
    const id = setInterval(sync, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % 3)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const { data, loading } = useEnergyData(consumerWallet)
  const { data: settlementData } = useConsumerSettlements(
    /^0x[a-fA-F0-9]{40}$/.test(consumerWallet) ? [consumerWallet] : [],
  )

  const readings = data?.readings ?? []
  const lastReading = data?.overview?.lastReading ?? readings[readings.length - 1] ?? null
  const latestSettlement = useMemo(() => {
    const matched = matchVerifiedWeeklySettlements(
      readings,
      settlementData?.transfers ?? [],
      [consumerWallet],
      extraRates,
    )
    return matched[0] ?? null
  }, [readings, settlementData?.transfers, consumerWallet, extraRates])

  const rate = extraRates[0] ?? 150

  const demoKwh = lastReading?.kWh ?? 0.042
  const demoWh = lastReading?.wh ?? demoKwh * 1000
  const demoWon = latestSettlement?.wonAmount ?? Number((demoKwh * rate).toFixed(2))

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="text-center mb-4 shrink-0">
        <p className="text-xs text-indigo-300/80 font-semibold tracking-widest uppercase mb-1">
          Live Verification Flow
        </p>
        <h3 className="text-lg md:text-xl font-black text-white">
          에너지 발생 → 블록체인 박제 → 토큰 정산
        </h3>
        <p className="text-[11px] text-white/45 mt-1">
          계량 {shortAddr(consumerWallet)} · 실시간 온체인 데이터 연동
        </p>
      </div>

      <div className="flex flex-col gap-0 max-w-2xl mx-auto w-full flex-1">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isActive = activeStep === idx
          const isDone = activeStep > idx

          return (
            <div key={step.id} className="relative">
              {idx > 0 && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-white/20 to-white/5 relative overflow-hidden">
                    <div
                      className={`absolute inset-x-0 h-3 bg-gradient-to-b from-cyan-400 to-violet-400 transition-all duration-700 ${
                        isActive || isDone ? 'animate-flow-down' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div
                className={`rounded-2xl border p-4 md:p-5 transition-all duration-500 bg-gradient-to-br ${step.color} ${step.border} ${
                  isActive ? 'ring-2 ring-white/30 scale-[1.02] shadow-lg shadow-black/30' : 'opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/15 animate-pulse-soft' : 'bg-white/8'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Icon className={`w-5 h-5 ${step.iconColor}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Step {step.id} · {step.subtitle}
                    </p>
                    <h4 className="text-sm md:text-base font-bold text-white mt-0.5">{step.title}</h4>
                    <p className="text-xs text-amber-200/90 font-medium mt-2">“{step.highlight}”</p>

                    {/* Step-specific live panel */}
                    <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3 text-xs">
                      {idx === 0 && (
                        <Step1Panel loading={loading} lastReading={lastReading} demoWh={demoWh} />
                      )}
                      {idx === 1 && (
                        <Step2Panel kwh={latestSettlement?.kWh ?? demoKwh} rate={latestSettlement?.ratePerKwh ?? rate} won={demoWon} />
                      )}
                      {idx === 2 && (
                        <Step3Panel settlement={latestSettlement} demoWon={demoWon} rate={rate} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step1Panel({
  loading,
  lastReading,
  demoWh,
}: {
  loading: boolean
  lastReading: { wh: number; kWh: number; txHash: string; blockNumber: number; timestamp: number } | null
  demoWh: number
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/50">
        <Loader2 className="w-4 h-4 animate-spin" /> 온체인 데이터 수신 중…
      </div>
    )
  }

  const wh = lastReading?.wh ?? demoWh
  const tx = lastReading?.txHash

  return (
    <div className="space-y-2 text-white/80">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        <span>
          누적 전력량 <strong className="text-white">{wh} Wh</strong>
          {' '}({(wh / 1000).toFixed(4)} kWh)
        </span>
      </div>
      {tx ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Cpu className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white/50">Arbitrum 블록 #{lastReading!.blockNumber.toLocaleString()}</span>
          </div>
          <a
            href={`https://sepolia.arbiscan.io/tx/${tx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-cyan-300 hover:underline"
          >
            Tx {tx.slice(0, 10)}… <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-[10px] text-white/40">라즈베리파이 → 아비트럼 Sepolia 영구 기록 완료</p>
        </>
      ) : (
        <p className="text-white/40">소비자 탭에서 계량기를 조회하면 실제 Tx가 표시됩니다.</p>
      )}
    </div>
  )
}

function Step2Panel({ kwh, rate, won }: { kwh: number; rate: number; won: number }) {
  return (
    <div className="space-y-2 text-white/80">
      <div className="font-mono text-sm bg-white/5 rounded-lg px-3 py-2 text-center">
        <span className="text-violet-300">{kwh.toFixed(4)} kWh</span>
        <span className="text-white/40 mx-2">×</span>
        <span className="text-violet-300">{rate} WON/kWh</span>
        <span className="text-white/40 mx-2">=</span>
        <span className="text-white font-bold">{won.toFixed(2)} WON</span>
      </div>
      <p className="text-[10px] text-white/40">스마트 컨트랙트가 자동 검증 · 사람 개입 없음</p>
    </div>
  )
}

function Step3Panel({
  settlement,
  demoWon,
  rate,
}: {
  settlement: { txHash: string; wonAmount: number; supplierWallet: string; weekLabel: string } | null
  demoWon: number
  rate: number
}) {
  if (settlement) {
    return (
      <div className="space-y-2 text-white/80">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="text-emerald-300">{settlement.wonAmount.toFixed(2)} WON</strong> 정산 완료
          </span>
        </div>
        <p className="text-white/50">주차 {settlement.weekLabel} · → {shortAddr(settlement.supplierWallet)}</p>
        <a
          href={`https://sepolia.arbiscan.io/tx/${settlement.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-emerald-300 hover:underline"
        >
          Tx {settlement.txHash.slice(0, 10)}… <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2 text-white/80">
      <p>
        예상 정산액 <strong className="text-emerald-300">{demoWon.toFixed(2)} WON</strong>
        {' '}({rate} WON/kWh)
      </p>
      <p className="text-[10px] text-white/40">소비자 탭에서 주차 정산 시 즉시 온체인 전송</p>
    </div>
  )
}
