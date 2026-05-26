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

const METER_ADDRESS = '0xb551a87e38E7A838d9E8C3ef2CDbD40725Ad6a7B';
const METER_ABI = ["event EnergyDataRecorded(address indexed device, uint256 powerValue, uint256 timestamp)"];
const meterContract = new ethers.Contract(METER_ADDRESS, METER_ABI, provider);

const WON_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB';
const WON_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const wonContract = new ethers.Contract(WON_ADDRESS, WON_ABI, provider);

// 🔥 [수정 1] 과거 데이터를 모두 긁어오도록 시작 블록을 5월 초(260,000,000)로 넉넉하게 롤백
const START_BLOCK = 260000000; 
// 🔥 [수정 2] 5월 22일(한국시간 자정)을 기점으로 나누기 1000을 적용하기 위한 기준 시간 (Unix Timestamp)
const MAY_22_TIMESTAMP = Math.floor(new Date('2026-05-22T00:00:00+09:00').getTime() / 1000);

// ----------------------------------------------------
// 1. 핵심 에너지 계량 데이터 API (진짜 온체인 연동)
// ----------------------------------------------------
app.get('/api/energy', async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet || wallet === 'unknown') throw new Error("Wallet address is required");

    const filter = meterContract.filters.EnergyDataRecorded(wallet);
    const logs = await meterContract.queryFilter(filter, START_BLOCK, 'latest');
    
    let totalWh = 0;
    let readings = logs.map(log => {
      let powerValue = Number(log.args[1]);
      const timestamp = Number(log.args[2]);
      
      // 🔥 [수정 3] 22일 이후 기록은 1000으로 나누어 단위 맞추기
      if (timestamp >= MAY_22_TIMESTAMP) {
        powerValue = powerValue / 1000;
      }
      
      totalWh += powerValue;
      
      return {
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        logIndex: log.index,
        wh: Number(powerValue.toFixed(4)), // 소수점 너무 길게 안 나오게 4자리 컷
        kWh: Number((powerValue / 1000).toFixed(6)),
        timestamp: timestamp,
        date: new Date(timestamp * 1000).toISOString()
      };
    });

    // 🔥 [수정 4] 무조건 '최신 시간(timestamp)'이 맨 위로 오도록 강제 정렬 (내림차순)
    readings.sort((a, b) => b.timestamp - a.timestamp);

    // 총합 소수점 에러(14606.204000005...) 방지용 깔끔한 반올림
    totalWh = Number(totalWh.toFixed(4));
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
        estimatedCostKRW: Math.floor((totalWh / 1000) * 150),
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
// 2. 주간 정산 내역 API 
// ----------------------------------------------------
app.get('/api/energy/settlements', async (req, res) => {
  try {
    const suppliers = [
      '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8', 
      '0x6220F267AEDfB782d8aDD9D13AAB3f5B51c0b3c5'  
    ];

    let allTransfers = [];
    for (const supplier of suppliers) {
      const filter = wonContract.filters.Transfer(null, supplier);
      const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
      
      const transfers = logs.map(log => ({
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
    res.status(500).json({ error: "Failed to fetch settlements" });
  }
});

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
