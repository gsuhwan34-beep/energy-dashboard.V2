import type { LucideIcon } from 'lucide-react'
import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  ServerCrash,
  Network,
  Activity,
  FileWarning,
  BadgeCheck,
  Timer,
  Layers,
  Brain,
  LineChart,
  Globe,
  Landmark,
  Link2,
  Lock,
  TrendingUp,
} from 'lucide-react'

export type TabAccent = 'blue' | 'amber' | 'emerald' | 'violet' | 'indigo'

export interface SummarySegment {
  text: string
  bold?: boolean
  underline?: boolean
  tooltip?: string
}

export interface SummaryBullet {
  icon: LucideIcon
  segments: SummarySegment[]
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
  /** 요약 모달 — 2번째 사진 (예: 이창용 전 총재 보도) */
  modalPhoto?: string
  modalPhotoCaption?: string
  /** 요약 모달 상단 — 1번째 사진 (메인 hero와 별도, 예: 이창용 국회 슬라이드) */
  modalSecondaryPhoto?: string
  modalSecondaryPhotoCaption?: string
  /** 메인 썸네일 — 2번째 사진 (예: 이창용 전 총재 국회 슬라이드) */
  secondaryPhoto?: string
  secondaryImageCaption?: string
  /** 요약 모달 — 불릿 위 추가 자료 (예: ECB 포럼 발표 슬라이드) */
  detailPhoto?: string
  detailPhotoCaption?: string
  detailTitle: string
  summaryBullets: SummaryBullet[]
  reportTitle: string
  reportSections: ReportSection[]
}

export const ACCENT_STYLES: Record<
  TabAccent,
  { ring: string; bg: string; text: string; boldText: string; border: string; gradient: string; badge: string }
