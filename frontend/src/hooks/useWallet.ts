import { useState, useCallback, useEffect, useRef } from 'react'
import { BrowserProvider, Contract, MaxUint256, formatUnits, getAddress, parseUnits } from 'ethers'
import { PRODUCER_LEDGER_ADDRESS, PRODUCER_LEDGER_ABI, LEDGER_ERROR_MESSAGES } from '../lib/producerLedger'
import {
  connectInjectedWallet,
  connectWalletConnect,
  disconnectActiveWallet,
  getActiveEip1193Provider,
  getConnectionMode,
  hasInjectedWallet,
  isMobileBrowser,
  restoreWalletConnectSession,
  subscribeProvider,
  type WalletConnectionMode,
} from '../lib/walletProvider'

// ── 상수 ──
const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee' // 421614 in hex
const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
}

export const PRODUCER_METER_ADDRESS = '0x9F9013b71f59d8ecf4730B4946F988827e3EE2A8'

const WON_TOKEN_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'
const WON_TOKEN_ABI = [
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
]

export interface EnergySupplier {
  id: 'renewable' | 'mixed' | 'custom'
  label: string
  emoji: string
  rate: number
  wallet: string
  description: string
}

export const PRESET_SETTLEMENT_RATES = [150, 100] as const

export const SUPPLIERS: Record<string, EnergySupplier> = {
  renewable: {
    id: 'renewable',
    label: '제주 동복 풍력발전단지',
    emoji: '🍃',
    rate: 150,
    wallet: '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
    description: '제주특별자치도 구좌읍 · 100% 친환경 풍력',
  },
  mixed: {
    id: 'mixed',
    label: '국가전력망 일반 혼합전력',
    emoji: '🏭',
    rate: 100,
    wallet: '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e',
    description: '충남 당진 화력 및 원자력 혼합 발전',
  },
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  isCorrectNetwork: boolean
  isConnecting: boolean
  error: string | null
  connectionMode: WalletConnectionMode | null
  hasInjectedWallet: boolean
  isMobileBrowser: boolean
}

type Eip1193Provider = NonNullable<ReturnType<typeof getActiveEip1193Provider>>

async function checkNetwork(provider: Eip1193Provider) {
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    return chainId === ARBITRUM_SEPOLIA_CHAIN_ID
  } catch {
    return false
  }
}

async function ensureArbitrumSepolia(provider: Eip1193Provider) {
  const isCorrect = await checkNetwork(provider)
  if (isCorrect) return true

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
    })
  } catch (switchErr: any) {
    if (switchErr.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [ARBITRUM_SEPOLIA_CONFIG],
      })
    } else {
      throw switchErr
    }
  }

  return checkNetwork(provider)
}

