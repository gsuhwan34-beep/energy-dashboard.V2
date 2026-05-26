const { Router } = require('express')
const router = Router()

// ──────────────────────────────────────────────
// Arbitrum Sepolia — On-chain energy meter reader
// ──────────────────────────────────────────────

const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc'

// Your deployed energy metering contract
const CONTRACT = '0xb551a87e38e7a838d9e8c3ef2cdbd40725ad6a7b'

// Event topic hash emitted by the contract when energy is recorded
// EnergyRecorded(address indexed sender, uint256 wh, uint256 timestamp)
const EVENT_TOPIC = '0x07c2812332dce221b31ad3325bcc65886aa62950d575f48b33cf74bafee9f3cb'

// Function selector used to record energy: 0x0c3c3a7f
const RECORD_SELECTOR = '0x0c3c3a7f'

// ──────────────────────────────────────────────
// RPC helper
// ──────────────────────────────────────────────

async function rpc(method, params = []) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

// ──────────────────────────────────────────────
// Fetch all energy logs from chain for a wallet
// ──────────────────────────────────────────────

// Cache per wallet address
const cache = {}
const CACHE_TTL = 15_000 // 15 seconds — refresh frequently for live feel

async function fetchEnergyLogs(walletAddress) {
  const key = walletAddress.toLowerCase()
  const now = Date.now()
  if (cache[key] && now - cache[key].time < CACHE_TTL) {
    return cache[key].data
  }

  const addrPadded = '0x000000000000000000000000' + walletAddress.slice(2).toLowerCase()

  // Get the latest block number
  const latestHex = await rpc('eth_blockNumber')
  const latestBlock = parseInt(latestHex, 16)

  // Search a wide range (last ~10M blocks ≈ a few weeks on Arbitrum)
  const fromBlock = Math.max(0, latestBlock - 10_000_000)

  // Fetch logs: events emitted by the contract where topic[1] = wallet address
  const logs = await rpc('eth_getLogs', [{
    address: CONTRACT,
    fromBlock: '0x' + fromBlock.toString(16),
    toBlock: 'latest',
    topics: [EVENT_TOPIC, addrPadded],
  }])

  // mWh → Wh 전환 기준 시각: 2026-05-22 01:30:00 KST (UTC+9)
  // 이 시각 이후 기록된 데이터는 mWh(밀리와트시) 단위로 1000배 곱해져 있음
  const MWH_CUTOFF = Math.floor(new Date('2026-05-22T01:30:00+09:00').getTime() / 1000)

  // Decode each log into an energy reading
  const readings = []
  for (const log of (logs || [])) {
    const data = log.data.slice(2)
    const rawValue = parseInt(data.slice(0, 64), 16)
    const timestamp = parseInt(data.slice(64, 128), 16)
    const blockNumber = parseInt(log.blockNumber, 16)

    // 5/22 01:30 이후 데이터는 mWh → Wh 변환 (/1000)
    const wh = timestamp >= MWH_CUTOFF
      ? +(rawValue / 1000).toFixed(3)
      : rawValue

    readings.push({
      txHash: log.transactionHash,
      blockNumber,
      logIndex: parseInt(log.logIndex, 16),
      wh,
      kWh: +(wh / 1000).toFixed(6),
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
    })
  }

  // Sort by timestamp ascending
  readings.sort((a, b) => a.timestamp - b.timestamp)

  // Also fetch tx details (gas used) for each unique tx
  const uniqueTxHashes = [...new Set(readings.map(r => r.txHash))]
  const txDetails = {}

  // Batch fetch receipts
  await Promise.all(uniqueTxHashes.map(async (hash) => {
    try {
      const receipt = await rpc('eth_getTransactionReceipt', [hash])
      if (receipt) {
        txDetails[hash] = {
          gasUsed: parseInt(receipt.gasUsed, 16),
          effectiveGasPrice: receipt.effectiveGasPrice ? parseInt(receipt.effectiveGasPrice, 16) : 0,
          status: receipt.status === '0x1' ? 'confirmed' : 'failed',
        }
      }
    } catch { /* ignore individual failures */ }
  }))

  // Fetch block timestamps for accurate timing
  const uniqueBlocks = [...new Set(readings.map(r => r.blockNumber))]
  const blockTimes = {}
  await Promise.all(uniqueBlocks.map(async (bn) => {
    try {
      const block = await rpc('eth_getBlockByNumber', ['0x' + bn.toString(16), false])
      if (block) blockTimes[bn] = parseInt(block.timestamp, 16)
    } catch { /* ignore */ }
  }))

  // Enrich readings with tx details and block timestamps
  for (const r of readings) {
    const td = txDetails[r.txHash]
    if (td) {
      r.gasUsed = td.gasUsed
      r.status = td.status
      r.gasCostWei = td.gasUsed * td.effectiveGasPrice
      r.gasCostGwei = +(r.gasCostWei / 1e9).toFixed(4)
    }
    if (blockTimes[r.blockNumber]) {
      r.blockTimestamp = blockTimes[r.blockNumber]
      r.blockDate = new Date(blockTimes[r.blockNumber] * 1000).toISOString()
    }
  }

  const result = { readings, latestBlock, txDetails }
  cache[key] = { data: result, time: now }
  return result
}

