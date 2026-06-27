import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { EnergyReading } from './useEnergyData'
import type { SettlementTransfer } from './useEnergyData'

export interface ProducerOverview {
  totalReadings: number
  totalWh: number
  totalProductionKWh: number
  totalWonReceived: number
  soldKWh: number
  soldWh: number
  availableKWh: number
  availableWh: number
  firstProduction: EnergyReading | null
  lastProduction: EnergyReading | null
}

export interface ProducerResponse {
  wallet: string
  contract: string
  wonToken: string
  network: string
  chainId: number
  latestBlock: number
  ratePerKwh: number
  overview: ProducerOverview
  productions: EnergyReading[]
  sales: SettlementTransfer[]
}

export function useProducerData(wallet: string) {
  const [data, setData] = useState<ProducerResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(api(`producer?wallet=${wallet}`))
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(err.error || 'Failed to fetch producer data')
      }
      setData(await res.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    if (!wallet) return
    refetch()
    const interval = setInterval(refetch, 15000)
    return () => clearInterval(interval)
  }, [refetch, wallet])

  return { data, loading, error, refetch }
}
