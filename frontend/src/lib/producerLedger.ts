/** IoT 생산 기록 (기존 컨트랙트) */
export const PRODUCER_METER_ADDRESS = '0x9F9013b71f59d8ecf4730B4946F988827e3EE2A8'
export const CONSUMER_METER_ADDRESS = '0xb551a87e38E7A838d9E8C3ef2CDbD40725Ad6a7B'

/** P2P 단가·판매·잔여 재고 (원장 v2 — Remix 재배포 후 주소 갱신) */
export const PRODUCER_LEDGER_ADDRESS = '0x0FF53BB6f54A08aBf410f64b6103100d5bF9404d'

export const PRODUCER_LEDGER_ABI = [
  'event EnergySold(address indexed producer, address indexed buyer, uint256 soldWh, uint256 cumulativeSoldWh, uint256 wonPaid, uint256 timestamp)',
  'function getStats(address producer) view returns (uint256 totalProducedWh, uint256 totalSoldWh, uint256 availableWh, uint256 lastUpdate, uint256 rate)',
  'function purchaseEnergy(address producer, uint256 whAmount)',
  'function setRate(uint256 rate)',
  'function ratePerKwh(address producer) view returns (uint256)',
] as const

/** Remix 배포본 custom error selector → 메시지 */
export const LEDGER_ERROR_MESSAGES: Record<string, string> = {
  '0x8b2024a5': '구버전 원장입니다. contracts/ProducerEnergyLedger.sol(v2)를 Remix에서 재배포 후 주소를 갱신해 주세요.',
  '0x6a43f8d1': '생산자 단가가 온체인에 없습니다. 생산자 탭에서 단가를 저장해 주세요.',
  '0xf499da20': 'WON 잔액 부족 또는 approve 실패입니다.',
  '0x2c5211c6': '정산 전력량이 올바르지 않습니다.',
}
