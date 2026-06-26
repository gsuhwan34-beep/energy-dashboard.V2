// ──────────────────────────────────────────────
// WON 토큰 정산 기록 조회 (🔥 P2P 대응: 공급자가 "받은" 내역 조회)
// ──────────────────────────────────────────────

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const WON_TOKEN = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'

async function fetchTransfersToSupplier(supplierWallet, latestBlock) {
  // 🔥 토픽 2(세 번째 자리)가 수신자(To)입니다. 수신자 기준으로 검색!
  const toPadded = '0x000000000000000000000000' + supplierWallet.slice(2).toLowerCase()
  const fromBlock = Math.max(0, latestBlock - 10_000_000)

  const logs = await rpc('eth_getLogs', [{
    address: WON_TOKEN,
    fromBlock: '0x' + fromBlock.toString(16),
    toBlock: 'latest',
    topics: [TRANSFER_TOPIC, null, toPadded], // From은 null(상관없음), To는 공급자
  }])

  const transfers = []
  for (const log of (logs || [])) {
    const valueHex = log.data.slice(2)
    const valueWei = BigInt('0x' + valueHex)
    const blockNumber = parseInt(log.blockNumber, 16)
    const fromAddr = '0x' + log.topics[1].slice(26) // 보낸 사람 추출

    let timestamp = Math.floor(Date.now() / 1000)
    try {
      const block = await rpc('eth_getBlockByNumber', [log.blockNumber, false])
      if (block && block.timestamp) {
        timestamp = parseInt(block.timestamp, 16)
      }
    } catch { /* ignore */ }

    transfers.push({
      txHash: log.transactionHash,
      blockNumber,
      timestamp,
      from: fromAddr.toLowerCase(),
      to: supplierWallet.toLowerCase(),
      wonAmount: Number(valueWei / BigInt(10 ** 14)) / 10000,
    })
  }

  return transfers.sort((a, b) => a.timestamp - b.timestamp)
}

// GET /api/energy/settlements?supplier=0x...&consumer=0x...
router.get('/settlements', async (req, res) => {
  try {
    const supplier = req.query.supplier
    const consumer = req.query.consumer
    if (!supplier || !/^0x[a-fA-F0-9]{40}$/.test(supplier)) {
      return res.status(400).json({ error: 'Valid supplier address required (?supplier=0x...)' })
    }

    const latestHex = await rpc('eth_blockNumber')
    const latestBlock = parseInt(latestHex, 16)

    let transfers = await fetchTransfersToSupplier(supplier, latestBlock)

    if (consumer && /^0x[a-fA-F0-9]{40}$/.test(consumer)) {
      const consumerLower = consumer.toLowerCase()
      transfers = transfers.filter(t => t.from === consumerLower)
    }

    res.json({ wonToken: WON_TOKEN, transfers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
