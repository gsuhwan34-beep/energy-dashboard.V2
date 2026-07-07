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
