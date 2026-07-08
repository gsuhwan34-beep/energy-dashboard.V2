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

const {
  PRODUCER_METER_ADDRESS,
  PRODUCER_METER_ABI,
  PRODUCER_LEDGER_ADDRESS,
  PRODUCER_LEDGER_ABI,
} = require('./lib/producerLedger');

const producerMeterContract = new ethers.Contract(PRODUCER_METER_ADDRESS, PRODUCER_METER_ABI, provider);
const producerLedgerContract = new ethers.Contract(PRODUCER_LEDGER_ADDRESS, PRODUCER_LEDGER_ABI, provider);

const WON_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB';
const WON_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const wonContract = new ethers.Contract(WON_ADDRESS, WON_ABI, provider);

const START_BLOCK = 260000000; 
const MAY_22_TIMESTAMP = Math.floor(new Date('2026-05-22T00:00:00+09:00').getTime() / 1000);

const DEFAULT_SUPPLIERS = [
  '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
  '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e',
];

const { getPresetRate } = require('./lib/presetSuppliers');
const { bootstrapPresetLedgerRates } = require('./lib/bootstrapLedgerRates');

const blockTimestampCache = new Map();

async function getBlockTimestamp(blockNumber) {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber);
  }
  const block = await provider.getBlock(blockNumber);
  const timestamp = block ? block.timestamp : Math.floor(Date.now() / 1000);
  blockTimestampCache.set(blockNumber, timestamp);
  return timestamp;
}

function isValidAddress(address) {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

function normalizePowerValue(powerValue, timestamp) {
  let value = Number(powerValue);
  if (timestamp >= MAY_22_TIMESTAMP) {
    value = value / 1000;
  }
  return value;
}

let consumerMeterDevicesCache = null;

async function getKnownConsumerMeterDevices() {
  if (consumerMeterDevicesCache) return consumerMeterDevicesCache;
  const filter = meterContract.filters.EnergyDataRecorded();
  const logs = await meterContract.queryFilter(filter, START_BLOCK, 'latest');
  const set = new Set();
  for (const log of logs) {
    try {
      set.add(ethers.getAddress(log.args[0]).toLowerCase());
    } catch {
      // skip malformed logs
    }
  }
  consumerMeterDevicesCache = Array.from(set);
  return consumerMeterDevicesCache;
}

async function buildMeterReadingsMap(devices) {
  const map = {};
  await Promise.all(
    devices.map(async (device) => {
      map[device.toLowerCase()] = await fetchConsumerReadings(device);
    }),
  );
  return map;
}

async function fetchConsumerReadings(consumerWallet) {
  const filter = meterContract.filters.EnergyDataRecorded(consumerWallet);
  const logs = await meterContract.queryFilter(filter, START_BLOCK, 'latest');

  const readings = logs.map((log) => {
    const timestamp = Number(log.args[2]);
    const powerValue = normalizePowerValue(log.args[1], timestamp);
    return {
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      logIndex: log.index,
      wh: Number(powerValue.toFixed(4)),
      kWh: Number((powerValue / 1000).toFixed(6)),
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
    };
  });

  readings.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
    return a.logIndex - b.logIndex;
  });

  return readings;
}

async function fetchProducerProductions(producer) {
  const filter = producerMeterContract.filters.EnergyProduced(producer);
  const logs = await producerMeterContract.queryFilter(filter, START_BLOCK, 'latest');

  const productions = logs.map((log) => {
    const timestamp = Number(log.args[2]);
    const deltaWh = normalizePowerValue(log.args[1], timestamp);
    return {
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      logIndex: log.index,
      wh: Number(deltaWh.toFixed(4)),
      kWh: Number((deltaWh / 1000).toFixed(6)),
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
    };
  });

  productions.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
    return a.logIndex - b.logIndex;
  });

  const meterTotalWh = Number(productions.reduce((sum, p) => sum + p.wh, 0).toFixed(4));
  return { productions, meterTotalWh };
}

