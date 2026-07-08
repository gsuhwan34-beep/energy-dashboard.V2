/**
 * 프리셋 공급자 단가를 P2P 원장에 등록.
 * 사용: LEDGER_OWNER_PRIVATE_KEY=0x... node scripts/set-preset-ledger-rates.js
 */
const { ethers } = require('ethers');
const { bootstrapPresetLedgerRates } = require('../lib/bootstrapLedgerRates');

const RPC_URL = process.env.RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
const key = process.env.LEDGER_OWNER_PRIVATE_KEY;

if (!key) {
  console.error('❌ LEDGER_OWNER_PRIVATE_KEY 환경 변수가 필요합니다.');
  console.error('   (원장 owner = Remix 배포 지갑, 현재 0x7fa8…)');
  process.exit(1);
}

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(key, provider);
  console.log('Caller:', wallet.address);
  const result = await bootstrapPresetLedgerRates(wallet);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.errors.length ? 1 : 0);
})();
