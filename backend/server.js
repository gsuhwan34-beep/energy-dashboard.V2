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

// [블록체인 세팅]
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const provider = new ethers.JsonRpcProvider(RPC_URL);

const METER_ADDRESS = '0xb551a87e38E7A838d9E8C3ef2CDbD40725Ad6a7B';
const METER_ABI = ["event EnergyDataRecorded(address indexed device, uint256 powerValue, uint256 timestamp)"];
const meterContract = new ethers.Contract(METER_ADDRESS, METER_ABI, provider);

const WON_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB';
const WON_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const wonContract = new ethers.Contract(WON_ADDRESS, WON_ABI, provider);

const START_BLOCK = 260000000; 
const MAY_22_TIMESTAMP = Math.floor(new Date('2026-05-22T00:00:00+09:00').getTime() / 1000);

// ----------------------------------------------------
// 1. 핵심 에너지 계량 데이터 API (논스 정렬 및 소수점 보존 포함)
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
      
      if (timestamp >= MAY_22_TIMESTAMP) {
        powerValue = powerValue / 1000;
      }
      
      totalWh += powerValue;
      
      return {
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        logIndex: log.index,
        wh: Number(powerValue.toFixed(4)), 
        kWh: Number((powerValue / 1000).toFixed(6)),
        timestamp: timestamp,
        date: new Date(timestamp * 1000).toISOString()
      };
    });

    // 논스(순서) 기반 완벽 정렬
    readings.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }
      return a.logIndex - b.logIndex;
    });

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
        estimatedCostKRW: Number(((totalWh / 1000) * 150).toFixed(3)),
        totalGasUsed: 0,
        totalGasCostGwei: 0,
        firstReading: readings.length > 0 ? readings[0] : null,
        lastReading: readings.length > 0 ? readings[readings.length - 1] : null
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
      '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e'
    ];

    let allTransfers = [];
    for (const supplier of suppliers) {
      const filter = wonContract.filters.Transfer(null, supplier);
      const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
      
      const transfers = logs
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

// ----------------------------------------------------
// 🔥 [신규 추가] P2P 공급자 단가(호가) 관리 API 
// ----------------------------------------------------
const supplierPrices = {}; // 메모리 기반 호가 DB

app.post('/api/supplier/price', (req, res) => {
  const { wallet, price } = req.body;
  if (!wallet || price === undefined) return res.status(400).json({ error: 'Invalid data' });
  supplierPrices[wallet.toLowerCase()] = Number(price);
  res.json({ success: true, wallet, price: supplierPrices[wallet.toLowerCase()] });
});

app.get('/api/supplier/price/:wallet', (req, res) => {
  const wallet = req.params.wallet.toLowerCase();
  const price = supplierPrices[wallet] !== undefined ? supplierPrices[wallet] : 150; 
  res.json({ wallet, price });
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
