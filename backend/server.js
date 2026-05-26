const express = require('express');
const { ethers } = require('ethers');
const app = express();

const PORT = process.env.BACKEND_PORT || 8000;

// [CORS 설정]
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// [블록체인 세팅 (Arbitrum Sepolia)]
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 1. 에너지 미터 컨트랙트
const METER_ADDRESS = '0xb551a87e38E7A838d9E8C3ef2CDbD40725Ad6a7B';
const METER_ABI = ["event EnergyDataRecorded(address indexed device, uint256 powerValue, uint256 timestamp)"];
const meterContract = new ethers.Contract(METER_ADDRESS, METER_ABI, provider);

// 2. WON 토큰 컨트랙트
const WON_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB';
const WON_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const wonContract = new ethers.Contract(WON_ADDRESS, WON_ABI, provider);

// 캡스톤 배포 시점 블록 (너무 옛날 블록부터 긁으면 RPC 에러가 나므로 기준점 설정)
const START_BLOCK = 270000000; 

// ----------------------------------------------------
// 1. 핵심 에너지 계량 데이터 API (진짜 온체인 연동)
// ----------------------------------------------------
app.get('/api/energy', async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet || wallet === 'unknown') throw new Error("Wallet address is required");

    // 1. 해당 지갑(device)에서 발생한 이벤트 필터링
    const filter = meterContract.filters.EnergyDataRecorded(wallet);
    
    // 2. 블록체인에서 실제 이벤트 로그 긁어오기
    const logs = await meterContract.queryFilter(filter, START_BLOCK, 'latest');
    
    // 3. 최신 데이터가 위로 오도록 뒤집기 및 데이터 정제
    let totalWh = 0;
    const readings = logs.map((log, index) => {
      const powerValue = Number(log.args[1]);
      const timestamp = Number(log.args[2]);
      
      totalWh += powerValue;
      
      return {
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        logIndex: log.index,
        wh: powerValue,
        kWh: powerValue / 1000,
        timestamp: timestamp,
        date: new Date(timestamp * 1000).toISOString()
      };
    }).reverse();

    const currentBlock = await provider.getBlockNumber();

    res.json({
      wallet: wallet,
      contract: METER_ADDRESS,
      network: 'Arbitrum Sepolia',
      chainId: 421614,
      latestBlock: currentBlock,
      overview: {
        totalReadings: readings.length,
        totalWh: totalWh,
        totalKWh: totalWh / 1000,
        estimatedCostKRW: Math.floor((totalWh / 1000) * 150), // 150원/kWh 기준
        totalGasUsed: 0,
        totalGasCostGwei: 0,
        firstReading: readings.length > 0 ? readings[readings.length - 1] : null,
        lastReading: readings.length > 0 ? readings[0] : null
      },
      readings: readings
    });
  } catch (error) {
    console.error("Energy fetch error:", error);
    res.status(500).json({ error: "Failed to fetch on-chain data" });
  }
});

// ----------------------------------------------------
// 2. 주간 정산 내역 API (진짜 온체인 연동)
// ----------------------------------------------------
app.get('/api/energy/settlements', async (req, res) => {
  try {
    // 공급자 지갑 주소 2개
    const suppliers = [
      '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8', // 신재생
      '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'  // 일반혼합
    ];

    // 공급자에게 들어온(to) WON 토큰 전송 내역 긁어오기
    let allTransfers = [];
    for (const supplier of suppliers) {
      const filter = wonContract.filters.Transfer(null, supplier);
      const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
      
      const transfers = logs.map(log => ({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: Math.floor(Date.now() / 1000), // 이벤트 내 타임스탬프가 없으므로 현재 시간 대체 또는 블록 조회 필요 (단순화)
        from: log.args[0],
        to: log.args[1],
        wonAmount: Number(ethers.formatUnits(log.args[2], 18))
      }));
      allTransfers = allTransfers.concat(transfers);
    }

    // 최신순 정렬
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

// ----------------------------------------------------
// 3. 네트워크 상태 API
// ----------------------------------------------------
app.get('/api/energy/network', async (req, res) => {
  try {
    const blockNum = await provider.getBlockNumber();
    res.json({
      network: 'Arbitrum Sepolia',
      chainId: 421614,
      latestBlock: blockNum,
      rpcUrl: RPC_URL,
      contract: METER_ADDRESS,
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ error: 'Network disconnected' });
  }
});

app.get('/', (req, res) => res.send('✅ Real Web3 Backend is running!'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Independent Web3 Backend running on port ${PORT}`);
});