function requireProvider(): Eip1193Provider {
  const provider = getActiveEip1193Provider()
  if (!provider) {
    throw new Error('지갑이 연결되어 있지 않습니다.')
  }
  return provider
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
    connectionMode: null,
    hasInjectedWallet: hasInjectedWallet(),
    isMobileBrowser: isMobileBrowser(),
  })

  const unsubscribeRef = useRef<(() => void) | null>(null)

  const bindProviderEvents = useCallback((provider: Eip1193Provider) => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = subscribeProvider(provider, {
      onAccountsChanged: (accounts) => {
        if (accounts.length === 0) {
          disconnectActiveWallet()
          setState(s => ({
            ...s,
            address: null,
            isConnected: false,
            isCorrectNetwork: false,
            connectionMode: null,
          }))
        } else {
          setState(s => ({ ...s, address: accounts[0] }))
        }
      },
      onChainChanged: async () => {
        const isCorrect = await checkNetwork(provider)
        setState(s => ({ ...s, isCorrectNetwork: isCorrect }))
      },
      onDisconnect: () => {
        setState(s => ({
          ...s,
          address: null,
          isConnected: false,
          isCorrectNetwork: false,
          connectionMode: null,
        }))
      },
    })
  }, [])

  const connectWithMode = useCallback(async (mode: WalletConnectionMode) => {
    setState(s => ({ ...s, isConnecting: true, error: null }))

    try {
      const provider =
        mode === 'injected'
          ? await connectInjectedWallet()
          : await connectWalletConnect()

      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' })
      if (!accounts.length) {
        await disconnectActiveWallet()
        setState(s => ({ ...s, isConnecting: false, error: '지갑 연결이 거부되었습니다.' }))
        return
      }

      const isCorrect = await ensureArbitrumSepolia(provider)
      bindProviderEvents(provider)

      setState(s => ({
        ...s,
        address: accounts[0],
        isConnected: true,
        isCorrectNetwork: isCorrect,
        isConnecting: false,
        error: null,
        connectionMode: mode,
      }))
    } catch (err: any) {
      await disconnectActiveWallet()
      setState(s => ({
        ...s,
        isConnecting: false,
        error: err?.message || '지갑 연결에 실패했습니다.',
      }))
    }
  }, [bindProviderEvents])

  const connect = useCallback(async () => {
    if (state.isMobileBrowser || !hasInjectedWallet()) {
      await connectWithMode('walletconnect')
      return
    }
    await connectWithMode('injected')
  }, [connectWithMode, state.isMobileBrowser])

  const connectInjected = useCallback(async () => {
    await connectWithMode('injected')
  }, [connectWithMode])

  const connectMobile = useCallback(async () => {
    await connectWithMode('walletconnect')
  }, [connectWithMode])

  const disconnect = useCallback(async () => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
    await disconnectActiveWallet()
    setState(s => ({
      ...s,
      address: null,
      isConnected: false,
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,
      connectionMode: null,
    }))
  }, [])

  const transferWon = useCallback(async (amountKwh: number, supplierWallet: string, ratePerKwh: number): Promise<string> => {
    if (!state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }

    const eip1193 = requireProvider()
    const wonAmount = amountKwh * ratePerKwh
    const provider = new BrowserProvider(eip1193)
    const signer = await provider.getSigner()
    const contract = new Contract(WON_TOKEN_ADDRESS, WON_TOKEN_ABI, signer)

    const safeWonAmountString = Number(wonAmount).toFixed(6)
    const amount = parseUnits(safeWonAmountString, 18)
    const feeData = await provider.getFeeData()

    const tx = await contract.transfer(supplierWallet, amount, {
      maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined,
    })

    const receipt = await tx.wait()
    return receipt.hash
  }, [state.isConnected])

  const purchaseProducerEnergy = useCallback(async (
    whAmount: number,
    producerWallet: string,
  ): Promise<string> => {
    if (!state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }

    const producer = getAddress(producerWallet)
    const whInt = BigInt(Math.max(1, Math.round(whAmount)))
    const eip1193 = requireProvider()
    const provider = new BrowserProvider(eip1193)
    const signer = await provider.getSigner()
    const buyer = await signer.getAddress()
    const feeData = await provider.getFeeData()
    const gasOpts = {
      maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined,
    }

    const ledger = new Contract(getAddress(PRODUCER_LEDGER_ADDRESS), PRODUCER_LEDGER_ABI, signer)
    const rate = await ledger.ratePerKwh(producer)
    if (rate === 0n) {
      throw new Error('생산자 단가가 온체인에 없습니다. 생산자 탭에서 지갑 연결 후 단가를 저장해 주세요.')
    }

    const wonCost = (whInt * rate * 10n ** 18n) / 1000n
    const won = new Contract(getAddress(WON_TOKEN_ADDRESS), WON_TOKEN_ABI, signer)
    const balance: bigint = await won.balanceOf(buyer)
    if (balance < wonCost) {
      throw new Error(`WON 잔액이 부족합니다. 필요: ${formatUnits(wonCost, 18)} WON`)
    }

    const ledgerAddr = getAddress(PRODUCER_LEDGER_ADDRESS)
    const allowance: bigint = await won.allowance(buyer, ledgerAddr)

    try {
      if (allowance < wonCost) {
        const approveTx = await won.approve(ledgerAddr, MaxUint256, gasOpts)
        await approveTx.wait()
      }
      const tx = await ledger.purchaseEnergy(producer, whInt, gasOpts)
      const receipt = await tx.wait()
      if (!receipt) throw new Error('정산 트랜잭션이 확인되지 않았습니다.')
      return receipt.hash
    } catch (err: unknown) {
      const data = (err as { data?: string })?.data
      if (typeof data === 'string') {
        const selector = data.slice(0, 10).toLowerCase()
        const msg = LEDGER_ERROR_MESSAGES[selector]
        if (msg) throw new Error(msg)
      }
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('user rejected') || msg.includes('User denied')) {
        throw new Error('지갑에서 정산이 취소되었습니다.')
      }
      throw err
    }
  }, [state.isConnected])

  const setProducerRateOnChain = useCallback(async (rate: number): Promise<string> => {
    if (!state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }

    const eip1193 = requireProvider()
    const provider = new BrowserProvider(eip1193)
    const signer = await provider.getSigner()
    const ledger = new Contract(getAddress(PRODUCER_LEDGER_ADDRESS), PRODUCER_LEDGER_ABI, signer)
    const tx = await ledger.setRate(Math.round(rate))
    const receipt = await tx.wait()
    return receipt.hash
  }, [state.isConnected])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const provider = getActiveEip1193Provider() ?? (await restoreWalletConnectSession())
      if (!provider || cancelled) return

      try {
        const accounts: string[] = await provider.request({ method: 'eth_accounts' })
        if (accounts.length === 0) return

        bindProviderEvents(provider)
        const isCorrect = await checkNetwork(provider)
        if (cancelled) return

        setState(s => ({
          ...s,
          address: accounts[0],
          isConnected: true,
          isCorrectNetwork: isCorrect,
          isConnecting: false,
          error: null,
          connectionMode: getConnectionMode(),
        }))
      } catch {
        // ignore restore errors
      }
    }

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
        if (cancelled) return
        if (accounts.length === 0) {
          await restoreSession()
          return
        }

        await connectInjectedWallet()
        bindProviderEvents(window.ethereum!)
        const isCorrect = await checkNetwork(window.ethereum!)
        if (cancelled) return

        setState(s => ({
          ...s,
          address: accounts[0],
          isConnected: true,
          isCorrectNetwork: isCorrect,
          isConnecting: false,
          error: null,
          connectionMode: 'injected',
        }))
      }).catch(() => {
        restoreSession()
      })
    } else {
      restoreSession()
    }

    return () => {
      cancelled = true
      unsubscribeRef.current?.()
    }
  }, [bindProviderEvents])

  return {
    ...state,
    connect,
    connectInjected,
    connectMobile,
    disconnect,
    transferWon,
    purchaseProducerEnergy,
    setProducerRateOnChain,
  }
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>
      on?: (event: string, handler: (...args: any[]) => void) => void
      removeListener?: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
