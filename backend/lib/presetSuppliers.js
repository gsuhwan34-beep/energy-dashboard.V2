/** 프리셋 공급자 — UI 단가와 원장 setRateFor 초기값 */
const PRESET_SUPPLIERS = [
  {
    id: 'renewable',
    wallet: '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
    rate: 150,
    label: '제주 동복 풍력발전단지',
  },
  {
    id: 'mixed',
    wallet: '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e',
    rate: 100,
    label: '국가전력망 일반 혼합전력',
  },
];

const PRESET_RATE_BY_WALLET = Object.fromEntries(
  PRESET_SUPPLIERS.map((s) => [s.wallet.toLowerCase(), s.rate]),
);

function getPresetRate(wallet) {
  if (!wallet) return undefined;
  return PRESET_RATE_BY_WALLET[String(wallet).toLowerCase()];
}

module.exports = {
  PRESET_SUPPLIERS,
  PRESET_RATE_BY_WALLET,
  getPresetRate,
};
