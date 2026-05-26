// ----------------------------------------------------
// 2. 주간 정산 내역 API 
// ----------------------------------------------------
app.get('/api/energy/settlements', async (req, res) => {
  try {
    // 🔥 프론트와 동일하게 진짜 공급자 지갑 2개로 업데이트
    const suppliers = [
      '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8', // 신재생
      '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e'  // 일반 혼합
    ];

    let allTransfers = [];
    for (const supplier of suppliers) {
      const filter = wonContract.filters.Transfer(null, supplier);
      const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
      
      const transfers = logs
        // 🔥 [핵심 보완] 토큰을 처음 발행(Mint)할 때 생기는 0x000... 주소의 전송 기록은 가짜 정산이므로 걸러냅니다!
        .filter(log => log.args[0] !== ethers.ZeroAddress) 
        .map(log => ({
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000), 
          from: log.args[0],
          to: log.args[1],
          wonAmount: Number(ethers.formatUnits(log.args[2], 18))
        }));
      allTransfers = allTransfers.concat(transfers);
    }

    allTransfers.sort((a, b) => b.blockNumber - a.blockNumber);

    res.json({
      suppliers: suppliers,
      wonToken: WON_ADDRESS,
      transfers: allTransfers
    });
  } catch (error) {
    console.error("Settlement fetch error:", error);
    res.status(500).json({ error: "Failed to fetch settlements" });
  }
});
