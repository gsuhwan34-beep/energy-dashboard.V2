/**
 * P2P 에너지 정산 검증 — 소비자 계량(온체인) + WON 송금(온체인) 교차 매칭
 *
 * "웹사이트를 통한 정산"으로 인정하는 조건:
 * 1. 송금자(from)가 소비자 계량기 컨트랙트에 EnergyDataRecorded 기록 보유
 * 2. 송금 수신자(to)가 해당 생산자 지갑
 * 3. 송금 시각이 해당 주차 시작 이후
 * 4. 송금액 ≈ 해당 주차 kWh × 단가 (150/100/P2P 단가 또는 역산 단가)
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const EPOCH_START_MS = new Date('2026-05-04T00:00:00+09:00').getTime();
const PRESET_RATES = [150, 100];

function getWeekIndex(timestamp) {
  return Math.floor((timestamp * 1000 - EPOCH_START_MS) / WEEK_MS);
}

function getWeekStart(weekIndex) {
  return new Date(EPOCH_START_MS + weekIndex * WEEK_MS);
}

function getWeekEnd(weekIndex) {
  return new Date(EPOCH_START_MS + (weekIndex + 1) * WEEK_MS - 1);
}

function getCurrentWeekIndex() {
  return Math.floor((Date.now() - EPOCH_START_MS) / WEEK_MS);
}

function formatWeekLabel(start, end) {
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} ~ ${fmt(end)}`;
}

function amountsMatch(expected, actual) {
  if (expected <= 0) return actual <= 0.01;
  const diff = Math.abs(expected - actual);
  return diff <= Math.max(0.01, expected * 0.05);
}

function whAmountsMatch(expectedWh, actualWh) {
  if (expectedWh <= 0) return actualWh <= 1;
  return Math.abs(expectedWh - actualWh) <= Math.max(1, expectedWh * 0.08);
}

function paymentMatchesWeekEnergy(weekKWh, wonAmount, extraRates) {
  if (weekKWh <= 0) return wonAmount <= 0.01;

  const rates = [...new Set([...PRESET_RATES, ...extraRates.filter((r) => r > 0)])];
  for (const rate of rates) {
    if (amountsMatch(weekKWh * rate, wonAmount)) return { matched: true, rate };
  }

  const impliedRate = wonAmount / weekKWh;
  if (impliedRate >= 10 && impliedRate <= 500) {
    if (amountsMatch(weekKWh * impliedRate, wonAmount)) {
      return { matched: true, rate: Number(impliedRate.toFixed(2)) };
    }
  }
  return { matched: false, rate: 0 };
}

function groupReadingsByWeek(readings) {
  const map = {};
  for (const r of readings) {
    const idx = getWeekIndex(r.timestamp);
    if (!map[idx]) {
      map[idx] = { weekIndex: idx, totalWh: 0, readings: [] };
    }
    map[idx].totalWh += r.wh;
    map[idx].readings.push(r);
  }

  return Object.values(map).map((w) => {
    const start = getWeekStart(w.weekIndex);
    const end = getWeekEnd(w.weekIndex);
    return {
      weekIndex: w.weekIndex,
      weekLabel: formatWeekLabel(start, end),
      start,
      end,
      totalWh: Number(w.totalWh.toFixed(4)),
      totalKWh: Number((w.totalWh / 1000).toFixed(6)),
      readings: w.readings,
      isEmpty: w.readings.length === 0,
      isCurrent: w.weekIndex === getCurrentWeekIndex(),
    };
  });
}

/**
 * 생산자 지갑으로 들어온 WON 중, 소비자 계량과 교차 검증된 정산만 반환
 */
function matchVerifiedProducerSales(producerWallet, inboundTransfers, consumerReadingsMap, producerRate) {
  const producerLower = producerWallet.toLowerCase();
  const extraRates = [producerRate];
  const verifiedSales = [];
  const usedTx = new Set();

  const byConsumer = {};
  for (const t of inboundTransfers) {
    if (t.to.toLowerCase() !== producerLower) continue;
    const key = t.from.toLowerCase();
    if (!byConsumer[key]) byConsumer[key] = [];
    byConsumer[key].push(t);
  }

  for (const [consumerLower, transfers] of Object.entries(byConsumer)) {
    const readings = consumerReadingsMap[consumerLower];
    if (!readings || readings.length === 0) continue;

    const weeks = groupReadingsByWeek(readings)
      .filter((w) => !w.isCurrent && w.totalKWh > 0)
      .sort((a, b) => a.weekIndex - b.weekIndex);

    for (const week of weeks) {
      const weekStartTs = Math.floor(week.start.getTime() / 1000);
      const weekEndTs = Math.floor(week.end.getTime() / 1000);

      let bestMatch = null;
      let bestRate = 0;
      let bestScore = Infinity;

      for (const t of transfers) {
        if (usedTx.has(t.txHash)) continue;
        if (t.timestamp < weekStartTs) continue;

        const check = paymentMatchesWeekEnergy(week.totalKWh, t.wonAmount, extraRates);
        if (!check.matched) continue;

        const score = Math.abs(t.timestamp - weekEndTs);
        if (score < bestScore) {
          bestScore = score;
          bestMatch = t;
          bestRate = check.rate;
        }
      }

      if (bestMatch) {
        verifiedSales.push({
          txHash: bestMatch.txHash,
          blockNumber: bestMatch.blockNumber,
          timestamp: bestMatch.timestamp,
          from: bestMatch.from,
          to: bestMatch.to,
          wonAmount: bestMatch.wonAmount,
          kWh: week.totalKWh,
          wh: week.totalWh,
          weekIndex: week.weekIndex,
          weekLabel: week.weekLabel,
          ratePerKwh: bestRate,
          meterReadingCount: week.readings.length,
          verified: true,
        });
        usedTx.add(bestMatch.txHash);
      }
    }
  }

  verifiedSales.sort((a, b) => a.timestamp - b.timestamp);
  return verifiedSales;
}

