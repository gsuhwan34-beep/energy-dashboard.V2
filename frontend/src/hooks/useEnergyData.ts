import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

// ── Types matching real on-chain response ──

export interface EnergyReading {
  txHash: string
  blockNumber: number
  logIndex: number
  wh: number
  kWh: number
  timestamp: number
  date: string
  gasUsed?: number
  status?: string
  gasCostWei?: number
  gasCostGwei?: number
  blockTimestamp?: number
  blockDate?: string
}

export interface EnergyOverview {
  totalReadings: number
  totalWh: number
  totalKWh: number
  estimatedCostKRW: number
  totalGasUsed: number
  totalGasCostGwei: number
  firstReading: EnergyReading | null
  lastReading: EnergyReading | null
}

export interface EnergyResponse {
  wallet: string
  contract: string
  network: string
  chainId: number
  latestBlock: number
  overview: EnergyOverview
  readings: EnergyReading[]
}

export interface NetworkInfo {
  network: string
  chainId: number
  latestBlock: number | null
  rpcUrl: string
  contract: string
  status: string
  error?: string
}

// ── Main hook: fetch all energy data for a wallet ──

export function useEnergyData(wallet: string) {
  const [data, setData] = useState<EnergyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(api(`energy?wallet=${wallet}`))
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(err.error || 'Failed to fetch')
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    if (!wallet) return
    refetch()
    // Auto-refresh every 15 seconds
    const interval = setInterval(refetch, 15000)
    return () => clearInterval(interval)
  }, [refetch, wallet])

  return { data, loading, error, refetch }
}

// ── Settlement (WON transfer) records hook ──

export interface SettlementTransfer {
  txHash: string
  blockNumber: number
  timestamp: number
  from: string
  to: string
  wonAmount: number
}

export interface SettlementResponse {
  wonToken: string
  transfers: SettlementTransfer[]
}

// 구매자(계량기/결제) 지갑 기준 정산 조회 — 선택한 공급자 탭과 무관
export function useConsumerSettlements(payerWallets: string[]) {
  const [data, setData] = useState<SettlementResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const walletKey = payerWallets
    .filter(w => /^0x[a-fA-F0-9]{40}$/.test(w))
    .map(w => w.toLowerCase())
    .sort()
    .join(',')

  const refetch = useCallback(async () => {
    const wallets = walletKey.split(',').filter(Boolean)
    if (!wallets.length) return
    try {
      setLoading(true)
      const results = await Promise.all(
        wallets.map(async (wallet) => {
          const res = await fetch(api(`energy/settlements?consumer=${wallet}`))
          if (!res.ok) return [] as SettlementTransfer[]
          const json = await res.json()
          return (json.transfers ?? []) as SettlementTransfer[]
        }),
      )

      const merged = new Map<string, SettlementTransfer>()
      for (const list of results) {
        for (const t of list) merged.set(t.txHash, t)
      }
      const transfers = Array.from(merged.values()).sort((a, b) => a.timestamp - b.timestamp)

      setData({ wonToken: '', transfers })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [walletKey])

  useEffect(() => {
    refetch()
    const interval = setInterval(refetch, 15000)
    return () => clearInterval(interval)
  }, [refetch])

  return { data, loading, refetch }
}

// ── Network status hook ──

export function useNetworkStatus() {
  const [network, setNetwork] = useState<NetworkInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(api('energy/network'))
        const json = await res.json()
        setNetwork(json)
      } catch {
        setNetwork({
          network: 'Arbitrum Sepolia',
          chainId: 421614,
          latestBlock: null,
          rpcUrl: '',
          contract: '',
          status: 'disconnected',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return { network, loading }
}
