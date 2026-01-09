'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config as wagmiConfig } from '../wagmi/config'
import { useState } from 'react'

/**
 * @notice Componente que envolve a aplicação com os providers necessários do wagmi e react-query.
 * @dev Cria uma nova instância de QueryClient por render para evitar compartilhamento entre requests no SSR.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