> = {
  blue: {
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    boldText: 'text-blue-600/85',
    border: 'border-blue-200',
    gradient: 'from-blue-50 to-white',
    badge: 'bg-blue-100 text-blue-700',
  },
  amber: {
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    boldText: 'text-amber-600/85',
    border: 'border-amber-200',
    gradient: 'from-amber-50 to-white',
    badge: 'bg-amber-100 text-amber-800',
  },
  emerald: {
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    boldText: 'text-emerald-600/85',
    border: 'border-emerald-200',
    gradient: 'from-emerald-50 to-white',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  violet: {
    ring: 'ring-violet-500/30',
    bg: 'bg-violet-600',
    text: 'text-violet-600',
    boldText: 'text-violet-600/85',
    border: 'border-violet-200',
    gradient: 'from-violet-50 to-white',
    badge: 'bg-violet-100 text-violet-800',
  },
  indigo: {
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-600',
    text: 'text-indigo-600',
    boldText: 'text-indigo-600/85',
    border: 'border-indigo-200',
    gradient: 'from-indigo-50 to-white',
    badge: 'bg-indigo-100 text-indigo-800',
  },
}

const GREENWASHING_TOOLTIP =
  '실질적인 탄소 배출 감축이나 신재생에너지 확대 없이, 장부상의 수치나 제도의 허점을 이용해 재생에너지를 사용한 것처럼 위장하는 행위'

const seg = (
  text: string,
  bold = false,
  opts?: { underline?: boolean; tooltip?: string },
): SummarySegment => ({ text, bold, ...opts })

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 0,
    icon: ShieldCheck,
    accent: 'blue',
    title: '위변조 방지와 단일장애점 해소',
    tagline: 'Zero-SPOF · 무중단',
    shortDesc:
      '블록체인 분산 노드로 중앙 서버 마비, 데이터 위변조를 방지합니다.',
    imageCaption: '판교 데이터센터 화재 · 카카오톡·다음·페이 장애',
    heroImage: '/presentation/pangyo-dc-fire.png',
    detailTitle: '무신뢰 기반 무중단 인프라',
    summaryBullets: [
      {
        icon: ServerCrash,
        segments: [
          seg('카카오 '),
          seg('판교 데이터센터 화재', true),
          seg('처럼 중앙 관제 서버가 멈추면 전국 전력 계량·요금 정산이 한꺼번에 마비됩니다.'),
        ],
      },
      {
        icon: Network,
        segments: [
          seg('퍼블릭 '),
          seg('블록체인', true),
          seg('으로 전 세계 수만 개 노드에 '),
          seg('분산', true),
          seg(' 저장 — 99%가 해킹·파괴되어도 '),
          seg('무중단', true),
          seg(' 운영이 가능합니다.'),
        ],
      },
      {
        icon: Activity,
        segments: [
          seg('실시간 전력 측정', true),
          seg('으로 이상 추이·훼손을 감지하면 '),
          seg('라즈베리파이', true),
          seg('에서 메신저 즉시 알림, 스마트 컨트랙트로 '),
          seg('위변조 불가', true),
          seg('한 무신뢰 인프라를 구축합니다.'),
        ],
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
    title: 'P2P 직거래 및 자산 토큰화',
    tagline: '수수료 Zero · RWA · 탄소 배출권',
    shortDesc:
      '잉여 전력과 탄소 배출권을 토큰 자산으로 유동화하여, 거대 중개 기관 없이 개인 간 수수료 0원으로 직거래하는 친환경 금융 시장을 엽니다.',
    imageCaption: 'P2P 직거래 · RWA 토큰화',
    heroImage: '/presentation/p2p-rwa-platform.png',
    detailTitle: '중개자 없는 거래와 자산 토큰화 (P2P & RWA)',
    summaryBullets: [
      {
        icon: Lock,
        segments: [
          seg('거대 기관이 독점하던 에너지 시장의 한계로 인해, 개인은 전력을 팔 때 '),
          seg('막대한 중개 수수료', true),
          seg('를 내야 했고 '),
          seg('전력 거래', true),
          seg(', '),
          seg('탄소 배출권 거래', true),
          seg(' 시장에 대한 접근성이 떨어졌습니다.'),
        ],
      },
      {
        icon: ArrowRightLeft,
        segments: [
          seg('Web3 지갑을 연동하여 '),
          seg('스마트 컨트랙트', true),
          seg('가 '),
          seg('생산자', true),
          seg('와 '),
          seg('소비자', true),
          seg('를 '),
          seg('1:1 자동 매칭', true),
          seg('하고, 사용한 만큼 수수료 없이 100% 수익을 정산합니다.'),
        ],
      },
      {
        icon: TrendingUp,
        segments: [
          seg('더 나아가 잉여 전력과 탄소 배출권 등을 '),
          seg('실물 자산 토큰(RWA)', true),
          seg('으로 유동화하여, 누구나 스마트폰으로 거래할 수 있는 풍부한 유동성의 '),
          seg('P2P 금융 시장', true),
          seg('을 엽니다.'),
        ],
      },
    ],
    reportTitle: '수수료 없는 P2P 전력 거래와 에너지 실물 자산 토큰화 (RWA)',
    reportSections: [
      {
        paragraphs: [
          '미래의 에너지 패러다임은 각 가정이 스스로 전기를 생산하고 소비하는 마이크로그리드 시대로 전환되고 있습니다. 그러나 현재 개인이 생산한 전기를 이웃에게 팔기 위해서는 한전이나 거대 플랫폼 사업자를 반드시 거쳐야 하며, 이 과정에서 막대한 수수료와 정산 지연이 발생합니다. 또한, 개인이 창출해 낸 환경적 가치(탄소 배출권 등)는 거래 단위가 크고 규제가 복잡하여 B2B 대기업들만의 폐쇄적인 전유물로 전락해 있습니다.',
        ],
      },
      {
        paragraphs: [
          'MVP 그리드랩은 이 두 가지 진입 장벽을 블록체인 스마트 컨트랙트로 완전히 허물어냅니다. 첫째, 누구나 대시보드(Web3 지갑)에 접속해 단가를 설정하면 중개 기관 없이 생산자와 소비자가 1:1로 매칭됩니다. 측정된 전력량만큼 토큰(WON)으로 즉각 결제되므로 플랫폼 마진 없이 수익이 온전히 개인에게 돌아갑니다.',
        ],
      },
      {
        paragraphs: [
          "둘째, 단순한 요금 정산을 넘어 잉여 전력과 탄소 감축 기여도를 '실물 자산 토큰(RWA, Real World Asset)'으로 발행(Minting)합니다. 무겁고 거대한 기업용 에너지 자산을 1원 단위로 조각내어, 일반 개인도 주식 앱을 켜듯 쉽게 환경 자산을 소유하고 실시간으로 매매할 수 있는 유동 자산으로 변환하는 것입니다.",
        ],
      },
      {
        paragraphs: [
          "결론적으로 본 시스템은, 수수료 0원의 '초연결 에너지 직거래망'을 구축함과 동시에 경직된 거대 탄소 시장을 '고유동성 P2P 친환경 투자 시장'으로 혁신합니다. 이는 민간 차원의 신재생 에너지 생산을 유인하는 가장 강력한 경제적 인센티브가 될 것입니다.",
        ],
      },
    ],
  },
  {
    id: 2,
    icon: Leaf,
    accent: 'emerald',
    title: '투명한 온체인 RE100 인증',
    tagline: '그린워싱 차단 · 즉시 발급',
    shortDesc:
      '전력 생산 즉시 블록체인에 영구 기록되어, 만연한 그린워싱을 차단하고 서류·시간 낭비 없이 증명서를 발급합니다.',
    imageCaption: 'RE100 Members · 400+ 기업 100% 재생에너지 약속',
    heroImage: '/presentation/re100-members.png',
    detailTitle: '온체인 녹색 증명 (RE100 On-chain)',
    summaryBullets: [
      {
        icon: FileWarning,
        segments: [
          seg('애플·구글 등 기업의 '),
          seg('RE100', true),
          seg('은 하청업체가 필요, 수개월 REC 실사와 브로커 '),
          seg('비용', true),
          seg('이 듭니다.'),
        ],
      },
      {
        icon: BadgeCheck,
        segments: [
          seg('투명한 추적', true),
          seg(': 블록체인은 에너지의 출처를 변경 불가능하게 기록하여 '),
          seg('재생에너지 인증서', true),
          seg('('),
          seg('REC', true),
          seg(')의 정확한 추적을 보장하고 '),
          seg('그린워싱', true, { underline: true, tooltip: GREENWASHING_TOOLTIP }),
          seg('을 '),
          seg('방지', true),
          seg('합니다.'),
        ],
      },
      {
        icon: Timer,
        segments: [
          seg('온체인 데이터 = 녹색 전력 증명서', true),
          seg(' · 서류 심사·감사 비용 '),
          seg('Zero', true),
        ],
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
    title: '전력 데이터의 자산화',
    tagline: '무결점 Oracle · 국가 AI',
    shortDesc:
      '위변조가 불가능한 초 단위 계측 데이터를 통해, 국가 전력망 관리와 AI 학습을 위한 고부가가치 자산을 생산합니다.',
    imageCaption: '무결점 Oracle 데이터 · AI 학습',
    detailTitle: '고품질 전력 데이터 자산화 (Data Capital)',
    summaryBullets: [
      {
        icon: Layers,
        segments: [
          seg('기존 전력 데이터는 기관별 파편화 · 느린 측정 주기 · 조작 가능으로 인해 '),
          seg('AI 학습 부적합', true),
        ],
      },
      {
        icon: Brain,
        segments: [
          seg('초 단위 계측', true),
          seg(' + '),
          seg('무결성 검증', true),
          seg(' 후 블록체인에 영구 저장되는 '),
          seg('데이터', true),
          seg('를 생산합니다.'),
        ],
      },
      {
        icon: LineChart,
        segments: [
          seg('피크 수요 예측 · 전력 발전량 밸런싱 등을 위한 '),
          seg('AI 학습용', true),
          seg(' 고품질 '),
          seg('데이터 자산', true),
          seg('으로 활용됩니다.'),
        ],
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
    title: '통합원장 · 예금 토큰 연계',
    tagline: 'Unified Ledger · Project Hangang',
    shortDesc:
      'BIS 「통합원장」 창시자 신현송 총재 취임 이후 가속화되는 「프로젝트 한강」·「프로젝트 아고라」와 연동 가능한 에너지 엣지 정산 인프라입니다.',
    imageCaption: '2026 7월 ECB 포럼: 신현송 한은 총재 토큰화 발언',
    heroImage: '/presentation/bok-shin-ecb-speaking.png',
    secondaryPhoto: '/presentation/bok-governor-slide.png',
    secondaryImageCaption: '이창용 전 총재 · 원화 스테이블코인 국회 발언 (2025.8.19)',
    modalSecondaryPhoto: '/presentation/bok-hangang-ecb-slide.png',
    modalSecondaryPhotoCaption: '2026년 7월 ECB 포럼 : 신현송 총재 토큰화 발표',
    modalPhoto: '/presentation/bok-governor-news.png',
    modalPhotoCaption: '이창용 전 총재 · 디지털 화폐·스테이블코인 관련 보도 (2025)',
    detailTitle: '통합원장 생태계와 에너지 엣지 정산 (CBDC Network)',
    summaryBullets: [
      {
        icon: Globe,
        segments: [
          seg('2026년 4월 '),
          seg('신현송', true),
          seg(' 총재 취임 — BIS 재직 시 '),
          seg('통합원장(Unified Ledger)', true),
          seg('을 최초 제안·주도했던 인물이 한국은행을 이끌며 '),
          seg('예금 토큰·토큰화 결제', true),
          seg(' 정책이 본격 가속화'),
        ],
      },
      {
        icon: Landmark,
        segments: [
          seg('「'),
          seg('프로젝트 한강', true),
          seg('」 2단계(참여 은행 9개·EV 충전 '),
          seg('PBM', true),
          seg(') · BIS 「'),
          seg('프로젝트 아고라', true),
          seg('」 '),
          seg('실거래(real-value) 테스트', true),
          seg(' — '),
          seg('은행 주도 예금 토큰', true),
          seg('(민간 단독 스테이블코인과 구별)'),
        ],
      },
      {
        icon: Link2,
        segments: [
          seg('MVP 그리드랩 '),
          seg('온체인 계량·P2P 정산', true),
          seg('은 향후 '),
          seg('통합원장', true),
          seg(' 위 '),
          seg('예금 토큰·PBM', true),
          seg('과 '),
          seg('즉시 연동(Plug-in)', true),
          seg(' 가능한 '),
          seg('Programmable Energy Market', true),
          seg(' 엣지 인프라'),
        ],
      },
    ],
    reportTitle: '통합원장·예금 토큰과 에너지 마이크로 정산의 접점',
    reportSections: [
      {
        heading: 'BIS 통합원장과 정책 전환',
        paragraphs: [
          '국제결제은행(BIS)이 제시한 「통합원장(Unified Ledger)」은 중앙은행 화폐, commercial bank money(예금), 그리고 기타 금융·비금융 자산을 하나의 프로그래밍 가능한 원장 위에서 연결하는 글로벌 금융 인프라 구상입니다. 2026년 4월 21일부로 취임한 신현송 한국은행 총재는 BIS 재직 시 이 개념을 설계·주도했던 인물로, 그의 취임은 한국 금융 시스템에 통합원장·토큰화 예금을 빠르게 이식하겠다는 강한 정책 시그널로 해석됩니다.',
          '한국은행은 테더(USDT)형 민간 단독 스테이블코인이 아니라, 통화정책·금융 안정 관점에서 은행이 직접 발행하거나 은행 중심 컨소시엄(지분 51% 이상)이 주도하는 「예금 토큰(Tokenized Deposits)」을 핵심으로 합니다. 이는 지급준비율 통제와 통화량 조절을 유지하면서도 블록체인 기반 실시간·소액 정산을 가능하게 하는 모델입니다.',
        ],
      },
      {
        heading: '프로젝트 한강 · 프로젝트 아고라',
        paragraphs: [
          '국내 「프로젝트 한강」은 2026년 4월부터 2단계에 돌입해 참여 은행을 9개로 확대했으며, 전기차 충전 인프라 보조금 지급 등 PBM(특수지급·목적 기반 토큰) 활용 실증을 진행 중입니다. 한국은행은 2026년 5월 BIS와 공동 수행한 「프로젝트 아고라(Project Agorá)」 플랫폼 구축을 완료하고, 개념검증(PoC)을 넘어 실거래(real-value transactions) 테스트에 적극 참여하겠다고 발표했습니다.',
          '즉, 국가 주도의 블록체인 기반 원화 결제 생태계는 이미 파일럿을 넘어 실사용 검증 단계로 진입하고 있으며, 에너지·보조금·마이크로그리드처럼 고빈도·소액·조건부 지급이 많은 영역이 자연스러운 적용처가 됩니다.',
        ],
      },
      {
        heading: 'MVP 그리드랩과의 연결',
        paragraphs: [
          'MVP 그리드랩은 IoT 계량 데이터를 퍼블릭 블록체인(Arbitrum Sepolia)에 불변 기록하고, WON ERC-20 토큰으로 P2P 에너지 정산을 시연합니다. 현재 토큰은 테스트넷 시연용이지만, 스마트 컨트랙트 구조는 「계량 조건 충족 → 토큰 실행」이라는 통합원장·PBM과 동일한 논리를 따릅니다.',
          '프로젝트 한강 2단계의 EV 충전 보조금(PBM) 사례와 같이, 향후 생산·소비 Wh 데이터가 통합원장 상 예금 토큰과 연동되면 중간 청산소 없이 생산자–소비자 간 원자적 정산(Atomic Settlement)이 가능한 「Programmable Energy Market」으로 확장될 수 있습니다. 본 시스템은 그 전환을 앞당기는 에너지 엣지(Edge) 인프라입니다.',
        ],
      },
    ],
  },
]

export const AUTO_SLIDE_MS = 6000
