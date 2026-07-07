/** IoT 생산 기록 (기존) + P2P 정산·단가·판매량 (원장) */
const PRODUCER_METER_ADDRESS = '0x9F9013b71f59d8ecf4730B4946F988827e3EE2A8';
const PRODUCER_METER_ABI = ['event EnergyProduced(address indexed producer, uint256 powerValue, uint256 timestamp)'];

const PRODUCER_LEDGER_ADDRESS = '0x0FF53BB6f54A08aBf410f64b6103100d5bF9404d';
const PRODUCER_LEDGER_ABI = [
  'event EnergySold(address indexed producer, address indexed buyer, uint256 soldWh, uint256 cumulativeSoldWh, uint256 availableWh, uint256 wonPaid, uint256 timestamp)',
  'event EnergySold(address indexed producer, address indexed buyer, uint256 soldWh, uint256 cumulativeSoldWh, uint256 wonPaid, uint256 timestamp)',
  'function getStats(address producer) view returns (uint256 totalProducedWh, uint256 totalSoldWh, uint256 availableWh, uint256 lastUpdate, uint256 rate)',
  'function recordProduction(address producer, uint256 deltaWh)',
  'function ratePerKwh(address producer) view returns (uint256)',
];

module.exports = {
  PRODUCER_METER_ADDRESS,
  PRODUCER_METER_ABI,
  PRODUCER_LEDGER_ADDRESS,
  PRODUCER_LEDGER_ABI,
};
