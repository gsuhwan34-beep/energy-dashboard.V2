import type { ReactNode } from 'react'
import type { ShowcaseTab } from './showcaseContent'

interface Props {
  tab: ShowcaseTab
  variant?: 'hero' | 'strip'
}

function Panel({
  side,
  label,
  sub,
  children,
}: {
  side: 'left' | 'right'
  label: string
  sub: string
  children: ReactNode
}) {
  const isLeft = side === 'left'
  return (
    <div
      className={`flex flex-col h-full min-h-0 ${
        isLeft ? 'bg-red-50 border-r border-red-100' : 'bg-emerald-50'
      }`}
    >
      <div className={`px-3 py-2 shrink-0 ${isLeft ? 'bg-red-100/80' : 'bg-emerald-100/80'}`}>
        <p className={`text-[10px] font-black uppercase tracking-wide ${isLeft ? 'text-red-700' : 'text-emerald-800'}`}>
          {label}
        </p>
        <p className="text-[9px] text-slate-600 font-medium mt-0.5">{sub}</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">{children}</div>
    </div>
  )
}

function SpofSvg() {
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <Panel side="left" label="기존 · 중앙집중형" sub="서버 1대 다운 = 전국 마비">
        <svg viewBox="0 0 200 160" className="w-full max-h-[140px]" aria-hidden>
          <rect x="78" y="18" width="44" height="36" rx="4" fill="#dc2626" opacity="0.9" />
          <text x="100" y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">서버</text>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 30 + i * 35
            return (
              <g key={i}>
                <line x1="100" y1="54" x2={x} y2="120" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2" />
                <rect x={x - 12} y="120" width="24" height="18" rx="2" fill="#fecaca" stroke="#dc2626" />
                <text x={x} y="132" textAnchor="middle" fontSize="7" fill="#991b1b">×</text>
              </g>
            )
          })}
          <text x="100" y="155" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="bold">SPOF</text>
        </svg>
      </Panel>
      <Panel side="right" label="MVP · 분산형" sub="노드 분산 = 무중단">
        <svg viewBox="0 0 200 160" className="w-full max-h-[140px]" aria-hidden>
          {[
            [40, 40], [100, 25], [160, 40], [30, 100], [100, 115], [170, 100], [100, 70],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 6 ? 14 : 10} fill={i === 6 ? '#2563eb' : '#10b981'} opacity="0.85" />
          ))}
          <line x1="40" y1="40" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="100" y1="25" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="160" y1="40" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="30" y1="100" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="100" y1="115" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="170" y1="100" x2="100" y2="70" stroke="#059669" strokeWidth="1.5" />
          <line x1="40" y1="40" x2="160" y2="40" stroke="#059669" strokeWidth="1" opacity="0.5" />
          <line x1="30" y1="100" x2="170" y2="100" stroke="#059669" strokeWidth="1" opacity="0.5" />
          <text x="100" y="74" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">L2</text>
          <text x="100" y="152" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">분산 검증</text>
        </svg>
      </Panel>
    </div>
  )
}

function P2pSvg() {
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <Panel side="left" label="기존 · 중개 독점" sub="플랫폼이 마진 수취">
        <svg viewBox="0 0 200 140" className="w-full max-h-[120px]" aria-hidden>
          <rect x="15" y="55" width="40" height="30" rx="4" fill="#fbbf24" />
          <text x="35" y="74" textAnchor="middle" fontSize="8" fill="#78350f">생산</text>
          <rect x="80" y="45" width="40" height="50" rx="4" fill="#dc2626" />
          <text x="100" y="68" textAnchor="middle" fontSize="7" fill="white">중개</text>
          <text x="100" y="82" textAnchor="middle" fontSize="10" fill="#fef08a">$</text>
          <rect x="145" y="55" width="40" height="30" rx="4" fill="#94a3b8" />
          <text x="165" y="74" textAnchor="middle" fontSize="8" fill="#1e293b">소비</text>
          <line x1="55" y1="70" x2="80" y2="70" stroke="#64748b" strokeWidth="2" markerEnd="url(#arr)" />
          <line x1="120" y1="70" x2="145" y2="70" stroke="#64748b" strokeWidth="2" />
          <text x="100" y="120" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="bold">수수료 · 지연</text>
        </svg>
      </Panel>
      <Panel side="right" label="MVP · P2P 직거래" sub="1:1 즉시 정산 · 수수료 0">
        <svg viewBox="0 0 200 140" className="w-full max-h-[120px]" aria-hidden>
          <rect x="25" y="50" width="45" height="35" rx="4" fill="#fbbf24" />
          <text x="47" y="72" textAnchor="middle" fontSize="8" fill="#78350f">프로슈머</text>
          <rect x="130" y="50" width="45" height="35" rx="4" fill="#60a5fa" />
          <text x="152" y="72" textAnchor="middle" fontSize="8" fill="white">소비자</text>
          <line x1="70" y1="62" x2="130" y2="62" stroke="#059669" strokeWidth="2.5" />
          <line x1="130" y1="78" x2="70" y2="78" stroke="#059669" strokeWidth="2.5" />
          <text x="100" y="67" textAnchor="middle" fontSize="7" fill="#059669">kWh</text>
          <text x="100" y="83" textAnchor="middle" fontSize="7" fill="#059669">WON</text>
          <text x="100" y="120" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">수수료 Zero</text>
        </svg>
      </Panel>
    </div>
  )
}

