import type { LucideIcon } from 'lucide-react'
import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  ServerCrash,
  Network,
  Shield,
  Building2,
  Wallet,
  Zap,
  FileWarning,
  BadgeCheck,
  Timer,
  Layers,
  Brain,
  LineChart,
  Globe,
  Landmark,
  Link2,
} from 'lucide-react'

export type TabAccent = 'blue' | 'amber' | 'emerald' | 'violet' | 'indigo'

export interface SummaryBullet {
  icon: LucideIcon
  text: string
}

export interface ReportSection {
  heading?: string
  paragraphs: string[]
}

export interface ShowcaseTab {
  id: number
  icon: LucideIcon
  accent: TabAccent
  title: string
  tagline: string
  shortDesc: string
  imageCaption: string
  heroImage?: string
  modalPhoto?: string
  detailTitle: string
  summaryBullets: SummaryBullet[]
  reportTitle: string
  reportSections: ReportSection[]
}

export const ACCENT_STYLES: Record<
  TabAccent,
  { ring: string; bg: string; text: string; border: string; gradient: string; badge: string }
> = {
  blue: {
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-50 to-white',
    badge: 'bg-blue-100 text-blue-700',
  },
  amber: {
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-200',
    gradient: 'from-amber-50 to-white',
    badge: 'bg-amber-100 text-amber-800',
  },
  emerald: {
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    gradient: 'from-emerald-50 to-white',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  violet: {
    ring: 'ring-violet-500/30',
    bg: 'bg-violet-600',
    text: 'text-violet-600',
    border: 'border-violet-200',
    gradient: 'from-violet-50 to-white',
    badge: 'bg-violet-100 text-violet-800',
  },
  indigo: {
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    gradient: 'from-indigo-50 to-white',
    badge: 'bg-indigo-100 text-indigo-800',
  },
}

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 0,
    icon: ShieldCheck,
    accent: 'blue',
    title: '단일 장애점(SPOF) 해소',
    tagline: 'Zero-Trust · 무중단',
    shortDesc: '중앙 서버 1대 장애 = 전국 정산 마비. 분산 블록체인으로 SPOF를 제거합니다.',
    imageCaption: '중앙집중형 vs 분산형 — 단일 장애점 해소',
    detailTitle: 'SPOF 해소 · 스마트 컨트랙트 자동화',
    summaryBullets: [
      {
        icon: ServerCrash,
        text: '카카오 판교 DC 화재처럼 중앙 관제 서버 다운 시 전국 전력 계량·요금 정산이 동시 마비',
      },
      {
        icon: Network,
        text: 'Arbitrum L2 퍼블릭 블록체인 — 전 세계 수만 노드 분산 저장, 99% 파괴되어도 무중단 운영',
      },
      {
        icon: Shield,
        text: 'RAM + 독립 보조 전원으로 물리적 훼손 감지 시 온체인 강제 전송 · Zero-Trust 방어망',
      },
    ],
    reportTitle: '단일 장애점(SPOF) 해소 및 스마트 컨트랙트 자동화',
    reportSections: [
      {
        paragraphs: [
          '기존 중앙집중형 전력망 시스템은 거대한 단일 장애점(SPOF, Single Point of Failure) 리스크를 안고 있습니다. 2022년 대한민국을 마비시켰던 카카오 판교 데이터센터 화재 사건이 이를 명확히 증명합니다. 만약 국가 전력 정산을 담당하는 한전의 중앙 관제 서버가 물리적 화재, 지진, 혹은 사이버 해킹 공격을 받아 다운된다면, 국가 전체의 전력 계량과 요금 정산 시스템이 일거에 마비되는 초유의 사태가 발생합니다.',
        ],
      },
      {
        paragraphs: [
          'MVP 그리드랩은 이더리움 L2(아비트럼) 기반 퍼블릭 블록체인을 도입하여 이 문제를 해결했습니다. 전 세계 수만 대의 컴퓨터(노드)에 데이터가 분산 저장되므로, 99%의 노드가 파괴되어도 나머지 1%가 살아있다면 시스템은 무중단으로 작동합니다.',
          '하드웨어 단에서도 전원 코드가 뽑히는 물리적 훼손 시도를 감지하면 독립 보조 전원이 즉시 개입하여 RAM(휘발성 메모리)에 있는 데이터를 블록체인으로 강제 전송하고 잠가버립니다. 물리적 세계와 디지털 세계 양쪽 모두에서 조작과 마비가 불가능한 제로 트러스트(Zero-Trust) 방어망을 완성한 것입니다.',
        ],
      },
    ],
  },
  {
    id: 1,
    icon: ArrowRightLeft,
    accent: 'amber',
    title: '중개인 없는 P2P 직거래',
    tagline: '수수료 Zero · 1:1',
    shortDesc: '플랫폼 마진 없이 프로슈머와 소비자가 MetaMask로 직접 전력·토큰을 교환합니다.',
    imageCaption: '중개 독점 vs P2P 직거래 — 수수료 Zero',
    detailTitle: 'P2P 분산 에너지 직거래',
    summaryBullets: [
      {
        icon: Building2,
        text: '마이크로그리드 시대지만 이웃에게 전력을 팔려면 한전·플랫폼 중개를 반드시 거쳐야 함',
      },
      {
        icon: Wallet,
        text: 'MetaMask 연동 — 스마트 컨트랙트가 중개인 없이 생산자·소비자를 1:1 자동 매칭',
      },
      {
        icon: Zap,
        text: '측정 kWh만큼 WON 토큰 즉시 결제 · 수수료 Zero · 수익 100% 프로슈머 귀속',
      },
    ],
    reportTitle: '중개인 없는 P2P 분산 에너지 직거래',
    reportSections: [
      {
        paragraphs: [
          '미래의 에너지 패러다임은 거대 발전소가 에너지를 독점 공급하는 형태에서, 각 가정과 빌딩이 태양광 등을 통해 스스로 전기를 생산하고 소비하는 마이크로그리드(분산 에너지) 시대로 전환되고 있습니다. 하지만 현재는 내가 생산한 전기를 이웃에게 팔고 싶어도 접근성이 매우 떨어집니다. 한전이나 거대 플랫폼 사업자라는 중개인을 반드시 거쳐야 하며, 이 과정에서 막대한 수수료와 행정 처리 지연이 발생합니다.',
        ],
      },
      {
        paragraphs: [
          '본 시스템은 Web3 지갑(MetaMask)을 연동하여 개개인의 에너지 거래 접근성을 극대화했습니다. 누구나 대시보드에 접속해 자신이 생산한 전력의 단가를 설정하면, 스마트 컨트랙트가 중개인 없이 소비자와 생산자를 1:1로 매칭해 줍니다.',
          '측정된 전력량만큼 수수료 없이 토큰(WON)으로 즉각 결제되므로, 플랫폼 마진으로 빠져나가던 비용이 고스란히 개인(프로슈머)의 수익으로 돌아갑니다. 이는 민간 차원의 신재생 에너지 생산을 폭발적으로 유인하는 가장 강력한 경제적 인센티브 망이 될 것입니다.',
        ],
      },
    ],
  },
  {
    id: 2,
    icon: Leaf,
    accent: 'emerald',
    title: 'RE100 인증 프리패스',
    tagline: '시간·비용 Zero',
    shortDesc: '수개월 REC 실사 대신, 계측 즉시 온체인 기록 = 녹색 전력 증명 완료.',
    imageCaption: '복잡한 서류 vs 온체인 즉시 인증',
    detailTitle: 'RE100 인증 프리패스',
    summaryBullets: [
      {
        icon: FileWarning,
        text: 'RE100은 애플·구글 등 빅테크 하청의 필수 생존 요건 — 수주~수개월 REC 실사·브로커 비용',
      },
      {
        icon: BadgeCheck,
        text: '스마트 컨트랙트가 감사관 역할 — 계측 즉시 위변조 불가능한 블록체인 영구 기록',
      },
      {
        icon: Timer,
        text: '온체인 데이터 = 녹색 전력 생산 증명서 · 서류 심사·감사 비용 Zero',
      },
    ],
    reportTitle: 'RE100 인증 프리패스 (시간/비용 ZERO)',
    reportSections: [
      {
        paragraphs: [
          'RE100(기업 사용 전력의 100%를 재생에너지로 충당하자는 글로벌 캠페인)은 이제 단순한 환경 운동이 아니라, 애플, 구글 등 글로벌 빅테크 기업들이 하청업체에 요구하는 필수 생존 요건이자 무역 장벽이 되었습니다. 하지만 국내 기업들이 RE100을 증명하기 위한 현행 제도는 심각한 모순을 안고 있습니다. 기업이 재생에너지를 사용했음을 증명하려면, 에너지공단의 복잡한 실사를 거쳐 신재생에너지 공급인증서(REC)를 발급받아야 하며, 이 과정에만 수주에서 수개월의 시간과 막대한 행정 비용, 브로커 수수료가 소모됩니다.',
        ],
      },
      {
        paragraphs: [
          '저희 시스템은 스마트 컨트랙트가 그 자체로 감사관 역할을 수행합니다. 엣지 디바이스에서 계측된 태양광 전력 생산량은 그 즉시 위변조가 불가능한 블록체인에 영구 기록됩니다. 중간에 사람이 개입하여 숫자를 조작할 틈이 없기 때문에, 이 온체인(On-chain) 데이터 자체가 누구도 반박할 수 없는 완벽한 녹색 전력 생산 증명서가 됩니다.',
          '수개월이 걸리던 서류 심사와 감사 비용이 블록체인 코드 한 줄로 인해 제로(0)로 수렴하는 혁신입니다.',
        ],
      },
    ],
  },
  {
    id: 3,
    icon: Database,
    accent: 'violet',
    title: '데이터 자산화 · AI',
    tagline: 'Oracle · 국가 AI',
    shortDesc: '모든 계측값이 온체인 기록 → AI 학습 → 범국가적 전력망 최적화.',
    imageCaption: '계량 → 온체인 → AI → 전력망 관리',
    detailTitle: '전력 데이터 자산화',
    summaryBullets: [
      {
        icon: Layers,
        text: '기존 전력 데이터는 기관별 Silo · 장주기 측정 · 조작 가능 — AI 학습에 부적합',
      },
      {
        icon: Brain,
        text: '초단위 계측 + 100% 무결성 검증 오라클 데이터를 블록체인에 영구 박제',
      },
      {
        icon: LineChart,
        text: '피크 수요 예측·발전 밸런싱 AI 학습 → 범국가적 전력망 관리 데이터 자산',
      },
    ],
    reportTitle: '고품질 전력 데이터의 자산화 (Data Capitalization)',
    reportSections: [
      {
        paragraphs: [
          '초거대 AI 시대를 맞아 하이퍼스케일 데이터센터가 폭증하면서, 전력은 단순한 소모재를 넘어 국가의 명운을 가르는 가장 핵심적인 전략 자산으로 격상되었습니다. 이러한 전력을 효율적으로 통제하려면 AI를 활용한 범국가적 단위의 전력 수요 예측과 관리가 필수적입니다. 하지만 기존의 전력 데이터는 각 기관에 파편화(Silo)되어 있고, 측정 주기가 길며, 인위적인 조작 가능성이 섞여 있어 AI 학습용 데이터로 쓰기에 품질이 현저히 떨어집니다.',
        ],
      },
      {
        paragraphs: [
          '저희가 블록체인에 영구 박제한 데이터는 다릅니다. 초 단위로 계측되고 100% 무결성이 검증된 오염되지 않은 오라클(Oracle) 데이터입니다. 이 고품질 데이터는 스마트 시티의 발전량 밸런싱, 피크 타임 수요 예측 등 초대형 AI 모델을 학습시키는 데 없어서는 안 될 엄청난 부가가치를 지닌 원유(Raw Material)가 됩니다.',
          '우리는 전력 계량기를 고차원적인 데이터 자산 생산 기지로 탈바꿈시켰습니다.',
        ],
      },
    ],
  },
  {
    id: 4,
    icon: Coins,
    accent: 'indigo',
    title: '원화 스테이블코인 정산',
    tagline: 'WON → CBDC',
    shortDesc: '한국은행 원화 스테이블코인 정책과 연계 — P2P 에너지 정산으로 디지털 금융 확장에 기여.',
    imageCaption: '이창용 총재 · 원화 스테이블코인 (2025.8.19 국회)',
    heroImage: '/presentation/bok-governor-slide.png',
    modalPhoto: '/presentation/bok-governor-news.png',
    detailTitle: 'CBDC 연계 차세대 핀테크망',
    summaryBullets: [
      {
        icon: Globe,
        text: 'PayPal·Visa 스테이블코인 결제망 상용화 — 국내 에너지 정산은 레거시 인프라에 머물러 있음',
      },
      {
        icon: Landmark,
        text: '한국은행 프로젝트 한강 · 이창용 총재 「원화 스테이블코인 도입」 국가 정책과 정합',
      },
      {
        icon: Link2,
        text: 'WON 토큰 스마트 컨트랙트 정산 → 원화 예금 토큰(CBDC) 즉시 연동 가능 설계',
      },
    ],
    reportTitle: '국가 디지털 화폐(CBDC) 연계 차세대 핀테크망',
    reportSections: [
      {
        paragraphs: [
          '현재 전 세계 금융 시장의 가장 뜨거운 화두는 단연 스테이블코인과 디지털 화폐(CBDC)입니다. 페이팔(PayPal)이 자체 스테이블코인을 발행하고 비자(Visa)가 결제망에 이를 연동하는 등, 글로벌 결제 인프라는 이미 블록체인 위로 올라탔습니다. 국내에서도 네이버, 카카오 등 빅테크 기업들이 블록체인 인프라와 결제 사업을 융합하기 위해 사활을 걸고 있으며, 특히 한국은행은 예금 토큰 기반의 디지털 화폐(CBDC) 도입을 위한 프로젝트 한강 파일럿 테스트를 본격적으로 추진하며 국가 주도의 디지털 금융 혁신에 시동을 걸었습니다.',
        ],
      },
      {
        paragraphs: [
          'MVP 그리드랩의 P2P 에너지 거래망은 바로 이 거대한 금융 패러다임 전환을 정확히 정조준하고 있습니다. 현재 저희가 구현한 블록체인 토큰 기반의 스마트 컨트랙트 정산 시스템은, 향후 한국은행이 발행할 원화 기반 예금 토큰(CBDC)과 즉각적으로 연동(Plugging)이 가능하도록 설계된 차세대 인프라입니다.',
          '에너지 산업과 최첨단 핀테크가 결합하는 그 교두보에 저희 시스템이 글로벌 표준으로서 자리매김할 것입니다.',
        ],
      },
    ],
  },
]

export const AUTO_SLIDE_MS = 6000
