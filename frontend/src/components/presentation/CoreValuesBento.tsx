import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  type LucideIcon,
} from 'lucide-react'

interface ValueCard {
  id: number
  icon: LucideIcon
  title: string
  description: string
  accent: 'cyan' | 'violet' | 'emerald' | 'blue' | 'fuchsia'
  size: 'hero' | 'compact'
}

const CARDS: ValueCard[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: '단일 장애점(SPOF) 해소 및 스마트 컨트랙트 자동화',
    description:
      '저희 시스템에는 중앙 서버가 없습니다. 따라서 서버가 다운되거나 해킹당해 정산망이 마비될 우려가 전혀 없으며, 데이터 위변조 위험을 100% 원천 차단했습니다.',
    accent: 'cyan',
    size: 'hero',
  },
  {
    id: 2,
    icon: ArrowRightLeft,
    title: '중개인 없는 P2P 분산 에너지 직거래',
    description:
      '한전 같은 거대 중개 기관 없이, 누구나 자신이 생산한 에너지를 투명하게 시장에 내놓고 직거래할 수 있는 진정한 분산 에너지 생태계를 구현했습니다.',
    accent: 'violet',
    size: 'hero',
  },
  {
    id: 3,
    icon: Leaf,
    title: 'RE100 인증 프리패스 (시간/비용 ZERO)',
    description:
      '수개월씩 걸리던 RE100 인증 과정을 파괴했습니다. 블록체인에 영구 기록된 데이터 자체가 즉각적인 증명서가 되어 행정 시간과 비용을 \'제로(0)\'로 만듭니다.',
    accent: 'emerald',
    size: 'compact',
  },
  {
    id: 4,
    icon: Database,
    title: '고품질 전력 데이터의 자산화 (Data Capitalization)',
    description:
      '오염되지 않은 무결점 오라클 데이터는 단순한 계량 기록을 넘어, 향후 국가 전력 수요 예측과 AI 모델 학습 등에 쓰이는 엄청난 부가가치의 \'데이터 자산\'이 됩니다.',
    accent: 'blue',
    size: 'compact',
  },
  {
    id: 5,
    icon: Coins,
    title: '국가 디지털 화폐(CBDC) 연계 차세대 핀테크망',
    description:
      '최근 금융권의 핵심 이슈인 스테이블 코인 기반의 정산 인프라입니다. 향후 한국은행의 CBDC나 차세대 디지털 예금 토큰망에 직접 연동되어 에너지 핀테크 혁신을 이끌 것입니다.',
    accent: 'fuchsia',
    size: 'compact',
  },
]

const ACCENT: Record<ValueCard['accent'], { ring: string; glow: string; icon: string; badge: string }> = {
  cyan: {
    ring: 'group-hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] group-hover:border-cyan-400/50',
    glow: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    icon: 'text-cyan-400 bg-cyan-500/15 border-cyan-400/30',
    badge: 'text-cyan-300/90',
  },
  violet: {
    ring: 'group-hover:shadow-[0_0_40px_rgba(167,139,250,0.25)] group-hover:border-violet-400/50',
    glow: 'from-violet-500/20 via-violet-500/5 to-transparent',
    icon: 'text-violet-400 bg-violet-500/15 border-violet-400/30',
    badge: 'text-violet-300/90',
  },
  emerald: {
    ring: 'group-hover:shadow-[0_0_32px_rgba(52,211,153,0.22)] group-hover:border-emerald-400/45',
    glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    icon: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30',
    badge: 'text-emerald-300/90',
  },
  blue: {
    ring: 'group-hover:shadow-[0_0_32px_rgba(96,165,250,0.22)] group-hover:border-blue-400/45',
    glow: 'from-blue-500/15 via-blue-500/5 to-transparent',
    icon: 'text-blue-400 bg-blue-500/15 border-blue-400/30',
    badge: 'text-blue-300/90',
  },
  fuchsia: {
    ring: 'group-hover:shadow-[0_0_32px_rgba(232,121,249,0.22)] group-hover:border-fuchsia-400/45',
    glow: 'from-fuchsia-500/15 via-fuchsia-500/5 to-transparent',
    icon: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-400/30',
    badge: 'text-fuchsia-300/90',
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function BentoCard({ card, index }: { card: ValueCard; index: number }) {
  const Icon = card.icon
  const accent = ACCENT[card.accent]
  const isHero = card.size === 'hero'

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`
        group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80
        backdrop-blur-sm transition-shadow duration-300 ${accent.ring}
        ${isHero ? 'md:col-span-1 min-h-[220px] md:min-h-[260px]' : 'min-h-[200px]'}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.glow} pointer-events-none`} />
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

      <div className={`relative h-full flex flex-col p-5 md:p-6 ${isHero ? 'md:p-7' : ''}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 ${accent.icon}`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.75} />
          </div>
          <span className={`text-[10px] font-mono font-bold tracking-widest ${accent.badge}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h4 className={`font-bold text-white leading-snug mb-3 ${isHero ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
          {card.title}
        </h4>
        <p className={`text-white/65 leading-relaxed flex-1 ${isHero ? 'text-sm md:text-[15px]' : 'text-xs md:text-sm'}`}>
          {card.description}
        </p>
      </div>
    </motion.article>
  )
}

export default function CoreValuesBento() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <div ref={ref} className="flex flex-col min-h-0 overflow-y-auto pb-2">
      <div className="text-center mb-6 md:mb-8 shrink-0">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[10px] md:text-xs text-violet-300/90 font-semibold tracking-[0.2em] uppercase mb-2"
        >
          MVP Grid Lab · Core Values
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight"
        >
          핵심 가치 5선
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-xs md:text-sm text-white/45 mt-2 max-w-xl mx-auto"
        >
          블록체인 기반 P2P 에너지 거래의 차별점을 한 화면에
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto w-full"
      >
        {CARDS.filter((c) => c.size === 'hero').map((card, i) => (
          <BentoCard key={card.id} card={card} index={i} />
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto w-full mt-3 md:mt-4"
      >
        {CARDS.filter((c) => c.size === 'compact').map((card, i) => (
          <BentoCard key={card.id} card={card} index={i + 2} />
        ))}
      </motion.div>
    </div>
  )
}