function Re100Svg() {
  return (
    <div className="grid grid-cols-2 w-full h-full gap-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <Panel side="left" label="기존 · 서류·실사" sub="수주~수개월 · REC · 비용">
        <svg viewBox="0 0 200 140" className="w-full max-h-[120px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={60 + i * 8} y={30 + i * 6} width="50" height="60" rx="2" fill="#fef3c7" stroke="#d97706" />
          ))}
          <text x="100" y="58" textAnchor="middle" fontSize="8" fill="#92400e">REC</text>
          <text x="100" y="72" textAnchor="middle" fontSize="8" fill="#92400e">실사</text>
          <circle cx="100" cy="105" r="14" fill="#fecaca" stroke="#dc2626" />
          <text x="100" y="109" textAnchor="middle" fontSize="8" fill="#dc2626">3개월+</text>
        </svg>
      </Panel>
      <Panel side="right" label="MVP · 온체인 즉시" sub="계측 = 즉시 녹색 증명">
        <svg viewBox="0 0 200 140" className="w-full max-h-[120px]" aria-hidden>
          <circle cx="45" cy="70" r="18" fill="#fbbf24" />
          <text x="45" y="74" textAnchor="middle" fontSize="7" fill="#78350f">☀</text>
          <rect x="78" y="58" width="44" height="24" rx="3" fill="#2563eb" />
          <text x="100" y="74" textAnchor="middle" fontSize="7" fill="white">Block</text>
          <circle cx="155" cy="70" r="18" fill="#10b981" />
          <text x="155" y="74" textAnchor="middle" fontSize="12" fill="white">✓</text>
          <line x1="63" y1="70" x2="78" y2="70" stroke="#059669" strokeWidth="2" />
          <line x1="122" y1="70" x2="137" y2="70" stroke="#059669" strokeWidth="2" />
          <text x="100" y="115" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">즉시 RE100</text>
        </svg>
      </Panel>
    </div>
  )
}

function AiSvg() {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-violet-50 to-white">
      <div className="px-3 py-2 bg-violet-100/80 shrink-0">
        <p className="text-[10px] font-black text-violet-800 uppercase">온체인 데이터 → AI → 전력망</p>
      </div>
      <svg viewBox="0 0 360 120" className="w-full flex-1 p-3" aria-hidden>
        {[20, 70, 120, 170].map((x, i) => (
          <g key={i}>
            <rect x={x} y="40" width="28" height="40" rx="3" fill="#c4b5fd" stroke="#7c3aed" />
            <text x={x + 14} y="65" textAnchor="middle" fontSize="7" fill="#5b21b6">계량</text>
          </g>
        ))}
        <line x1="198" y1="60" x2="220" y2="60" stroke="#7c3aed" strokeWidth="2" />
        <rect x="220" y="45" width="36" height="30" rx="4" fill="#2563eb" />
        <text x="238" y="64" textAnchor="middle" fontSize="7" fill="white">Chain</text>
        <line x1="256" y1="60" x2="275" y2="60" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="295" cy="60" r="22" fill="#8b5cf6" />
        <text x="295" y="58" textAnchor="middle" fontSize="8" fill="white">AI</text>
        <text x="295" y="68" textAnchor="middle" fontSize="6" fill="#ede9fe">학습</text>
        <line x1="317" y1="60" x2="330" y2="60" stroke="#7c3aed" strokeWidth="2" />
        <path d="M330 35 L350 60 L330 85 Z" fill="#10b981" opacity="0.8" />
        <text x="100" y="105" textAnchor="middle" fontSize="9" fill="#5b21b6" fontWeight="bold">
          범국가적 전력 수요 예측 · 피크 관리
        </text>
      </svg>
    </div>
  )
}

function CbdcVisual({ variant }: { variant: 'hero' | 'strip' }) {
  const h = variant === 'hero' ? 'h-full' : 'h-[100px]'
  return (
    <div className={`w-full ${h} flex flex-col rounded-xl overflow-hidden border border-indigo-200 shadow-sm bg-white`}>
      <div className="flex flex-1 min-h-0">
        <div className="w-[55%] relative bg-indigo-950 shrink-0">
          <img
            src="/presentation/bok-governor-slide.png"
            alt="한국은행 총재 원화 스테이블코인"
            className="w-full h-full object-cover object-top opacity-95"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center px-4 py-3 bg-gradient-to-br from-indigo-50 to-white">
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">2025.8.19 국회 업무보고</p>
          <p className="text-sm font-black text-slate-900 leading-tight mt-1">원화 스테이블코인</p>
          <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
            WON 토큰 정산 → 원화 CBDC 확장에 기여하는 에너지 핀테크
          </p>
        </div>
      </div>
    </div>
  )
}

export function ShowcaseContrastVisual({ tab, variant = 'hero' }: Props) {
  const h = variant === 'hero' ? 'h-full min-h-[220px]' : 'h-[100px]'

  if (tab.id === 4) {
    return (
      <div className={h}>
        <CbdcVisual variant={variant} />
      </div>
    )
  }

  const map: Record<number, ReactNode> = {
    0: <SpofSvg />,
    1: <P2pSvg />,
    2: <Re100Svg />,
    3: <AiSvg />,
  }

  return <div className={h}>{map[tab.id]}</div>
}