/**
 * 계량기 지갑의 주차별 kWh와 금액·시각이 맞는 WON 송금을 찾음.
 * 송금 지갑(from)이 계량 지갑과 달라도 매칭 (태블릿·프레젠테이션용).
 */
function findMeterVerifiedTransfers(readings, candidateTransfers, extraRates = []) {
  if (!readings?.length || !candidateTransfers?.length) return [];

  const weeks = groupReadingsByWeek(readings)
    .filter((w) => !w.isCurrent && w.totalKWh > 0)
    .sort((a, b) => a.weekIndex - b.weekIndex);

  const usedTx = new Set();
  const matched = [];

  for (const week of weeks) {
    const weekStartTs = Math.floor(week.start.getTime() / 1000);
    const weekEndTs = Math.floor(week.end.getTime() / 1000);

    let best = null;
    let bestScore = Infinity;

    for (const t of candidateTransfers) {
      if (usedTx.has(t.txHash)) continue;
      if (t.timestamp < weekStartTs) continue;

      const check = paymentMatchesWeekEnergy(week.totalKWh, t.wonAmount, extraRates);
      if (!check.matched) continue;

      const score = Math.abs(t.timestamp - weekEndTs);
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }

    if (best) {
      matched.push(best);
      usedTx.add(best.txHash);
    }
  }

  return matched;
}

/**
 * 계량기 주차별 Wh와 원장 soldWh가 맞는 EnergySold만 반환.
 * 결제 지갑(MetaMask) ≠ 계량기 지갑이어도 정산됨으로 인정.
 */
function findLedgerPurchasesForMeter(readings, ledgerTransfers) {
  if (!readings?.length || !ledgerTransfers?.length) return [];

  const weeks = groupReadingsByWeek(readings)
    .filter((w) => !w.isCurrent && w.totalWh > 0)
    .sort((a, b) => a.weekIndex - b.weekIndex);

  const usedTx = new Set();
  const matched = [];

  for (const week of weeks) {
    let best = null;
    let bestScore = Infinity;

    for (const t of ledgerTransfers) {
      if (usedTx.has(t.txHash)) continue;
      const soldWh = Number(t.soldWh);
      if (!Number.isFinite(soldWh) || soldWh <= 0) continue;
      if (!whAmountsMatch(week.totalWh, soldWh)) continue;

      const score = Math.abs(week.totalWh - soldWh);
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }

    if (best) {
      matched.push(best);
      usedTx.add(best.txHash);
    }
  }

  return matched;
}

/** soldWh와 주차 계량 Wh가 맞는 주차를 계량기 readings에서 찾음 */
function matchMeterWeekForSoldWh(readings, soldWh, timestamp) {
  if (!readings?.length || !soldWh || soldWh <= 0) return null;

  const weeks = groupReadingsByWeek(readings).filter((w) => w.totalWh > 0);
  if (!weeks.length) return null;

  const weekIdx = timestamp ? getWeekIndex(timestamp) : null;

  if (weekIdx != null) {
    const exact = weeks.find(
      (w) => w.weekIndex === weekIdx && whAmountsMatch(w.totalWh, soldWh),
    );
    if (exact) return exact;
  }

  for (const w of weeks) {
    if (whAmountsMatch(w.totalWh, soldWh)) return w;
  }
  return null;
}

/**
 * EnergySold의 buyer(결제 지갑)와 soldWh로 실제 계량기 지갑을 역추적.
 * MetaMask 결제 지갑 ≠ IoT 계량기 지갑인 경우에도 매칭.
 */
function resolveMeterWalletForSoldWh(meterReadingsMap, soldWh, timestamp, buyerWallet) {
  const buyerLower = (buyerWallet || '').toLowerCase();

  const tryMeter = (meter) => {
    const readings = meterReadingsMap[meter.toLowerCase()];
    if (!readings?.length) return null;
    const week = matchMeterWeekForSoldWh(readings, soldWh, timestamp);
    return week ? { meterWallet: meter, week } : null;
  };

  if (buyerWallet) {
    const hit = tryMeter(buyerWallet);
    if (hit) return { buyerWallet, ...hit };
  }

  for (const meter of Object.keys(meterReadingsMap)) {
    if (meter.toLowerCase() === buyerLower) continue;
    const hit = tryMeter(meter);
    if (hit) return { buyerWallet, ...hit };
  }

  return { buyerWallet, meterWallet: null, week: null };
}

module.exports = {
  matchVerifiedProducerSales,
  findMeterVerifiedTransfers,
  findLedgerPurchasesForMeter,
  matchMeterWeekForSoldWh,
  resolveMeterWalletForSoldWh,
  groupReadingsByWeek,
  getWeekIndex,
  whAmountsMatch,
};
