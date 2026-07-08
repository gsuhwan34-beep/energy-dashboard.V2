/** IoT 생산 기록 (기존) + P2P 정산·단가·판매량 (원장) */
const PRODUCER_METER_ADDRESS = '0x9F9013b71f59d8ecf4730B4946F988827e3EE2A8';
const PRODUCER_METER_ABI = ['event EnergyProduced(address indexed producer, uint256 powerValue, uint256 timestamp)'];

const PRODUCER_LEDGER_ADDRESS = '0x19dc4197F13dD63dA63Dc124D7f41c69AAcb8AA2';
const PRODUCER_LEDGER_ABI = [
  'event EnergySold(address indexed producer, address indexed buyer, uint256 soldWh, uint256 cumulativeSoldWh, uint256 wonPaid, uint256 timestamp)',
  'function getStats(address producer) view returns (uint256 totalProducedWh, uint256 totalSoldWh, uint256 availableWh, uint256 lastUpdate, uint256 rate)',
  'function ratePerKwh(address producer) view returns (uint256)',
  'function setRateFor(address producer, uint256 rate)',
  'function owner() view returns (address)',
];

module.exports = {
  PRODUCER_METER_ADDRESS,
  PRODUCER_METER_ABI,
  PRODUCER_LEDGER_ADDRESS,
  PRODUCER_LEDGER_ABI,
};
