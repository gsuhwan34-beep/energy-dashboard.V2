import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  type LucideIcon,
} from 'lucide-react'

export type TabAccent = 'blue' | 'amber' | 'emerald' | 'violet' | 'indigo'

export interface TextSegment {
  text: string
  highlight?: boolean
}

export interface DetailItem {
  headline: string
  points: TextSegment[][]
}

export interface ShowcaseDetailContent {
  punchline: string
  crisisTitle: string
  crisisItems: DetailItem[]
  innovationTitle: string
  innovationItems: DetailItem[]
}

export interface ShowcaseTab {
  id: number
  icon: LucideIcon
  accent: TabAccent
  title: string
  tagline: string
  shortDesc: string
  imageCaption: string
  /** 메인 화면 이미지 (5번 CBDC 슬라이드 등) */
  heroImage?: string
  /** 상세 모달 전용 이미지 (5번 뉴스 발언 사진) */
  modalPhoto?: string
  detailTitle: string
  detail: ShowcaseDetailContent
}

const seg = (text: string, highlight = false): TextSegment => ({ text, highlight })

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
    detail: {
      punchline: '중앙 서버가 다운되어도 전력 정산망은 무중단 가동.',
      crisisTitle: '중앙집중형의 위기',
      crisisItems: [
        {
          headline: '카카오 판교 DC 화재형 SPOF',
          points: [[seg('중앙 '), seg('단일 서버', true), seg(' 다운 시 '), seg('전국 계량·정산 동시 마비', true), seg('.')]],
        },
        {
          headline: 'SD카드·디스크 위변조',
          points: [[seg('물리 매체 '), seg('전력 수치 조작', true), seg(' 가능.')]],
        },
      ],
      innovationTitle: '분산 블록체인 방어',
      innovationItems: [
        {
          headline: 'Arbitrum L2 분산 저장',
          points: [[seg('전 세계 '), seg('수만 노드', true), seg(' 검증 · 중앙 서버 '), seg('불필요', true), seg('.')]],
        },
        {
          headline: 'RAM 큐 + 보조 전원',
          points: [[seg('휘발성 RAM만 사용 → '), seg('물리 위변조 차단', true), seg('.')]],
        },
      ],
    },
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
    detail: {
      punchline: '한전·플랫폼 없이 이웃과 1:1 직거래, 수수료 Zero.',
      crisisTitle: '중개 독점 구조',
      crisisItems: [
        {
          headline: '직거래 불가능',
          points: [[seg('이웃에게 팔려면 '), seg('한전·플랫폼', true), seg('을 반드시 거쳐야 함.')]],
        },
        {
          headline: '마진·정산 지연',
          points: [[seg('플랫폼 '), seg('수수료', true), seg('가 프로슈머 '), seg('실질 수익', true), seg(' 잠식.')]],
        },
      ],
      innovationTitle: 'MVP P2P 인프라',
      innovationItems: [
        {
          headline: '스마트 컨트랙트 1:1 매칭',
          points: [[seg('판매 단가 설정 → '), seg('생산·소비 자동 연결', true), seg('.')]],
        },
        {
          headline: 'WON 즉시 정산',
          points: [[seg('kWh 계측 = '), seg('WON 토큰 즉시 송금', true), seg(' · 수수료 '), seg('0원', true), seg('.')]],
        },
      ],
    },
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
    detail: {
      punchline: '계측 즉시 온체인 = RE100 녹색 전력 증명서.',
      crisisTitle: '기존 REC·실사',
      crisisItems: [
        {
          headline: 'RE100 = 생존 조건',
          points: [[seg('빅테크 하청 '), seg('RE100 미충족', true), seg(' 시 거래 탈락.')]],
        },
        {
          headline: '수개월·고비용',
          points: [[seg('현장 실사 → REC → '), seg('브로커 수수료', true), seg(' · '), seg('그린워싱', true), seg(' 위험.')]],
        },
      ],
      innovationTitle: '온체인 즉시 인증',
      innovationItems: [
        {
          headline: '스마트 컨트랙트 = 감사관',
          points: [[seg('계측량 '), seg('즉시 블록체인 영구 기록', true), seg(' · 조작 '), seg('불가', true), seg('.')]],
        },
        {
          headline: 'TxHash = 증명서',
          points: [[seg('서류·감사 비용 '), seg('Zero', true), seg(' · TxHash 하나로 '), seg('녹색 증명', true), seg('.')]],
        },
      ],
    },
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
    detail: {
      punchline: '온체인 오라클 데이터 → AI → 범국가적 전력망 관리.',
      crisisTitle: '기존 데이터 한계',
      crisisItems: [
        {
          headline: 'AI 학습 부적합',
          points: [[seg('기관별 '), seg('Silo', true), seg(' · 월·일 집계 · '), seg('조작 가능', true), seg('.')]],
        },
        {
          headline: '국가 경쟁력 위협',
          points: [[seg('AI 시대 '), seg('전력 수요 예측', true), seg(' 없이는 에너지 경쟁력 '), seg('붕괴', true), seg('.')]],
        },
      ],
      innovationTitle: 'MVP 데이터 기지',
      innovationItems: [
        {
          headline: '무결성 오라클',
          points: [[seg('초단위 계측 '), seg('블록체인 박제', true), seg(' → '), seg('오염 없는 Raw Data', true), seg('.')]],
        },
        {
          headline: 'AI 전력망 관리',
          points: [[seg('피크 예측 · '), seg('발전 밸런싱', true), seg(' · '), seg('이상 징후 감지', true), seg('.')]],
        },
      ],
    },
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
    detailTitle: '스테이블코인 기반 정산 · CBDC 확장',
    detail: {
      punchline: '스테이블코인 정산망 → 원화 CBDC 확장의 에너지 핀테크 교두보.',
      crisisTitle: '레거시 결제',
      crisisItems: [
        {
          headline: '은행·카드 중개',
          points: [[seg('P2P 정산에 '), seg('수수료·지연', true), seg(' · 스테이블코인 '), seg('미대응', true), seg('.')]],
        },
        {
          headline: '글로벌 격차',
          points: [[seg('해외 '), seg('스테이블코인 결제', true), seg(' 상용화 vs 국내 '), seg('구형 인프라', true), seg('.')]],
        },
      ],
      innovationTitle: 'MVP × 한국은행',
      innovationItems: [
        {
          headline: '원화 스테이블코인 정합',
          points: [[seg('이창용 총재 '), seg('「원화 SC 도입」', true), seg(' 정책과 '), seg('정합', true), seg('.')]],
        },
        {
          headline: 'WON → CBDC 연동',
          points: [[seg('WON 정산 → '), seg('원화 예금 토큰 즉시 연동', true), seg(' 가능 구조.')]],
        },
      ],
    },
  },
]

export const AUTO_SLIDE_MS = 6000
