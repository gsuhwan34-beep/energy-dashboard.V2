import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface Props {
  label: string
  tip: string
  className?: string
}

export default function InfoTooltip({ label, tip, className = '' }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 cursor-help border-b border-dotted border-fg-muted/50 ${className}`}
        >
          {label}
          <HelpCircle className="w-3 h-3 text-fg-muted shrink-0" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-left leading-relaxed">
        {tip}
      </TooltipContent>
    </Tooltip>
  )
}

/** 블록체인·계량 관련 용어 설명 */
export const BLOCKCHAIN_TIPS = {
  tx: '트랜잭션(Tx)은 블록체인에 기록된 “디지털 영수증”입니다. 전력량이나 토큰 송금이 언제, 누구에 의해 처리됐는지 누구나 Arbiscan에서 확인할 수 있습니다.',
  block: '블록은 트랜잭션들이 묶여 저장되는 단위입니다. 블록 번호가 클수록 더 최근에 기록된 데이터입니다.',
  meterAddress: '계량기 주소는 IoT 계량기(또는 지갑)의 고유 ID입니다. 이 주소로 측정된 전력량이 온체인에 기록됩니다.',
  contract: '스마트 컨트랙트는 블록체인 위에서 자동 실행되는 프로그램입니다. 전력 기록·정산 규칙이 코드로 박혀 있어 임의 변경이 불가능합니다.',
  chain: '블록체인 네트워크 이름입니다. Arbitrum Sepolia는 이더리움과 호환되는 테스트넷으로, 실제 서비스 전 검증용입니다.',
  wh: '와트시(Wh)는 전력 사용량 단위입니다. 1,000 Wh = 1 kWh(킬로와트시)입니다.',
  kwh: '킬로와트시(kWh)는 우리가 전기요금 고지서에서 보는 단위와 같습니다.',
  won: 'WON은 이 시스템의 P2P 정산 토큰입니다. 주차별 전력 사용량에 따라 자동 계산·송금됩니다.',
  status: '“확인됨”은 해당 트랜잭션이 블록체인 네트워크에 성공적으로 기록·검증되었다는 뜻입니다.',
} as const
