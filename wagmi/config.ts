import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

/**
 * @notice Configuração principal do wagmi para habilitar conexões de carteira nas redes mainnet e base.
 * @dev Substitua `projectId` por um ID real do WalletConnect Cloud. Ajuste `chains` e `transports` se quiser mais redes (ex.: optimism).
 */
export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})