'use client'

import { useConnection } from 'wagmi'
import { Connection } from '../wagmi/connection'
import { WalletOptions } from '../wagmi/wallet-options'

/**
 * @notice Renderiza o componente de conexão apropriado dependendo do estado da wallet.
 * @dev Mostra Connection se já conectado, ou WalletOptions para escolher/conectar uma wallet.
 */
export function ConnectWallet() {
  const { isConnected } = useConnection()
  if (isConnected) return <Connection />
  return <WalletOptions />
}
