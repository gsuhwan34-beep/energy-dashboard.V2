const { ethers } = require('ethers');
const { PRESET_SUPPLIERS } = require('./presetSuppliers');
const { PRODUCER_LEDGER_ADDRESS } = require('./producerLedger');

const LEDGER_ABI = [
  'function owner() view returns (address)',
  'function ratePerKwh(address producer) view returns (uint256)',
  'function setRateFor(address producer, uint256 rate)',
];

/**
 * 프리셋 공급자 단가를 P2P 원장에 등록 (owner 전용).
 * @returns {{ set: string[], skipped: string[], errors: { wallet: string, error: string }[] }}
 */
async function bootstrapPresetLedgerRates(signerOrWallet) {
  const ledger = new ethers.Contract(PRODUCER_LEDGER_ADDRESS, LEDGER_ABI, signerOrWallet);
  const owner = await ledger.owner();
  const caller = await signerOrWallet.getAddress();

  if (owner.toLowerCase() !== caller.toLowerCase()) {
    throw new Error(`Ledger owner is ${owner}, not ${caller}`);
  }

  const result = { set: [], skipped: [], errors: [] };

  for (const supplier of PRESET_SUPPLIERS) {
    const producer = ethers.getAddress(supplier.wallet);
    try {
      const current = await ledger.ratePerKwh(producer);
      if (current > 0n) {
        result.skipped.push(producer);
        continue;
      }
      const tx = await ledger.setRateFor(producer, supplier.rate);
      await tx.wait();
      result.set.push(producer);
      console.log(`✅ setRateFor ${supplier.label}: ${supplier.rate} WON/kWh (${tx.hash})`);
    } catch (err) {
      result.errors.push({ wallet: producer, error: err.message || String(err) });
      console.warn(`⚠ setRateFor failed for ${producer}:`, err.message);
    }
  }

  return result;
}

module.exports = { bootstrapPresetLedgerRates };
