const express = require('express');
const app = express();

const PORT = process.env.BACKEND_PORT || 8000;

// [필수] 프론트엔드(Vercel)에서 오는 요청을 허락해주는 CORS 설정
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ----------------------------------------------------
// 1. 네트워크 상태 API (useNetworkStatus)
// ----------------------------------------------------
app.get('/api/energy/network', (req, res) => {
  res.json({
    network: 'Arbitrum Sepolia',
    chainId: 421614,
    latestBlock: 271084099,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    contract: '0xb551...6a7b',
    status: 'connected'
  });
});

// ----------------------------------------------------
// 2. 주간 정산 내역 API (useSettlements)
// ----------------------------------------------------
app.get('/api/energy/settlements', (req, res) => {
  res.json({
    suppliers: [
      '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8', 
      '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'
    ],
    wonToken: '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB',
    transfers: [
      {
        txHash: '0xabc1234567890abcdef',
        blockNumber: 271084000,
        timestamp: Math.floor(Date.now() / 1000) - 86400, // 어제
        from: '0xUserWalletAddress...',
        to: '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
        wonAmount: 1344.70
      }
    ]
  });
});

// ----------------------------------------------------
// 3. 핵심 에너지 계량 데이터 API (useEnergyData)
// ----------------------------------------------------
app.get('/api/energy', (req, res) => {
  const wallet = req.query.wallet || 'unknown';

  // 캡스톤 시연 시 그래프와 트랜잭션이 풍성하게 보이도록 
  // 최근 27개의 실감나는 가상 계량 데이터를 생성합니다.
  const mockReadings = Array.from({ length: 27 }).map((_, i) => {
    const timeOffset = i * 3600000; // 1시간 간격
    return {
      txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
      blockNumber: 270986697 + i,
      logIndex: i,
      wh: +(0.048 + (Math.random() * 0.01)).toFixed(3),
      kWh: 0.000048,
      timestamp: Math.floor((Date.now() - timeOffset) / 1000),
      date: new Date(Date.now() - timeOffset).toISOString()
    };
  });

  res.json({
    wallet: wallet,
    contract: '0xb551...6a7b',
    network: 'Arbitrum Sepolia',
    chainId: 421614,
    latestBlock: 271084099,
    overview: {
      totalReadings: 27,
      totalWh: 14606.2,
      totalKWh: 14.6062,
      estimatedCostKRW: 1753,
      totalGasUsed: 21000,
      totalGasCostGwei: 0.01,
      firstReading: mockReadings[mockReadings.length - 1], // 가장 오래된 데이터
      lastReading: mockReadings[0] // 최신 데이터
    },
    readings: mockReadings
  });
});

// 서버 기본 접속 테스트용
app.get('/', (req, res) => {
  res.send('✅ MVP Grid Lab API is fully independent and running!');
});

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Independent Backend running on port ${PORT}`);
});
