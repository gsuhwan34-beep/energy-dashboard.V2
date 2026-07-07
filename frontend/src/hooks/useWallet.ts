import { useState, useCallback, useEffect } from 'react'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import { PRODUCER_LEDGER_ADDRESS, PRODUCER_LEDGER_ABI } from '../lib/producerLedger'

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

// WON 토큰 정보
const WON_TOKEN_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'
const WON_TOKEN_ABI = [
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
]

// ── 에너지 공급자 설정 ──
export interface EnergySupplier {
  id: 'renewable' | 'mixed' | 'custom'
  label: string
  emoji: string
  rate: number        // WON per kWh
  wallet: string      // 정산 수신 지갑
  description: string
}

/** 프리셋 공급자 단가 — 정산 매칭 시 탭 선택과 무관하게 사용 */
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
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
  })

  // 현재 체인 확인
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      return chainId === ARBITRUM_SEPOLIA_CHAIN_ID
    } catch {
      return false
    }
  }, [])

  // 지갑 연결
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: '메타마스크가 설치되어 있지 않습니다.' }))
      return
    }

    setState(s => ({ ...s, isConnecting: true, error: null }))

    try {
      // 계정 요청
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts.length) {
        setState(s => ({ ...s, isConnecting: false, error: '지갑 연결이 거부되었습니다.' }))
        return
      }

      // 네트워크 확인 & 전환
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
          })
        } catch (switchErr: any) {
          // 체인이 없으면 추가
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [ARBITRUM_SEPOLIA_CONFIG],
            })
          } else {
            throw switchErr
          }
        }
      }

      const finalCorrect = await checkNetwork()

      setState({
        address: accounts[0],
        isConnected: true,
        isCorrectNetwork: finalCorrect,
        isConnecting: false,
        error: null,
      })
    } catch (err: any) {
      setState(s => ({
        ...s,
        isConnecting: false,
        error: err.message || '지갑 연결에 실패했습니다.',
      }))
    }
  }, [checkNetwork])

  // 연결 해제
  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,
    })
  }, [])

  // WON 토큰 전송 (정산) — 공급자별 지갑 + 요금 반영
  const transferWon = useCallback(async (amountKwh: number, supplierWallet: string, ratePerKwh: number): Promise<string> => {
    if (!window.ethereum || !state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }

    const wonAmount = amountKwh * ratePerKwh
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new Contract(WON_TOKEN_ADDRESS, WON_TOKEN_ABI, signer)

    // 🔥 [수정 1] 자바스크립트 부동소수점 에러 방지를 위해 소수점 6자리까지만 잘라서 문자열로 변환 (안전장치)
    const safeWonAmountString = Number(wonAmount).toFixed(6)
    const amount = parseUnits(safeWonAmountString, 18)

    // 🔥 [수정 2] 가스비(수수료) 에러 해결을 위한 FeeData 수동 조회 및 50% 넉넉한 버퍼 추가
    const feeData = await provider.getFeeData()

    const tx = await contract.transfer(supplierWallet, amount, {
      // 현재 네트워크가 요구하는 수수료에 1.5배(150%)를 곱해서 강제로 여유 있게 세팅해줍니다. (빅인트 계산법: * 150n / 100n)
      maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined,
    })
    
    const receipt = await tx.wait()

    return receipt.hash
  }, [state.isConnected])

  /** P2P — 원장 purchaseEnergy (Wh). 판매 가능량은 미터 생산 − 원장 sold */
  const purchaseProducerEnergy = useCallback(async (
    whAmount: number,
    producerWallet: string,
  ): Promise<string> => {
    if (!window.ethereum || !state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }

    const whInt = BigInt(Math.max(1, Math.round(whAmount)))
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const feeData = await provider.getFeeData()
    const gasOpts = {
      maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined,
    }

    const ledger = new Contract(PRODUCER_LEDGER_ADDRESS, PRODUCER_LEDGER_ABI, signer)
    const rate = await ledger.ratePerKwh(producerWallet)
    if (rate === 0n) {
      throw new Error('생산자 단가가 온체인에 없습니다. 생산자 탭에서 MetaMask 연결 후 단가를 저장해 주세요.')
    }

    const wonCost = (whInt * rate * 10n ** 18n) / 1000n
    const won = new Contract(WON_TOKEN_ADDRESS, WON_TOKEN_ABI, signer)
    const approveTx = await won.approve(PRODUCER_LEDGER_ADDRESS, wonCost, gasOpts)
    await approveTx.wait()

    const tx = await ledger.purchaseEnergy(producerWallet, whInt, gasOpts)
    const receipt = await tx.wait()
    return receipt.hash
  }, [state.isConnected])

  const setProducerRateOnChain = useCallback(async (rate: number): Promise<string> => {
    if (!window.ethereum || !state.isConnected) {
      throw new Error('지갑이 연결되어 있지 않습니다.')
    }
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const ledger = new Contract(PRODUCER_LEDGER_ADDRESS, PRODUCER_LEDGER_ABI, signer)
    const tx = await ledger.setRate(Math.round(rate))
    const receipt = await tx.wait()
    return receipt.hash
  }, [state.isConnected])

  // 계정/체인 변경 감지
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setState(s => ({ ...s, address: accounts[0] }))
      }
    }

    const handleChainChanged = async () => {
      const isCorrect = await checkNetwork()
      setState(s => ({ ...s, isCorrectNetwork: isCorrect }))
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [checkNetwork, disconnect])

  // 이미 연결된 계정 자동 감지
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
      if (accounts.length > 0) {
        const isCorrect = await checkNetwork()
        setState({
          address: accounts[0],
          isConnected: true,
          isCorrectNetwork: isCorrect,
          isConnecting: false,
          error: null,
        })
      }
    }).catch(() => {})
  }, [checkNetwork])

  return { ...state, connect, disconnect, transferWon, purchaseProducerEnergy, setProducerRateOnChain }
}

// Window 타입 확장
declare global {
  interface Window {
    ethereum?: any
  }
}
