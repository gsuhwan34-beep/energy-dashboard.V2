import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Sparkles, ChevronRight } from 'lucide-react'

const SECTIONS = [
  {
    id: 1,
    step: '1단계: 문제 제기',
    title: '현행 RE100과 P2P 거래는 "가짜"와 "비용"의 문제',
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'from-orange-500/15 to-red-500/5',
    body: '현재 기업들이 친환경 에너지를 썼다고 인증받는 RE100 제도는 몇 달 뒤 서류를 모아서 사후 검증합니다. 이 과정에서 데이터 조작(그린워싱)이나 이중 판매 문제가 끊이지 않습니다. 또한 개인이 이웃에게 전기를 직접 파는 P2P 거래는 거래를 중개하고 정산해 주는 중앙 기관의 수수료와 인프라 비용이 더 큽니다.',
  },
  {
    id: 2,
    step: '2단계: 우리의 솔루션',
    title: '인간을 배제하고 하드웨어와 블록체인을 직접 묶었습니다',
    icon: Shield,
    iconColor: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'from-cyan-500/15 to-blue-500/5',
    body: '저희는 측정 단계부터 사람의 손을 타지 않는 "제로 트러스트(Zero-Trust)" 환경을 제안합니다. IoT 계량기가 전력을 측정하는 즉시, 중앙 서버를 거치지 않고 아비트럼 블록체인 네트워크에 데이터를 직접 박제합니다. 거래 증명서가 실시간으로 온체인에 자동 발행되는 것입니다.',
  },
  {
    id: 3,
    step: '3단계: 가치 제안',
    title: '수수료 Zero, 조작 Zero의 에너지 민주화',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'from-emerald-500/15 to-green-500/5',
    body: '스마트 컨트랙트 기반의 WON 토큰을 통해, 복잡한 은행 정산 시스템 없이 대금 지불이 즉각 완료됩니다. 이를 통해 전력 소외 지역이나 소규모 개인 발전소들도 거대 전력 기업을 거치지 않고 신뢰도 100%의 P2P 에너지 직거래를 수수료 없이 수행할 수 있는 인프라를 완성했습니다.',
  },
] as const

export default function WhyThisSystem() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(2), 600),
      setTimeout(() => setVisible(3), 1200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="text-center mb-5 shrink-0">
        <p className="text-xs text-violet-300/80 font-semibold tracking-widest uppercase mb-1">
          Why This System
        </p>
        <h3 className="text-lg md:text-xl font-black text-white">
          왜 이 시스템이 필요한가
        </h3>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon
          const show = idx < visible

          return (
            <div
              key={section.id}
              className={`rounded-2xl border p-5 md:p-6 bg-gradient-to-br ${section.bg} ${section.border} transition-all duration-700 ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{section.step}</p>
                  <h4 className="text-sm md:text-base font-bold text-white mt-1 leading-snug">{section.title}</h4>
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed mt-3">{section.body}</p>
                </div>
              </div>
              {idx < SECTIONS.length - 1 && (
                <div className="flex justify-center mt-4">
                  <ChevronRight className="w-5 h-5 text-white/20 rotate-90" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
