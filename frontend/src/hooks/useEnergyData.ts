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
  suppliers: string[]
  wonToken: string
  transfers: SettlementTransfer[]
}

// 공급자 지갑으로 들어온 모든 WON 전송 내역 조회 (지갑 무관)
export function useSettlements() {
  const [data, setData] = useState<SettlementResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(api('energy/settlements'))
      if (!res.ok) return
      const json = await res.json()
      setData(json)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

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
