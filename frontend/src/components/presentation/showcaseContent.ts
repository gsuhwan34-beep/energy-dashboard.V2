import {
  ShieldCheck,
  ArrowRightLeft,
  Leaf,
  Database,
  Coins,
  type LucideIcon,
} from 'lucide-react'

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
  title: string
  shortDesc: string
  mainImage: string
  slideImage: string
  mainImageLocal?: string
  detailTitle: string
  detail: ShowcaseDetailContent
}

const seg = (text: string, highlight = false): TextSegment => ({ text, highlight })

export const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 0,
    icon: ShieldCheck,
    title: '단일 장애점(SPOF) 해소',
    shortDesc:
      '서버 다운 시 모든 게 마비되는 기존 망과 달리, 블록체인 노드로 위변조와 중단을 원천 차단합니다.',
    mainImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85',
    detailTitle: '단일 장애점(SPOF) 해소 및 스마트 컨트랙트 자동화',
    detail: {
      punchline: '중앙 서버가 불타도 국가 전력 정산망은 100% 무중단 가동됩니다.',
      crisisTitle: '현행 시스템의 치명적 위기 (SPOF)',
      crisisItems: [
        {
          headline: '카카오 판교 데이터센터 화재 사건의 재림',
          points: [
            [
              seg('한전 등 거대 중개 기관의 '),
              seg('중앙 서버', true),
              seg('가 마비·해킹당하면 '),
              seg('국가 전체 전력 계량·정산', true),
              seg('이 일거에 멈추는 독점 구조.'),
            ],
          ],
        },
        {
          headline: '물리적 데이터 조작 취약성',
          points: [
            [
              seg('상용 IoT 계량기는 '),
              seg('SD카드 등 비활성 메모리', true),
              seg(' 사용 → 기기 분해 후 '),
              seg('전력 수치 하향 위변조', true),
              seg('에 방어 불가.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩의 무신뢰 방어망 (TO-BE)',
      innovationItems: [
        {
          headline: '99%가 파괴되어도 생존하는 블록체인 분산망',
          points: [
            [
              seg('Arbitrum L2 '),
              seg('글로벌 분산 노드', true),
              seg('에 데이터 저장 → 중앙 관리자 없이 무결성 검증, '),
              seg('해킹 원천 차단', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: 'RAM 큐 & 독립 보조 전원 융합',
          points: [
            [
              seg('디스크 미기록 · '),
              seg('RAM(휘발성 메모리)', true),
              seg('만 사용해 위변조 차단.'),
            ],
            [
              seg('고의적 '),
              seg('전원 차단', true),
              seg(' 시 보조 전원 즉시 개입 → '),
              seg('온체인 강제 전송·Lock', true),
              seg(' 구현.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 1,
    icon: ArrowRightLeft,
    title: '중개인 없는 P2P 직거래',
    shortDesc:
      '거대 기관 없이, 수많은 개인이 수수료 Zero로 전력을 사고파는 진정한 분산 생태계입니다.',
    mainImage:
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    detailTitle: '중개인 없는 P2P 분산 에너지 직거래',
    detail: {
      punchline: '한전·플랫폼 없이, 이웃과 전력을 1:1 직거래하고 수수료는 Zero(0)입니다.',
      crisisTitle: '현행 시스템의 치명적 한계 (중개 독점)',
      crisisItems: [
        {
          headline: '마이크로그리드 시대, 접근성은 후퇴',
          points: [
            [
              seg('가정·빌딩이 전력을 '),
              seg('자가 생산', true),
              seg('해도 이웃에게 팔려면 '),
              seg('한전·거대 플랫폼', true),
              seg('을 반드시 거쳐야 함.'),
            ],
          ],
        },
        {
          headline: '수수료·행정 지연이 수익을 잠식',
          points: [
            [
              seg('중개 '),
              seg('마진·행정 처리 지연', true),
              seg('으로 프로슈머 실질 수익 감소 → '),
              seg('민간 신재생 투자', true),
              seg(' 위축.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 P2P 직거래 (TO-BE)',
      innovationItems: [
        {
          headline: 'MetaMask · 스마트 컨트랙트 1:1 매칭',
          points: [
            [
              seg('대시보드에서 '),
              seg('판매 단가 설정', true),
              seg(' → 컨트랙트가 '),
              seg('생산자·소비자 자동 매칭', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: 'WON 토큰 즉시 정산 · 수수료 Zero',
          points: [
            [
              seg('측정 kWh만큼 '),
              seg('WON 토큰 즉시 송금', true),
              seg(' → 플랫폼 마진 '),
              seg('0원', true),
              seg(', 수익 100% 개인 귀속.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 2,
    icon: Leaf,
    title: 'RE100 인증 프리패스',
    shortDesc:
      '수개월 걸리던 서류 절차 없이, 계측과 동시에 온체인 기록되어 즉각적인 증명서가 됩니다.',
    mainImage:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&w=1200&q=85',
    detailTitle: 'RE100 인증 프리패스 (시간/비용 ZERO)',
    detail: {
      punchline: '수개월 REC 서류 대신, 계측 즉시 온체인 = 녹색 전력 증명서 완성.',
      crisisTitle: '현행 RE100의 모순 (시간·비용 지옥)',
      crisisItems: [
        {
          headline: '글로벌 빅테크의 필수 무역 장벽',
          points: [
            [
              seg('애플·구글 등 '),
              seg('RE100', true),
              seg('은 하청업체 '),
              seg('생존 요건', true),
              seg(' — 증명 못 하면 거래 탈락.'),
            ],
          ],
        },
        {
          headline: '수주~수개월 실사 · REC · 브로커 비용',
          points: [
            [
              seg('에너지공단 '),
              seg('복잡한 실사', true),
              seg(' → REC 발급 → '),
              seg('브로커 수수료', true),
              seg(' · 그린워싱 검증 지연.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 온체인 감사관 (TO-BE)',
      innovationItems: [
        {
          headline: '스마트 컨트랙트 = 24시간 감사관',
          points: [
            [
              seg('태양광 계측량 '),
              seg('즉시 블록체인 영구 기록', true),
              seg(' → 사람 개입·숫자 조작 '),
              seg('불가', true),
              seg('.'),
            ],
          ],
        },
        {
          headline: '온체인 데이터 = 완벽한 녹색 증명서',
          points: [
            [
              seg('수개월 서류·감사 비용 → '),
              seg('Zero(0)', true),
              seg(' · '),
              seg('On-chain 데이터', true),
              seg(' 자체가 RE100 증명.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 3,
    icon: Database,
    title: '데이터의 자산화 및 AI',
    shortDesc:
      '무결점 데이터는 AI 학습 자산이 되어, 이상 징후를 감지하고 국가 전력 수요를 관리합니다.',
    mainImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85',
    slideImage:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85',
    detailTitle: '고품질 전력 데이터의 자산화 (Data Capitalization)',
    detail: {
      punchline: '온체인 오라클 데이터 → AI 학습 → 범국가적 전력망 최적화.',
      crisisTitle: '현행 전력 데이터의 한계 (AI 학습 부적합)',
      crisisItems: [
        {
          headline: '전력 = 국가 전략 자산, 데이터는 낙후',
          points: [
            [
              seg('하이퍼스케일 DC 시대 — '),
              seg('AI 전력 수요 예측', true),
              seg(' 없이는 국가 경쟁력 붕괴.'),
            ],
          ],
        },
        {
          headline: 'Silo · 장주기 · 조작 가능성',
          points: [
            [
              seg('기관별 '),
              seg('파편화(Silo)', true),
              seg(', 측정 주기 김, '),
              seg('인위적 조작', true),
              seg(' 혼재 → AI 원유로 부적합.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 데이터 자산 (TO-BE)',
      innovationItems: [
        {
          headline: '100% 무결성 오라클(Oracle) 데이터',
          points: [
            [
              seg('초 단위 계측 · '),
              seg('블록체인 영구 박제', true),
              seg(' → 오염 없는 '),
              seg('고품질 Raw Data', true),
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
              seg(' · 이상 징후 AI 감지.'),
            ],
            [
              seg('계량기 = '),
              seg('데이터 자산 생산 기지', true),
              seg('로 탈바꿈.'),
            ],
          ],
        },
      ],
    },
  },
  {
    id: 4,
    icon: Coins,
    title: 'CBDC 연계 차세대 핀테크',
    shortDesc:
      '한국은행 원화 스테이블코인 정책과 맞물려 차세대 디지털 에너지 결제 인프라로 확장됩니다.',
    mainImage:
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1600&q=85',
    mainImageLocal: '/image_1d665e.jpg',
    slideImage:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85',
    detailTitle: '국가 디지털 화폐(CBDC) 연계 차세대 핀테크망',
    detail: {
      punchline: 'WON 토큰 정산망 → 원화 CBDC·스테이블코인 확장의 에너지 핀테크 교두보.',
      crisisTitle: '현행 에너지 결제의 한계',
      crisisItems: [
        {
          headline: '레거시 은행·카드 정산의 비효율',
          points: [
            [
              seg('P2P 에너지 정산에 '),
              seg('복잡한 은행 중개', true),
              seg(' · 높은 '),
              seg('수수료·지연', true),
              seg(' · 디지털 화폐 미대응.'),
            ],
          ],
        },
        {
          headline: '금융 패러다임 전환과의 단절',
          points: [
            [
              seg('PayPal·Visa '),
              seg('스테이블코인', true),
              seg(' 결제망 vs 국내 에너지 정산 '),
              seg('구형 인프라', true),
              seg(' 괴리.'),
            ],
          ],
        },
      ],
      innovationTitle: 'MVP 그리드랩 × CBDC (TO-BE)',
      innovationItems: [
        {
          headline: '한국은행 프로젝트 한강 · 원화 스테이블코인',
          points: [
            [
              seg('BOK '),
              seg('예금 토큰(CBDC)', true),
              seg(' 파일럿 — '),
              seg('이창용 총재', true),
              seg(' 원화 스테이블코인 정책과 동행.'),
            ],
          ],
        },
        {
          headline: 'WON 토큰 → CBDC 1:1 Plugging',
          points: [
            [
              seg('현재 '),
              seg('WON 스마트 컨트랙트 정산', true),
              seg(' → 향후 '),
              seg('원화 예금 토큰 즉시 연동', true),
              seg(' 설계 완료.'),
            ],
            [
              seg('에너지 × '),
              seg('차세대 핀테크', true),
              seg(' 글로벌 표준 인프라.'),
            ],
          ],
        },
      ],
    },
  },
]
