import { useState, type ReactNode } from 'react'
import {
  Server,
  Flame,
  Home,
  Building2,
  Users,
  XCircle,
  CheckCircle2,
  Network,
  Zap,
  CircleDollarSign,
  Percent,
  FileStack,
  Clock,
  Stamp,
  Link2,
  Cpu,
  Brain,
  Map,
  Blocks,
  Activity,
  Landmark,
  Coins,
  ArrowRight,
  Quote,
  ImageIcon,
} from 'lucide-react'
import { BOK_GOVERNOR_IMAGE } from './showcaseContent'

function VsBadge() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-950 border-2 border-white/20 flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-lg">
        VS
      </div>
    </div>
  )
}

function PanelLabel({ variant, children }: { variant: 'bad' | 'good'; children: ReactNode }) {
  return (
    <div
      className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block ${
        variant === 'bad'
          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
      }`}
    >
      {children}
    </div>
  )
}

function CompareShell({ before, after }: { before: ReactNode; after: ReactNode }) {
  return (
    <div className="relative w-full max-w-5xl mx-auto grid grid-cols-2 gap-2 md:gap-4 h-full min-h-[260px] md:min-h-[320px] px-2 md:px-4">
      <div className="rounded-xl md:rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-900/80 p-3 md:p-5 flex flex-col">
        <PanelLabel variant="bad">Before · 기존 방식</PanelLabel>
        <div className="flex-1 flex items-center justify-center">{before}</div>
      </div>
      <div className="rounded-xl md:rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-3 md:p-5 flex flex-col">
        <PanelLabel variant="good">After · MVP 그리드랩</PanelLabel>
        <div className="flex-1 flex items-center justify-center">{after}</div>
      </div>
      <VsBadge />
    </div>
  )
}

function SpofVisual() {
  const clients = [0, 60, 120, 180, 240, 300]
  return (
    <CompareShell
      before={
        <div className="relative w-full flex flex-col items-center">
          <div className="relative flex flex-col items-center mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-red-900/50 border-2 border-red-500 flex items-center justify-center relative showcase-pulse-red">
              <Server className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
              <Flame className="w-5 h-5 text-orange-400 absolute -top-2 -right-2" />
            </div>
            <span className="text-xs md:text-sm font-bold text-red-300 mt-2">중앙 관제 서버</span>
            <span className="text-[10px] text-red-400/80">SPOF — 단일 장애점</span>
          </div>
          <svg className="w-full max-w-[200px] h-16 md:h-20" viewBox="0 0 200 80">
            {clients.map((deg, i) => {
              const rad = (deg * Math.PI) / 180
              const x2 = 100 + Math.cos(rad) * 70
              const y2 = 10 + Math.sin(rad) * 35 + 35
              return (
                <line
                  key={i}
                  x1="100"
                  y1="10"
                  x2={x2}
                  y2={y2}
                  stroke="rgba(239,68,68,0.5)"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )
            })}
          </svg>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center opacity-60">
                <Home className="w-5 h-5 text-slate-500" />
                <XCircle className="w-3 h-3 text-red-500 -mt-2" />
              </div>
            ))}
          </div>
          <p className="text-[10px] md:text-xs text-red-300 font-bold text-center mt-3 leading-snug">
            서버 1대 다운 → 전국 계량·정산 동시 마비
          </p>
        </div>
      }
      after={
        <div className="relative w-full flex flex-col items-center">
          <div className="relative w-44 h-44 md:w-56 md:h-56">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180
              const x = 50 + Math.cos(rad) * 42
              const y = 50 + Math.sin(rad) * 42
              return (
                <div
                  key={i}
                  className="absolute w-[18%] aspect-square -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="w-full h-full rounded-lg bg-cyan-900/40 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                    <Network className="w-3 h-3 md:w-4 md:h-4 text-cyan-300" />
                  </div>
                </div>
              )
            })}
            <div className="absolute inset-[30%] rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center bg-slate-900/80">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-emerald-300 font-bold text-center mt-2 leading-snug">
            99% 노드 파괴되어도 1%로 무중단 · 위변조 불가
          </p>
          <p className="text-[9px] md:text-[10px] text-cyan-400/80 text-center">Arbitrum L2 분산 저장</p>
        </div>
      }
    />
  )
}

function P2pVisual() {
  const peerPositions = [
    { x: 15, y: 20 }, { x: 45, y: 10 }, { x: 75, y: 25 },
    { x: 25, y: 55 }, { x: 55, y: 50 }, { x: 80, y: 65 },
    { x: 40, y: 78 },
  ]
  return (
    <CompareShell
      before={
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-[220px] gap-2">
            <div className="flex flex-col items-center">
              <Home className="w-8 h-8 text-slate-400" />
              <span className="text-[9px] text-slate-500">생산자</span>
            </div>
            <Zap className="w-5 h-5 text-yellow-500/50" />
            <div className="flex flex-col items-center relative px-3 py-2 rounded-lg bg-slate-800 border border-amber-500/40">
              <Building2 className="w-10 h-10 text-amber-500/80" />
              <div className="absolute -top-2 -right-2 bg-amber-500 text-[8px] font-bold px-1.5 rounded-full text-black flex items-center gap-0.5">
                <Percent className="w-2 h-2" /> 수수료
              </div>
              <span className="text-[9px] text-amber-300 mt-1">중개·플랫폼</span>
            </div>
            <Zap className="w-5 h-5 text-yellow-500/50" />
            <div className="flex flex-col items-center">
              <Home className="w-8 h-8 text-slate-400" />
              <span className="text-[9px] text-slate-500">소비자</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400/90">
            <CircleDollarSign className="w-4 h-4" />
            <span className="text-[10px] font-bold">마진·행정비용 → 중개인</span>
          </div>
          <p className="text-[10px] text-red-300/90 text-center leading-snug">
            1:1 직거래 불가 · 지연·수수료 필수
          </p>
        </div>
      }
      after={
        <div className="relative w-full h-40 md:h-48">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {peerPositions.map((a, i) =>
              peerPositions.slice(i + 1).map((b, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(52,211,153,0.25)"
                  strokeWidth="0.5"
                />
              )),
            )}
          </svg>
          {peerPositions.map((p, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-emerald-900/50 border border-emerald-400/50 flex items-center justify-center">
                <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-300" />
              </div>
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-1 text-emerald-300 text-[10px] md:text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              수많은 개인 ↔ P2P 직접 거래
            </div>
            <p className="text-[9px] text-emerald-400/80 mt-0.5">MetaMask · WON 토큰 즉시 정산 · 수수료 Zero</p>
          </div>
        </div>
      }
    />
  )
}

function Re100Visual() {
  return (
    <CompareShell
      before={
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <FileStack className="w-14 h-14 md:w-16 md:h-16 text-slate-500" />
            <FileStack className="w-14 h-14 md:w-16 md:h-16 text-slate-600 absolute top-2 left-2 -z-10" />
            <Stamp className="w-6 h-6 text-red-400 absolute -bottom-1 -right-1" />
          </div>
          <div className="flex items-center gap-1.5 text-red-300">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">수주 ~ 수개월</span>
          </div>
          <ul className="text-[9px] md:text-[10px] text-slate-400 text-center space-y-0.5">
            <li>에너지공단 실사</li>
            <li>REC 발급 · 브로커 수수료</li>
            <li>그린워싱 검증 지연</li>
          </ul>
        </div>
      }
      after={
        <div className="flex flex-col items-center gap-2">
          <div className="relative p-3 rounded-xl bg-slate-800 border border-emerald-500/40">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-300">On-chain Proof</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <Blocks className="w-5 h-5 text-violet-400" />
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <span className="text-sm md:text-base font-bold text-emerald-400">즉시 RE100 증명</span>
          <p className="text-[9px] md:text-[10px] text-emerald-300/80 text-center">
            계측 → 블록체인 영구 기록 = 감사관 불필요
          </p>
        </div>
      }
    />
  )
}

function DataAiVisual() {
  const steps = [
    { icon: Activity, label: 'IoT 계측', sub: '초단위 Wh' },
    { icon: Blocks, label: '온체인 기록', sub: '무결성 100%' },
    { icon: Brain, label: 'AI 학습', sub: '수요 예측' },
    { icon: Map, label: '전국 전력망', sub: '최적 관리' },
  ]
  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-4 py-2">
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-2 md:gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              <div className="flex-1 rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-950/40 to-slate-900/90 p-3 md:p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-violet-500/15 border border-violet-400/40 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-violet-300" />
                </div>
                <span className="text-[11px] md:text-sm font-bold text-white">{step.label}</span>
                <span className="text-[9px] md:text-[10px] text-violet-300/70 mt-0.5">{step.sub}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-violet-400/50 shrink-0 mx-1 hidden md:block" />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:gap-4">
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-2 md:p-3 text-center">
          <span className="text-[9px] md:text-[10px] text-red-300 font-bold">기존: Silo·조작 가능·저품질</span>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-2 md:p-3 text-center">
          <span className="text-[9px] md:text-[10px] text-yellow-300 font-bold">MVP: 오라클 데이터 → 국가 AI 자산</span>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="relative w-full max-w-md h-24 md:h-28 rounded-xl border border-cyan-500/20 bg-slate-900/80 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(34,211,238,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(167,139,250,0.3) 0%, transparent 40%)',
            }}
          />
          <Map className="absolute left-3 top-3 w-8 h-8 text-cyan-400/60" />
          <Cpu className="absolute right-3 bottom-3 w-8 h-8 text-violet-400/60" />
          <p className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white/90 px-4 text-center">
            범국가적 전력 수요 예측 · 피크 타임 밸런싱
          </p>
        </div>
      </div>
    </div>
  )
}

function CbdcVisual() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 px-2 md:px-4 h-full min-h-[260px]">
      <div className="rounded-xl md:rounded-2xl border border-blue-500/30 bg-slate-900/80 overflow-hidden flex flex-col">
        <div className="px-3 py-1.5 bg-blue-900/30 border-b border-blue-500/20 text-[10px] font-bold text-blue-300">
          국가 금융 정책 · 원화 스테이블코인
        </div>
        <div className="flex-1 relative min-h-[140px] bg-slate-950 flex items-center justify-center p-3">
          {!imgError ? (
            <img
              src={BOK_GOVERNOR_IMAGE}
              alt="한국은행 총재 원화 스테이블코인 관련 발언"
              className="max-h-full max-w-full object-contain rounded-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <ImageIcon className="w-10 h-10 text-blue-400/50" />
              <p className="text-xs text-slate-400">
                <code className="text-blue-300">public/presentation/bok-governor.jpg</code>
                <br />
                에 한국은행 총재 사진을 넣으세요
              </p>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-blue-500/20">
          <div className="flex gap-2">
            <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] md:text-xs text-blue-200/90 leading-relaxed italic">
              원화 스테이블코인 · CBDC — 최근 금융권 최대 화두
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl md:rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-4 md:p-5 flex flex-col justify-center gap-4">
        <PanelLabel variant="good">MVP 그리드랩 정산망</PanelLabel>
        <div className="flex items-center justify-center gap-4 md:gap-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-violet-900/40 border-2 border-violet-400 flex items-center justify-center">
              <Coins className="w-8 h-8 text-violet-300" />
            </div>
            <span className="text-xs font-bold text-violet-300 mt-2">WON Token</span>
            <span className="text-[9px] text-slate-400">P2P 에너지 정산</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-6 h-6 text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-bold">1:1 연동</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-900/40 border-2 border-emerald-400 flex items-center justify-center">
              <Landmark className="w-8 h-8 text-emerald-300" />
            </div>
            <span className="text-xs font-bold text-emerald-300 mt-2">원화 CBDC</span>
            <span className="text-[9px] text-slate-400">프로젝트 한강</span>
          </div>
        </div>
        <p className="text-[10px] md:text-xs text-emerald-200/90 text-center leading-relaxed">
          스테이블코인 기반 정산 → 원화 예금 토큰 확장에 기여하는 에너지 핀테크 인프라
        </p>
      </div>
    </div>
  )
}

export function TabVisual({ activeTab }: { activeTab: number }) {
  switch (activeTab) {
    case 0:
      return <SpofVisual />
    case 1:
      return <P2pVisual />
    case 2:
      return <Re100Visual />
    case 3:
      return <DataAiVisual />
    case 4:
      return <CbdcVisual />
    default:
      return null
  }
}

export function ShowcaseStyles() {
  return (
    <style>{`
      @keyframes showcase-pulse-red {
        0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 10px rgba(239,68,68,0.8)); }
        50% { opacity: 0.6; transform: scale(0.97); filter: drop-shadow(0 0 2px rgba(239,68,68,0)); }
      }
      .showcase-pulse-red { animation: showcase-pulse-red 1.5s ease-in-out infinite; }
    `}</style>
  )
}
