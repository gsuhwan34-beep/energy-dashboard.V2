import EthereumProvider from '@walletconnect/ethereum-provider'

export type WalletConnectionMode = 'injected' | 'walletconnect'

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614

let activeProvider: EthereumProvider | typeof window.ethereum | null = null
let connectionMode: WalletConnectionMode | null = null
let wcProvider: EthereumProvider | null = null

export function getActiveEip1193Provider() {
  return activeProvider
}

export function getConnectionMode() {
  return connectionMode
}

export function hasInjectedWallet() {
  return typeof window !== 'undefined' && Boolean(window.ethereum)
}

export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function getWalletConnectProjectId() {
  return import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || ''
}

async function initWalletConnectProvider() {
  const projectId = getWalletConnectProjectId()
  if (!projectId) {
    throw new Error(
      '모바일 지갑 연결 설정(VITE_WALLETCONNECT_PROJECT_ID)이 없습니다. Reown Cloud에서 Project ID를 발급해 주세요.',
    )
  }

  if (!wcProvider) {
    wcProvider = await EthereumProvider.init({
      projectId,
      chains: [ARBITRUM_SEPOLIA_CHAIN_ID],
      optionalChains: [ARBITRUM_SEPOLIA_CHAIN_ID],
      showQrModal: true,
      metadata: {
        name: 'Energy Dashboard',
        description: 'P2P Energy Settlement Dashboard',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://energy-dashboard.vercel.app',
        icons: [
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : 'https://energy-dashboard.vercel.app/favicon.ico',
        ],
      },
    })
  }

  return wcProvider
}

export async function connectInjectedWallet() {
  if (!window.ethereum) {
    throw new Error('브라우저 지갑(확장 프로그램)을 찾을 수 없습니다.')
  }

  activeProvider = window.ethereum
  connectionMode = 'injected'
  return activeProvider
}

export async function connectWalletConnect() {
  const provider = await initWalletConnectProvider()

  if (!provider.session) {
    await provider.connect()
  }

  activeProvider = provider
  connectionMode = 'walletconnect'
  return provider
}

export async function restoreWalletConnectSession() {
  const projectId = getWalletConnectProjectId()
  if (!projectId) return null

  try {
    const provider = await initWalletConnectProvider()
    if (!provider.session) return null

    activeProvider = provider
    connectionMode = 'walletconnect'
    return provider
  } catch {
    return null
  }
}

export async function disconnectActiveWallet() {
  if (connectionMode === 'walletconnect' && wcProvider?.session) {
    try {
      await wcProvider.disconnect()
    } catch {
      // ignore disconnect errors
    }
  }

  activeProvider = null
  connectionMode = null
}

export function subscribeProvider(
  provider: NonNullable<typeof activeProvider>,
  handlers: {
    onAccountsChanged: (accounts: string[]) => void
    onChainChanged: () => void
    onDisconnect?: () => void
  },
) {
  const { onAccountsChanged, onChainChanged, onDisconnect } = handlers

  provider.on?.('accountsChanged', onAccountsChanged)
  provider.on?.('chainChanged', onChainChanged)
  if (onDisconnect) {
    provider.on?.('disconnect', onDisconnect)
  }

  return () => {
    provider.removeListener?.('accountsChanged', onAccountsChanged)
    provider.removeListener?.('chainChanged', onChainChanged)
    if (onDisconnect) {
      provider.removeListener?.('disconnect', onDisconnect)
    }
  }
}