// ──────────────────────────────────────────────
// GET /api/energy?wallet=0x...
// Overview + all readings for a wallet
// ──────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const wallet = req.query.wallet
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: 'Valid wallet address required (?wallet=0x...)' })
    }

    const { readings, latestBlock } = await fetchEnergyLogs(wallet)

    const totalWh = readings.reduce((s, r) => s + r.wh, 0)
    const totalGasUsed = readings.reduce((s, r) => s + (r.gasUsed || 0), 0)
    const totalGasCostGwei = readings.reduce((s, r) => s + (r.gasCostGwei || 0), 0)

    // Estimated electricity cost (Korean rate ~120 KRW/kWh)
    const ratePerKWh = 120
    const estimatedCostKRW = Math.round((totalWh / 1000) * ratePerKWh)

    res.json({
      wallet,
      contract: CONTRACT,
      network: 'Arbitrum Sepolia',
      chainId: 421614,
      latestBlock,
      overview: {
        totalReadings: readings.length,
        totalWh,
        totalKWh: +(totalWh / 1000).toFixed(4),
        estimatedCostKRW,
        totalGasUsed,
        totalGasCostGwei: +totalGasCostGwei.toFixed(4),
        firstReading: readings[0] || null,
        lastReading: readings[readings.length - 1] || null,
      },
      readings,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ──────────────────────────────────────────────
// GET /api/energy/network — Arbitrum Sepolia status
// ──────────────────────────────────────────────

router.get('/network', async (req, res) => {
  try {
    const [blockHex, chainIdHex] = await Promise.all([
      rpc('eth_blockNumber'),
      rpc('eth_chainId'),
    ])
    res.json({
      network: 'Arbitrum Sepolia',
      chainId: parseInt(chainIdHex, 16),
      latestBlock: parseInt(blockHex, 16),
      rpcUrl: RPC_URL,
      contract: CONTRACT,
      status: 'connected',
    })
  } catch (err) {
    res.json({
      network: 'Arbitrum Sepolia',
      chainId: 421614,
      latestBlock: null,
      rpcUrl: RPC_URL,
      contract: CONTRACT,
      status: 'disconnected',
      error: err.message,
    })
  }
})

// ──────────────────────────────────────────────
// WON 토큰 정산 기록 조회
// ──────────────────────────────────────────────

// ERC-20 Transfer(address indexed from, address indexed to, uint256 value)
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const WON_TOKEN = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'

// 공급자 지갑 목록 (신재생 / 일반 혼합)
const SUPPLIER_WALLETS = [
  '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8', // 신재생 에너지
  '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5', // 일반 혼합 전력
]

const settlementCache = {}
const SETTLEMENT_CACHE_TTL = 15_000

async function fetchTransfersForWallet(supplierAddr, latestBlock, fromBlock) {
  const toPadded = '0x000000000000000000000000' + supplierAddr.slice(2).toLowerCase()

  const logs = await rpc('eth_getLogs', [{
    address: WON_TOKEN,
    fromBlock: '0x' + fromBlock.toString(16),
    toBlock: 'latest',
    topics: [TRANSFER_TOPIC, null, toPadded],
  }])

  const transfers = []
  for (const log of (logs || [])) {
    const valueHex = log.data.slice(2)
    const valueWei = BigInt('0x' + valueHex)
    const blockNumber = parseInt(log.blockNumber, 16)
    const fromAddr = '0x' + log.topics[1].slice(26)

    let timestamp = 0
    try {
      const block = await rpc('eth_getBlockByNumber', [log.blockNumber, false])
      if (block) timestamp = parseInt(block.timestamp, 16)
    } catch { /* ignore */ }

    transfers.push({
      txHash: log.transactionHash,
      blockNumber,
      timestamp,
      from: fromAddr.toLowerCase(),
      to: supplierAddr.toLowerCase(),
      wonAmount: Number(valueWei / BigInt(10 ** 14)) / 10000,
    })
  }

  return transfers
}

// 모든 공급자 지갑으로 들어온 WON 전송을 한번에 조회
async function fetchAllSettlementLogs() {
  const CACHE_KEY = '__all_settlements__'
  const now = Date.now()
  if (settlementCache[CACHE_KEY] && now - settlementCache[CACHE_KEY].time < SETTLEMENT_CACHE_TTL) {
    return settlementCache[CACHE_KEY].data
  }

  const latestHex = await rpc('eth_blockNumber')
  const latestBlock = parseInt(latestHex, 16)
  const fromBlock = Math.max(0, latestBlock - 10_000_000)

  const allTransfers = []
  for (const wallet of SUPPLIER_WALLETS) {
    const transfers = await fetchTransfersForWallet(wallet, latestBlock, fromBlock)
    allTransfers.push(...transfers)
  }

  allTransfers.sort((a, b) => a.timestamp - b.timestamp)

  settlementCache[CACHE_KEY] = { data: allTransfers, time: now }
  return allTransfers
}

// GET /api/energy/settlements
// 모든 공급자 지갑으로 들어온 WON 전송 내역 (이중정산 방지)
router.get('/settlements', async (req, res) => {
  try {
    const transfers = await fetchAllSettlementLogs()
    res.json({ suppliers: SUPPLIER_WALLETS, wonToken: WON_TOKEN, transfers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
