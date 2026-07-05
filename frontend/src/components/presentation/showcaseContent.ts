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
  mainImage: string
  slideImage: string
  imageCaption: string
  /** contained = 슬라이드/뉴스 카드형 (CBDC 등) */
  heroStyle?: 'cover' | 'contained'
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
    shortDesc: '중앙 서버 1대가 죽으면 전국 정산이 멈춥니다. 분산 블록체인으로 SPOF를 제거합니다.',
    mainImage:
      'https://images.unsplash.com/photo-1544197150-b99a580bb736?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=85',
    imageCaption: '글로벌 분산 노드 — 중앙 서버 없이 데이터 무결성 검증',
    detailTitle: '단일 장애점(SPOF) 해소 및 스마트 컨트랙트 자동화',
    detail: {
      punchline: '중앙 서버가 불타도 국가 전력 정산망은 100% 무중단 가동됩니다.',
      crisisTitle: '현행 시스템의 치명적 위기 (SPOF)',
      crisisItems: [
        {
          headline: '카카오 판교 데이터센터 화재 — 단일 장애점의 실제 사례',
          points: [
            [
              seg('2022년 '),
              seg('카카오 판교 DC 화재', true),
              seg('로 카카오톡·택시·결제 등 '),
              seg('국민 생활 인프라가 동시 마비', true),
              seg('된 것과 같은 구조가 전력 정산에도 존재합니다.'),
            ],
            [
              seg('한전·중앙 관제 '),
              seg('단일 서버', true),
              seg(' 다운 시 '),
              seg('전국 계량·요금 정산', true),
              seg('이 일거에 중단됩니다.'),
            ],
          ],
        },
        {
          headline: '물리적 위변조 — SD카드 기반 IoT의 허점',
          points: [
            [
              seg('일반 계량기는 '),
              seg('SD카드·디스크', true),
              seg('에 기록 → 분해 후 '),
              seg('전력 수치 하향 조작', true),
              seg('이 가능합니다.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 무신뢰(Zero-Trust) 방어망',
      innovationItems: [
        {
          headline: 'Arbitrum L2 퍼블릭 블록체인 분산 저장',
          points: [
            [
              seg('전 세계 '),
              seg('수만 대 노드', true),
              seg('에 분산 — '),
              seg('99% 파괴', true),
              seg('되어도 '),
              seg('1%로 무중단', true),
              seg(' 운영.'),
            ],
            [
              seg('중앙 관리자·서버 '),
              seg('없이', true),
              seg(' 스마트 컨트랙트가 자동 검증·정산.'),
            ],
          ],
        },
        {
          headline: 'RAM 큐 + 독립 보조 전원 (하드웨어 방어)',
          points: [
            [
              seg('디스크 미기록 · '),
              seg('RAM(휘발성 메모리)', true),
              seg('만 사용 → 물리적 위변조 차단.'),
            ],
            [
              seg('전원 코드 '),
              seg('강제 차단', true),
              seg(' 감지 시 보조 전원 즉시 개입 → '),
              seg('온체인 강제 전송·Lock', true),
              seg('.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 1,
    icon: ArrowRightLeft,
    accent: 'amber',
    title: '중개인 없는 P2P 직거래',
    tagline: '수수료 Zero · 1:1 매칭',
    shortDesc: '한전·플랫폼 마진 없이, 프로슈머와 소비자가 MetaMask로 직접 전력·토큰을 교환합니다.',
    mainImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85',
    imageCaption: '지붕 태양광 → 이웃 소비자로 직접 전력·정산',
    detailTitle: '중개인 없는 P2P 분산 에너지 직거래',
    detail: {
      punchline: '한전·플랫폼 없이, 이웃과 전력을 1:1 직거래하고 수수료는 Zero(0)입니다.',
      crisisTitle: '현행 중개 독점 구조의 한계',
      crisisItems: [
        {
          headline: '마이크로그리드 시대, 직거래는 여전히 불가능',
          points: [
            [
              seg('가정·빌딩 '),
              seg('자가 발전(태양광)', true),
              seg('은 보편화됐지만, 이웃에게 팔려면 '),
              seg('한전·거대 플랫폼', true),
              seg('을 반드시 거쳐야 합니다.'),
            ],
          ],
        },
        {
          headline: '중개 마진·행정 지연이 프로슈머 수익을 잠식',
          points: [
            [
              seg('플랫폼 '),
              seg('수수료·정산 지연', true),
              seg('으로 실질 수익 감소 → '),
              seg('민간 신재생 투자', true),
              seg(' 위축.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 P2P 직거래 인프라',
      innovationItems: [
        {
          headline: 'MetaMask + 스마트 컨트랙트 자동 1:1 매칭',
          points: [
            [
              seg('생산자가 대시보드에서 '),
              seg('판매 단가(kWh)', true),
              seg(' 설정 → 컨트랙트가 '),
              seg('소비자·생산자 자동 연결', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: 'WON 토큰 즉시 정산 — 수수료 0원',
          points: [
            [
              seg('계측 kWh = '),
              seg('WON 토큰 즉시 송금', true),
              seg(' · 은행·카드 중개 '),
              seg('불필요', true),
              seg('.'),
            ],
            [
              seg('플랫폼 마진 '),
              seg('0원', true),
              seg(' → 수익 100% '),
              seg('프로슈머 귀속', true),
              seg('.'),
            ],
          ],
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
    shortDesc: '수개월 REC 실사 대신, 계측과 동시에 온체인에 기록되어 즉시 녹색 전력 증명이 됩니다.',
    mainImage:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1497435334941-289c81284090?auto=format&fit=crop&w=1200&q=85',
    imageCaption: '재생에너지 생산 → 블록체인 즉시 인증',
    detailTitle: 'RE100 인증 프리패스 (시간/비용 ZERO)',
    detail: {
      punchline: '수개월 REC 서류 대신, 계측 즉시 온체인 = 녹색 전력 증명서 완성.',
      crisisTitle: '현행 RE100 — 시간·비용·그린워싱의 삼중고',
      crisisItems: [
        {
          headline: '글로벌 빅테크의 필수 무역 장벽',
          points: [
            [
              seg('애플·구글·아마zon '),
              seg('RE100', true),
              seg('은 하청업체 '),
              seg('생존 조건', true),
              seg(' — 미충족 시 거래 탈락.'),
            ],
          ],
        },
        {
          headline: '수주~수개월 실사 · REC · 브로커 비용',
          points: [
            [
              seg('에너지공단 '),
              seg('현장 실사', true),
              seg(' → REC 발급 → '),
              seg('브로커 수수료', true),
              seg(' · '),
              seg('그린워싱', true),
              seg(' 검증 지연.'),
            ],
          ],
        },
      ],
      innovationTitle: '온체인 데이터 = 24시간 감사관',
      innovationItems: [
        {
          headline: '스마트 컨트랙트가 감사관 역할 수행',
          points: [
            [
              seg('태양광 계측량 '),
              seg('즉시 블록체인 영구 기록', true),
              seg(' → 사람 개입·숫자 조작 '),
              seg('원천 불가', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: 'On-chain Proof = RE100 증명서',
          points: [
            [
              seg('수개월 서류·감사 비용 → '),
              seg('Zero(0)', true),
              seg(' · TxHash 하나로 '),
              seg('녹색 전력 생산 증명', true),
              seg(' 완료.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 3,
    icon: Database,
    accent: 'violet',
    title: '데이터 자산화 · AI',
    tagline: 'Oracle Data · 국가 AI',
    shortDesc: '초단위 무결 계측 데이터가 AI 학습 원료가 되어, 전국 전력 수요를 예측·최적화합니다.',
    mainImage:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    imageCaption: '고품질 전력 데이터 → AI 수요 예측 · 이상 감지',
    detailTitle: '고품질 전력 데이터의 자산화 (Data Capitalization)',
    detail: {
      punchline: '온체인 오라클 데이터 → AI 학습 → 범국가적 전력망 최적화.',
      crisisTitle: '기존 전력 데이터 — AI 학습에 부적합',
      crisisItems: [
        {
          headline: '전력 = 국가 전략 자산, 데이터 품질은 낙후',
          points: [
            [
              seg('AI·데이터센터 시대 — '),
              seg('전력 수요 예측', true),
              seg(' 없이는 '),
              seg('국가 에너지 경쟁력', true),
              seg(' 붕괴.'),
            ],
          ],
        },
        {
          headline: 'Silo · 장주기 측정 · 조작 가능',
          points: [
            [
              seg('기관별 '),
              seg('데이터 Silo', true),
              seg(', 월·일 단위 집계, '),
              seg('인위적 조작', true),
              seg(' 혼재 → AI 원유로 사용 불가.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 — 데이터 자산 생산 기지',
      innovationItems: [
        {
          headline: '100% 무결성 오라클(Oracle) 데이터',
          points: [
            [
              seg('초 단위 계측 · '),
              seg('블록체인 영구 박제', true),
              seg(' → '),
              seg('오염 없는 Raw Data', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: 'AI · 범국가적 전력망 관리',
          points: [
            [
              seg('스마트시티 '),
              seg('발전량 밸런싱', true),
              seg(' · '),
              seg('피크 타임 수요 예측', true),
              seg(' · '),
              seg('Isolation Forest', true),
              seg(' 이상 징후 감지.'),
            ],
            [
              seg('계량기 → '),
              seg('국가 AI 학습용 데이터 자산', true),
              seg(' 생산 기지.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 4,
    icon: Coins,
    accent: 'indigo',
    title: 'CBDC · 원화 스테이블코인',
    tagline: 'WON Token → CBDC',
    shortDesc: '한국은행 원화 스테이블코인 정책과 맞물린 P2P 에너지 정산 — 차세대 핀테크 인프라.',
    mainImage: '/presentation/bok-governor-slide.png',
    slideImage: '/presentation/bok-governor-news.png',
    heroStyle: 'contained',
    imageCaption: '이창용 한국은행 총재 · 「원화 스테이블코인 도입」 국회 업무보고 (2025.8.19)',
    detailTitle: '국가 디지털 화폐(CBDC) 연계 차세대 핀테크망',
    detail: {
      punchline: 'WON 토큰 정산망 → 원화 CBDC·스테이블코인 확장의 에너지 핀테크 교두보.',
      crisisTitle: '레거시 에너지 결제 — 디지털 금융과 단절',
      crisisItems: [
        {
          headline: '은행·카드 중개 정산의 한계',
          points: [
            [
              seg('P2P 에너지 정산에 '),
              seg('복잡한 은행 중개', true),
              seg(' · '),
              seg('수수료·지연', true),
              seg(' · 스테이블코인·CBDC '),
              seg('미대응', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: '글로벌 핀테크 vs 국내 에너지 정산 괴리',
          points: [
            [
              seg('PayPal·Visa '),
              seg('스테이블코인', true),
              seg(' 결제망은 이미 상용화 — 국내 에너지는 '),
              seg('구형 인프라', true),
              seg('에 머물러 있습니다.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 × 한국은행 디지털 금융',
      innovationItems: [
        {
          headline: '프로젝트 한강 · 원화 스테이블코인',
          points: [
            [
              seg('한국은행 '),
              seg('예금 토큰(CBDC)', true),
              seg(' 파일럿 · '),
              seg('이창용 총재', true),
              seg(' 「원화 스테이블코인 도입」 정책 방향과 정합.'),
            ],
          ],
        },
        {
          headline: 'WON Token → CBDC 1:1 Plugging 설계',
          points: [
            [
              seg('현재 '),
              seg('WON 스마트 컨트랙트 정산', true),
              seg(' → 향후 '),
              seg('원화 예금 토큰 즉시 연동', true),
              seg(' 가능 구조.'),
            ],
            [
              seg('에너지 산업 × '),
              seg('차세대 핀테크', true),
              seg(' — 국가 디지털 화폐 확장에 기여.'),
            ],
          ],
        },
      ],
    },
  },
]
