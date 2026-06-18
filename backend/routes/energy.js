const { Router } = require('express')
const router = Router()

// ──────────────────────────────────────────────
// Arbitrum Sepolia — On-chain energy meter reader
// ──────────────────────────────────────────────

const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc'
const CONTRACT = '0xb551a87e38e7a838d9e8c3ef2cdbd40725ad6a7b'
const EVENT_TOPIC = '0x07c2812332dce221b31ad3325bcc65886aa62950d575f48b33cf74bafee9f3cb'

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

const cache = {}
const CACHE_TTL = 15_000

async function fetchEnergyLogs(walletAddress) {
  const key = walletAddress.toLowerCase()
  const now = Date.now()
  if (cache[key] && now - cache[key].time < CACHE_TTL) {
    return cache[key].data
  }

  const addrPadded = '0x000000000000000000000000' + walletAddress.slice(2).toLowerCase()
  const latestHex = await rpc('eth_blockNumber')
  const latestBlock = parseInt(latestHex, 16)
  const fromBlock = Math.max(0, latestBlock - 10_000_000)

  const logs = await rpc('eth_getLogs', [{
    address: CONTRACT,
    fromBlock: '0x' + fromBlock.toString(16),
    toBlock: 'latest',
    topics: [EVENT_TOPIC, addrPadded],
  }])

  const MWH_CUTOFF = Math.floor(new Date('2026-05-22T01:30:00+09:00').getTime() / 1000)
  const readings = []
  
  for (const log of (logs || [])) {
    const data = log.data.slice(2)
    const rawValue = parseInt(data.slice(0, 64), 16)
    const timestamp = parseInt(data.slice(64, 128), 16)
    const blockNumber = parseInt(log.blockNumber, 16)

    const wh = timestamp >= MWH_CUTOFF ? +(rawValue / 1000).toFixed(3) : rawValue

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

  readings.sort((a, b) => a.timestamp - b.timestamp)

  const uniqueTxHashes = [...new Set(readings.map(r => r.txHash))]
  const txDetails = {}

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
    } catch { /* ignore */ }
  }))

  const uniqueBlocks = [...new Set(readings.map(r => r.blockNumber))]
  const blockTimes = {}
  
  await Promise.all(uniqueBlocks.map(async (bn) => {
    try {
      const block = await rpc('eth_getBlockByNumber', ['0x' + bn.toString(16), false])
      if (block) blockTimes[bn] = parseInt(block.timestamp, 16)
    } catch { /* ignore */ }
  }))

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
// WON 토큰 정산 기록 조회 (P2P 대응: 발신자 기준 조회)
// ──────────────────────────────────────────────

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const WON_TOKEN = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'

async function fetchTransfersFromWallet(consumerWallet, latestBlock) {
  const fromPadded = '0x000000000000000000000000' + consumerWallet.slice(2).toLowerCase()
  const fromBlock = Math.max(0, latestBlock - 10_000_000)

  const logs = await rpc('eth_getLogs', [{
    address: WON_TOKEN,
    fromBlock: '0x' + fromBlock.toString(16),
    toBlock: 'latest',
    topics: [TRANSFER_TOPIC, fromPadded],
  }])

  const transfers = []
  for (const log of (logs || [])) {
    const valueHex = log.data.slice(2)
    const valueWei = BigInt('0x' + valueHex)
    const blockNumber = parseInt(log.blockNumber, 16)
    const toAddr = '0x' + log.topics[2].slice(26)

    // 🔥 핵심 픽스: 무료 서버가 요청을 팅겨내서 1970년으로 기록되는 버그 방지
    // 블록 시간을 못 가져오면 0이 아니라 무조건 '현재 시간'으로 기록되게 세팅
    let timestamp = Math.floor(Date.now() / 1000)
    try {
      const block = await rpc('eth_getBlockByNumber', [log.blockNumber, false])
      if (block && block.timestamp) {
        timestamp = parseInt(block.timestamp, 16)
      }
    } catch { /* 에러 나면 위에서 세팅한 '현재 시간'이 그대로 들어감 */ }

    transfers.push({
      txHash: log.transactionHash,
      blockNumber,
      timestamp,
      from: consumerWallet.toLowerCase(),
      to: toAddr.toLowerCase(),
      wonAmount: Number(valueWei / BigInt(10 ** 14)) / 10000,
    })
  }

  return transfers.sort((a, b) => a.timestamp - b.timestamp)
}

router.get('/settlements', async (req, res) => {
  try {
    const wallet = req.query.wallet
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: 'Valid wallet address required (?wallet=0x...)' })
    }

    const latestHex = await rpc('eth_blockNumber')
    const latestBlock = parseInt(latestHex, 16)

    const transfers = await fetchTransfersFromWallet(wallet, latestBlock)
    
    res.json({ wonToken: WON_TOKEN, transfers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