/** P2P 원장 EnergySold 전체 (계량기↔soldWh 매칭용) */
async function fetchAllLedgerPurchases() {
  try {
    const filter = producerLedgerContract.filters.EnergySold();
    const logs = await producerLedgerContract.queryFilter(filter, START_BLOCK, 'latest');

    const transfers = [];
    for (const log of logs) {
      const producer = ethers.getAddress(log.args.producer ?? log.args[0]);
      const buyer = ethers.getAddress(log.args.buyer ?? log.args[1]);
      const soldWh = Number(log.args.soldWh ?? log.args[2]);
      const wonPaid = Number(ethers.formatUnits(log.args.wonPaid ?? log.args[4], 18));
      let timestamp = Number(log.args.timestamp ?? log.args[5]);
      if (!timestamp) timestamp = await getBlockTimestamp(log.blockNumber);

      transfers.push({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp,
        from: buyer,
        to: producer,
        wonAmount: wonPaid,
        soldWh,
        source: 'ledger',
      });
    }

    transfers.sort((a, b) => a.timestamp - b.timestamp);
    return transfers;
  } catch (err) {
    console.warn('Ledger all purchases skipped:', err.message);
    return [];
  }
}

/** P2P 원장 purchaseEnergy → EnergySold (구매자 기준 — 생산자 탭과 무관하게 조회) */
async function fetchLedgerPurchasesByBuyer(buyerFilter) {
  try {
    const buyer = ethers.getAddress(buyerFilter);
    const filter = producerLedgerContract.filters.EnergySold(null, buyer);
    const logs = await producerLedgerContract.queryFilter(filter, START_BLOCK, 'latest');

    const transfers = [];
    for (const log of logs) {
      const producer = ethers.getAddress(log.args.producer ?? log.args[0]);
      const soldWh = Number(log.args.soldWh ?? log.args[2]);
      const wonPaid = Number(ethers.formatUnits(log.args.wonPaid ?? log.args[4], 18));
      let timestamp = Number(log.args.timestamp ?? log.args[5]);
      if (!timestamp) timestamp = await getBlockTimestamp(log.blockNumber);

      transfers.push({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp,
        from: buyer,
        to: producer,
        wonAmount: wonPaid,
        soldWh,
        source: 'ledger',
      });
    }

    transfers.sort((a, b) => a.timestamp - b.timestamp);
    return transfers;
  } catch (err) {
    console.warn('Ledger buyer purchases skipped:', err.message);
    return [];
  }
}

/** @deprecated producer 필터 — fetchLedgerPurchasesByBuyer 사용 권장 */
async function fetchLedgerPurchaseTransfers(producer, buyerFilter) {
  try {
    const producerAddr = ethers.getAddress(producer);
    const filter = producerLedgerContract.filters.EnergySold(producerAddr);
    const logs = await producerLedgerContract.queryFilter(filter, START_BLOCK, 'latest');

    const transfers = [];
    for (const log of logs) {
      const buyer = ethers.getAddress(log.args.buyer ?? log.args[1]);
      if (buyerFilter && buyer.toLowerCase() !== buyerFilter.toLowerCase()) continue;

      const soldWh = Number(log.args.soldWh ?? log.args[2]);
      const wonPaid = Number(ethers.formatUnits(log.args.wonPaid ?? log.args[4], 18));
      let timestamp = Number(log.args.timestamp ?? log.args[5]);
      if (!timestamp) timestamp = await getBlockTimestamp(log.blockNumber);

      transfers.push({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp,
        from: buyer,
        to: producerAddr,
        wonAmount: wonPaid,
        soldWh,
      });
    }

    transfers.sort((a, b) => a.timestamp - b.timestamp);
    return transfers;
  } catch (err) {
    console.warn('Ledger purchase transfers skipped:', err.message);
    return [];
  }
}

