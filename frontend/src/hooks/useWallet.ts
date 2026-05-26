import { useState, useCallback, useEffect } from 'react'
import { BrowserProvider, Contract, parseUnits } from 'ethers'

// ── 상수 ──
const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee' // 421614 in hex
const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
}

// WON 토큰 정보
const WON_TOKEN_ADDRESS = '0x884486C95F186F4Bc37D0cC9CBc23DF88829fdBB'
const WON_TOKEN_ABI = ['function transfer(address to, uint amount) returns (bool)']

// ── 에너지 공급자 설정 ──
export interface EnergySupplier {
  id: 'renewable' | 'mixed'
  label: string
  emoji: string
  rate: number        // WON per kWh
  wallet: string      // 정산 수신 지갑
  description: string
}

export const SUPPLIERS: Record<string, EnergySupplier> = {
  renewable: {
    id: 'renewable',
    label: '신재생 에너지',
    emoji: '🍃',
    rate: 150,
    wallet: '0xf7486A72851c1054661e9E6bF96f1ACcb1f7b6F8',
    description: '태양광·풍력 등 친환경 에너지',
  },
  mixed: {
    id: 'mixed',
    label: '일반 혼합 전력',
    emoji: '🏭',
    rate: 100,
    wallet: '0x0C6F6f9FA1BB851AeF9e08c57E4E2a9820858D8e', // 🔥 새로 주신 혼합 전력 지갑 주소 완벽 적용!
    description: '화석+원자력 혼합 발전',
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