async function getOnChainProducerRate(producer) {
  try {
    const rate = await producerLedgerContract.ratePerKwh(ethers.getAddress(producer));
    const n = Number(rate);
    return n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function fetchLedgerSales(producer) {
  try {
    const soldFilter = producerLedgerContract.filters.EnergySold(producer);
    const soldLogs = await producerLedgerContract.queryFilter(soldFilter, START_BLOCK, 'latest');

    const devices = await getKnownConsumerMeterDevices();
    const readingsMap = await buildMeterReadingsMap(devices);

    const sales = [];
    for (const log of soldLogs) {
      const soldWh = Number(log.args.soldWh ?? log.args[2]);
      const wonPaid = Number(ethers.formatUnits(log.args.wonPaid ?? log.args[4] ?? log.args[5], 18));
      const timestamp = Number(log.args.timestamp ?? log.args[5] ?? log.args[6]);
      const buyer = ethers.getAddress(log.args.buyer ?? log.args[1]);
      const ratePerKwh = soldWh > 0 ? Number(((wonPaid / soldWh) * 1000).toFixed(2)) : 0;

      const { meterWallet, week } = resolveMeterWalletForSoldWh(
        readingsMap,
        soldWh,
        timestamp,
        buyer,
      );

      sales.push({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp,
        from: buyer,
        buyerWallet: buyer,
        meterWallet: meterWallet || null,
        to: producer,
        wonAmount: wonPaid,
        kWh: Number((soldWh / 1000).toFixed(6)),
        wh: soldWh,
        weekIndex: week?.weekIndex ?? -1,
        weekLabel: week?.weekLabel ?? '온체인 P2P 구매',
        ratePerKwh,
        meterReadingCount: week?.readings?.length ?? 0,
        verified: true,
      });
    }

    sales.sort((a, b) => a.timestamp - b.timestamp);
    return sales;
  } catch (err) {
    console.warn('Ledger EnergySold query skipped:', err.message);
    return [];
  }
}

/** 생산자 지갑으로 직접 들어온 WON 송금 → 판매 기록 (P2P transferWon) */
async function fetchWonInboundSales(producer, ratePerKwh) {
  const filter = wonContract.filters.Transfer(null, producer);
  const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
  const rate = ratePerKwh > 0 ? ratePerKwh : 150;

  const sales = logs.map((log) => {
    const wonPaid = Number(ethers.formatUnits(log.args[2], 18));
    const buyer = ethers.getAddress(log.args[0]);
    const wh = Math.round((wonPaid / rate) * 1000);
    return {
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: 0,
      from: buyer,
      to: producer,
      wonAmount: wonPaid,
      kWh: Number((wh / 1000).toFixed(6)),
      wh: Math.max(0, wh),
      weekIndex: -1,
      weekLabel: 'WON P2P 정산',
      ratePerKwh: rate,
      meterReadingCount: 0,
      verified: true,
    };
  });

  for (const sale of sales) {
    sale.timestamp = await getBlockTimestamp(sale.blockNumber);
  }

  sales.sort((a, b) => a.timestamp - b.timestamp);
  return sales;
}

async function buildProducerPayload(producer) {
  const { productions, meterTotalWh } = await fetchProducerProductions(producer);

  let ledgerSoldWh = 0;
  let onChainRate = 0;
  try {
    const ledgerStats = await producerLedgerContract.getStats(producer);
    ledgerSoldWh = Number(ledgerStats.totalSoldWh);
    onChainRate = Number(ledgerStats.rate);
  } catch (err) {
    console.warn('Ledger getStats skipped:', err.message);
  }

  const ratePerKwh = onChainRate > 0
    ? onChainRate
    : supplierPrices[producer.toLowerCase()] !== undefined
      ? supplierPrices[producer.toLowerCase()]
      : 150;

  const ledgerSales = await fetchLedgerSales(producer);
  const wonSales = await fetchWonInboundSales(producer, ratePerKwh);
  const salesByTx = new Map();
  // WON Transfer와 EnergySold가 같은 tx — 원장(계량기 매칭 포함) 우선
  for (const s of wonSales) salesByTx.set(s.txHash.toLowerCase(), s);
  for (const s of ledgerSales) salesByTx.set(s.txHash.toLowerCase(), s);
  const mergedSales = Array.from(salesByTx.values()).sort((a, b) => a.timestamp - b.timestamp);
  const sales = await enrichProducerSalesWithMeterWallets(mergedSales);

  const soldWh = ledgerSoldWh > 0 ? ledgerSoldWh : wonSales.reduce((sum, s) => sum + s.wh, 0);
  const availableWh = Math.max(0, Number((meterTotalWh - soldWh).toFixed(4)));
  const totalWonReceived = Number(sales.reduce((sum, s) => sum + s.wonAmount, 0).toFixed(6));

  const currentBlock = await provider.getBlockNumber();

  return {
    wallet: producer,
    meterContract: PRODUCER_METER_ADDRESS,
    ledgerContract: PRODUCER_LEDGER_ADDRESS,
    contract: PRODUCER_METER_ADDRESS,
    wonToken: WON_ADDRESS,
    network: 'Arbitrum Sepolia',
    chainId: 421614,
    latestBlock: currentBlock,
    ratePerKwh,
    onChainRate,
    overview: {
      totalReadings: productions.length,
      totalWh: meterTotalWh,
      totalProductionKWh: meterTotalWh / 1000,
      totalWonReceived,
      soldKWh: soldWh / 1000,
      soldWh,
      availableKWh: availableWh / 1000,
      availableWh,
      verifiedSaleCount: sales.length,
      rawInboundCount: sales.length,
      firstProduction: productions.length > 0 ? productions[0] : null,
      lastProduction: productions.length > 0 ? productions[productions.length - 1] : null,
    },
    productions,
    sales,
  };
}

const fs = require('fs');
const path = require('path');
const {
  findMeterVerifiedTransfers,
  findLedgerPurchasesForMeter,
  resolveMeterWalletForSoldWh,
} = require('./lib/settlementMatch');

async function enrichLedgerTransfersWithWallets(transfers) {
  const devices = await getKnownConsumerMeterDevices();
  const readingsMap = await buildMeterReadingsMap(devices);
  const buyerToMeter = {};

  const enriched = transfers.map((t) => {
    const buyer = t.from;
    const soldWh = Number(t.soldWh ?? 0);
    const { meterWallet } = resolveMeterWalletForSoldWh(
      readingsMap,
      soldWh,
      t.timestamp,
      buyer,
    );
    if (meterWallet) buyerToMeter[buyer.toLowerCase()] = meterWallet;
    return {
      ...t,
      buyerWallet: buyer,
      meterWallet: meterWallet || null,
    };
  });

  return enriched.map((t) => {
    if (t.meterWallet) return t;
    const cached = buyerToMeter[t.buyerWallet.toLowerCase()];
    if (!cached) return t;
    return { ...t, meterWallet: cached };
  });
}

/** 판매 내역 — soldWh 주차 매칭 + 동일 결제 지갑의 기존 계량기 연결 */
async function enrichProducerSalesWithMeterWallets(sales) {
  const devices = await getKnownConsumerMeterDevices();
  const readingsMap = await buildMeterReadingsMap(devices);
  const buyerToMeter = {};

  const enriched = sales.map((sale) => {
    const buyer = sale.buyerWallet ?? sale.from;
    const soldWh = Number(sale.wh ?? 0);
    const { meterWallet, week } = resolveMeterWalletForSoldWh(
      readingsMap,
      soldWh,
      sale.timestamp,
      buyer,
    );
    if (meterWallet) buyerToMeter[buyer.toLowerCase()] = meterWallet;

    return {
      ...sale,
      buyerWallet: buyer,
      meterWallet: meterWallet ?? sale.meterWallet ?? null,
      weekIndex: week?.weekIndex ?? sale.weekIndex,
      weekLabel: week?.weekLabel ?? sale.weekLabel,
      meterReadingCount: week?.readings?.length ?? sale.meterReadingCount,
    };
  });

  return enriched.map((sale) => {
    if (sale.meterWallet) return sale;
    const buyer = (sale.buyerWallet ?? sale.from).toLowerCase();
    const cached = buyerToMeter[buyer];
    if (!cached) return sale;
    return { ...sale, meterWallet: cached };
  });
}

const SUPPLIER_PRICES_FILE = path.join(__dirname, 'supplier-prices.json');
let supplierPrices = {};

function loadSupplierPrices() {
  try {
    if (fs.existsSync(SUPPLIER_PRICES_FILE)) {
      supplierPrices = JSON.parse(fs.readFileSync(SUPPLIER_PRICES_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Failed to load supplier prices:', err.message);
    supplierPrices = {};
  }
}

function saveSupplierPrices() {
  try {
    fs.writeFileSync(SUPPLIER_PRICES_FILE, JSON.stringify(supplierPrices, null, 2));
  } catch (err) {
    console.warn('Failed to save supplier prices:', err.message);
  }
}

loadSupplierPrices();

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
      const timestamp = Number(log.args[2]);
      const powerValue = normalizePowerValue(log.args[1], timestamp);
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
// ?consumer=0x... — 구매자(송신) 지갑 기준 조회 (공급자 탭 무관, 권장)
// ?supplier=0x... — 공급자(수신) 지갑 필터 (선택)
// ----------------------------------------------------
app.get('/api/energy/settlements', async (req, res) => {
  try {
    const supplierParam = req.query.supplier;
    const consumerParam = req.query.consumer;
    const ledgerOnly = req.query.ledgerOnly === '1';

    // 주간 정산 UI — P2P 원장 EnergySold만 (배포 전 WON 송금 제외)
    if (ledgerOnly && isValidAddress(consumerParam)) {
      const consumer = ethers.getAddress(consumerParam);
      const seenTx = new Set();
      const transfers = [];

      function addTransfer(t) {
        if (seenTx.has(t.txHash)) return;
        seenTx.add(t.txHash);
        transfers.push(t);
      }

      const buyerPurchases = await fetchLedgerPurchasesByBuyer(consumer);
      buyerPurchases.forEach(addTransfer);

      const readings = await fetchConsumerReadings(consumer);
      if (readings.length > 0) {
        const allLedger = await fetchAllLedgerPurchases();
        const meterMatched = findLedgerPurchasesForMeter(readings, allLedger);
        meterMatched.forEach(addTransfer);
      }

      transfers.sort((a, b) => a.timestamp - b.timestamp);
      const enriched = await enrichLedgerTransfersWithWallets(transfers);
      return res.json({
        wonToken: WON_ADDRESS,
        transfers: enriched,
      });
    }

    let allTransfers = [];
    const seenTx = new Set();

    async function pushTransfer(log) {
      if (log.args[0] === ethers.ZeroAddress) return;
      const txHash = log.transactionHash;
      if (seenTx.has(txHash)) return;
      seenTx.add(txHash);

      allTransfers.push({
        txHash,
        blockNumber: log.blockNumber,
        timestamp: await getBlockTimestamp(log.blockNumber),
        from: ethers.getAddress(log.args[0]),
        to: ethers.getAddress(log.args[1]),
        wonAmount: Number(ethers.formatUnits(log.args[2], 18)),
      });
    }

    // consumer만 있으면: 해당 지갑이 보낸 WON + 계량 kWh와 교차 검증된 송금
    if (isValidAddress(consumerParam)) {
      const consumer = ethers.getAddress(consumerParam);
      const fromFilter = wonContract.filters.Transfer(consumer, null);
      const fromLogs = await wonContract.queryFilter(fromFilter, START_BLOCK, 'latest');

      for (const log of fromLogs) {
        if (isValidAddress(supplierParam) &&
            ethers.getAddress(log.args[1]).toLowerCase() !== supplierParam.toLowerCase()) {
          continue;
        }
        await pushTransfer(log);
      }

      // 계량기 주소 기준 kWh 매칭 — MetaMask 송금 지갑이 달라도 정산 인식
      const readings = await fetchConsumerReadings(consumer);
      if (readings.length > 0) {
        const supplierSet = new Set(DEFAULT_SUPPLIERS.map((s) => s.toLowerCase()));
        Object.keys(supplierPrices).forEach((w) => {
          if (isValidAddress(w)) supplierSet.add(w.toLowerCase());
        });
        if (isValidAddress(supplierParam)) {
          supplierSet.add(ethers.getAddress(supplierParam).toLowerCase());
        }

        const candidate = [];
        const candidateSeen = new Set();
        for (const supplier of supplierSet) {
          const toFilter = wonContract.filters.Transfer(null, supplier);
          const toLogs = await wonContract.queryFilter(toFilter, START_BLOCK, 'latest');
          for (const log of toLogs) {
            const txHash = log.transactionHash;
            if (candidateSeen.has(txHash)) continue;
            candidateSeen.add(txHash);
            candidate.push({
              txHash,
              blockNumber: log.blockNumber,
              timestamp: await getBlockTimestamp(log.blockNumber),
              from: ethers.getAddress(log.args[0]),
              to: ethers.getAddress(log.args[1]),
              wonAmount: Number(ethers.formatUnits(log.args[2], 18)),
            });
          }
        }

        const extraRates = Object.values(supplierPrices)
          .map((p) => Number(p))
          .filter((n) => Number.isFinite(n) && n > 0);

        if (isValidAddress(supplierParam)) {
          const onChainRate = await getOnChainProducerRate(supplierParam);
          if (onChainRate > 0) extraRates.push(onChainRate);
        }

        const verified = findMeterVerifiedTransfers(readings, candidate, extraRates);
        for (const t of verified) {
          if (seenTx.has(t.txHash)) continue;
          seenTx.add(t.txHash);
          allTransfers.push(t);
        }
      }

      // P2P 원장 EnergySold — 구매자 기준 (MetaMask 지갑 ≠ 계량기 지갑도 포함)
      const ledgerPurchases = await fetchLedgerPurchasesByBuyer(consumer);
      for (const t of ledgerPurchases) {
        if (isValidAddress(supplierParam) && t.to.toLowerCase() !== supplierParam.toLowerCase()) {
          continue;
        }
        if (seenTx.has(t.txHash)) continue;
        seenTx.add(t.txHash);
        allTransfers.push(t);
      }
    } else {
      const suppliers = isValidAddress(supplierParam)
        ? [ethers.getAddress(supplierParam)]
        : DEFAULT_SUPPLIERS;

      for (const supplier of suppliers) {
        const filter = wonContract.filters.Transfer(null, supplier);
        const logs = await wonContract.queryFilter(filter, START_BLOCK, 'latest');
        for (const log of logs) {
          await pushTransfer(log);
        }
      }
    }

    allTransfers.sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      wonToken: WON_ADDRESS,
      transfers: allTransfers,
    });
  } catch (error) {
    console.error("Settlement fetch error:", error);
    res.status(500).json({ error: "Failed to fetch settlements" });
  }
});

// ----------------------------------------------------
// P2P 공급자 단가(호가) 관리 API
// ----------------------------------------------------
app.post('/api/supplier/price', (req, res) => {
  const { wallet, price } = req.body;
  if (!isValidAddress(wallet) || price === undefined || Number.isNaN(Number(price))) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const key = wallet.toLowerCase();
  supplierPrices[key] = Number(price);
  saveSupplierPrices();
  res.json({ success: true, wallet: key, price: supplierPrices[key] });
});

app.get('/api/supplier/price/:wallet', async (req, res) => {
  const wallet = req.params.wallet.toLowerCase();
  if (!isValidAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  let price = supplierPrices[wallet];
  const presetRate = getPresetRate(wallet);
  if (price === undefined && presetRate !== undefined) price = presetRate;
  const onChainRate = await getOnChainProducerRate(wallet);
  if (onChainRate > 0) price = onChainRate;
  if (price === undefined) price = presetRate ?? 150;
  res.json({ wallet, price, onChainRate });
});

// ----------------------------------------------------
// 4. 생산자(공급자) 대시보드 API
// ?wallet=0x... — 생산자 지갑
// ----------------------------------------------------
app.get('/api/producer', async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!isValidAddress(wallet)) {
      return res.status(400).json({ error: 'Valid producer wallet required (?wallet=0x...)' });
    }
    const producer = ethers.getAddress(wallet);
    res.json(await buildProducerPayload(producer));
  } catch (error) {
    console.error('Producer fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch producer data' });
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
      producerMeterContract: PRODUCER_METER_ADDRESS,
      producerLedgerContract: PRODUCER_LEDGER_ADDRESS,
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ error: 'Network disconnected' });
  }
});

app.get('/', (req, res) => res.send('✅ Real Web3 Backend is running!'));

async function tryBootstrapLedgerRatesOnStartup() {
  const key = process.env.LEDGER_OWNER_PRIVATE_KEY;
  if (!key) {
    console.log('ℹ LEDGER_OWNER_PRIVATE_KEY 없음 — 프리셋 단가 자동 등록 스킵 (MetaMask owner 연결 시 프론트에서 등록 가능)');
    return;
  }
  try {
    const wallet = new ethers.Wallet(key, provider);
    console.log('🔧 프리셋 공급자 원장 단가 등록 시도…', wallet.address);
    const result = await bootstrapPresetLedgerRates(wallet);
    console.log('🔧 원장 단가 bootstrap:', result);
  } catch (err) {
    console.warn('⚠ 원장 단가 bootstrap 실패:', err.message);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Independent Web3 Backend running on port ${PORT}`);
  tryBootstrapLedgerRatesOnStartup();
});
