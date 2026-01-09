# Guia de Implementação Wagmi + Next.js 14+

Este guia explica passo a passo como integrar wagmi (biblioteca para interação com carteiras Web3) em uma aplicação Next.js com App Router.

## 📦 Passo 1: Instalação de Dependências

```bash
pnpm add wagmi viem@2.x @tanstack/react-query
pnpm add @metamask/sdk
```

### O que cada dependência faz:

- **wagmi**: Biblioteca principal para gerenciar conexões de carteiras e interações blockchain
- **viem**: Cliente Ethereum de baixo nível (substituto do ethers.js)
- **@tanstack/react-query**: Gerenciamento de estado assíncrono (requerido pelo wagmi)
- **@metamask/sdk**: SDK necessário para o conector MetaMask funcionar

## ⚙️ Passo 2: Configuração do Wagmi

### 2.1 Criar o arquivo de configuração ([config.ts](config.ts))

```typescript
import { http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

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
```

**Explicação dos elementos:**

- **chains**: Redes blockchain que sua aplicação suporta (mainnet Ethereum e Base)
- **connectors**: Métodos de conexão de carteiras:
  - `injected()` - Detecta carteiras injetadas no navegador (Coinbase Extension, etc.)
  - `walletConnect()` - Conexão via QR code para mobile (requer Project ID do WalletConnect Cloud)
  - `metaMask()` - Conector específico para MetaMask
  - `safe()` - Para apps rodando dentro de um Gnosis Safe
- **transports**: Como se comunicar com cada rede (HTTP público ou seu próprio RPC)

⚠️ **Importante**: Substitua `<WALLETCONNECT_PROJECT_ID>` por um ID real obtido em [cloud.walletconnect.com](https://cloud.walletconnect.com)

### 2.2 (Opcional) Customizar transportes

Para melhor performance e rate limits, use providers dedicados:

```typescript
transports: {
  [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
  [base.id]: http('https://base-mainnet.g.alchemy.com/v2/YOUR_KEY'),
}
```

## 🧩 Passo 3: Estrutura de Componentes

### 3.1 Providers ([providers.tsx](providers.tsx))

Componente **Client Component** que envolve a aplicação com os providers necessários.

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config as wagmiConfig } from './config'
import { useState } from 'react'

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
```

**Por que `useState` para QueryClient?**
- Evita compartilhamento de cache entre diferentes usuários no SSR
- Cada render cria sua própria instância isolada

### 3.2 Componente de Conexão ([connect-wallet.tsx](connect-wallet.tsx))

Lógica condicional para mostrar interface apropriada.

```typescript
'use client'

import { useConnection } from 'wagmi'
import { Connection } from './connection'
import { WalletOptions } from './wallet-options'

export function ConnectWallet() {
  const { isConnected } = useConnection()
  if (isConnected) return <Connection />
  return <WalletOptions />
}
```

- Se **conectado**: mostra dados da conexão
- Se **não conectado**: mostra botões para conectar

### 3.3 Lista de Carteiras ([wallet-options.tsx](wallet-options.tsx))

Renderiza botões para cada conector disponível.

```typescript
'use client'

import { useConnect, useConnectors } from 'wagmi'

export function WalletOptions() {
  const { connect } = useConnect()
  const connectors = useConnectors()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}
```

**Hooks usados:**
- `useConnectors()` - Lista todos conectores configurados
- `useConnect()` - Função para iniciar conexão

### 3.4 Estado da Conexão ([connection.tsx](connection.tsx))

Exibe informações da carteira conectada.

```typescript
'use client'

import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Connection() {
  const { address } = useConnection()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

**Hooks usados:**
- `useConnection()` - Dados da conexão atual (endereço, status)
- `useDisconnect()` - Função para desconectar
- `useEnsName()` - Resolve ENS (ex: vitalik.eth)
- `useEnsAvatar()` - Busca avatar NFT do ENS

## 🔌 Passo 4: Integração no Layout

### 4.1 Layout Root ([app/layout.tsx](../app/layout.tsx))

```typescript
import { Providers } from "../wagmi/providers"
import { ConnectWallet } from "../wagmi/connect-wallet"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConnectWallet />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Estrutura hierárquica:**
```
RootLayout (Server Component)
└── Providers (Client Component)
    ├── ConnectWallet (Client Component)
    └── {children}
```

## 🎯 Conceitos Importantes

### Client vs Server Components

**Server Components** (padrão no Next.js 14+):
- Renderizados no servidor
- Não podem usar hooks ou event handlers
- Ótimos para buscar dados e SEO

**Client Components** (`'use client'`):
- Renderizados no navegador
- Podem usar hooks React e interatividade
- Necessários para wagmi (todos os hooks)

### Por que separar em arquivos?

1. **Responsabilidade única**: Cada componente tem uma função clara
2. **Server/Client boundary**: Layout permanece Server Component (mantém `metadata`)
3. **Reutilização**: Componentes podem ser usados em outras páginas
4. **Debugging**: Erros mais fáceis de rastrear

## 🚀 Uso em Páginas

### Exemplo: Página que lê saldo

```typescript
'use client'

import { useBalance } from 'wagmi'
import { useConnection } from 'wagmi'

export default function BalancePage() {
  const { address } = useConnection()
  const { data, isLoading } = useBalance({ address })

  if (isLoading) return <div>Carregando...</div>
  if (!address) return <div>Conecte sua carteira</div>

  return (
    <div>
      Saldo: {data?.formatted} {data?.symbol}
    </div>
  )
}
```

### Exemplo: Enviar transação

```typescript
'use client'

import { useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'

export default function SendPage() {
  const { sendTransaction } = useSendTransaction()

  const handleSend = () => {
    sendTransaction({
      to: '0x...',
      value: parseEther('0.01')
    })
  }

  return <button onClick={handleSend}>Enviar 0.01 ETH</button>
}
```

## 🔧 Customizações Comuns

### Adicionar mais redes

```typescript
import { optimism, polygon, arbitrum } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base, optimism, polygon, arbitrum],
  // ... restante da config
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})
```

### Estilizar componentes

Os componentes atuais são básicos. Você pode:

1. Adicionar Tailwind/CSS modules
2. Usar bibliotecas UI (shadcn/ui, MUI)
3. Criar modal para seleção de carteiras

Exemplo com Tailwind:

```typescript
<button 
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
  onClick={() => connect({ connector })}
>
  {connector.name}
</button>
```

## 📚 Próximos Passos

1. **Ler contratos**: Use `useReadContract` para chamar funções view
2. **Escrever contratos**: Use `useWriteContract` para transações
3. **Eventos**: Use `useWatchContractEvent` para monitorar eventos
4. **Switch de rede**: Use `useSwitchChain` para trocar entre chains
5. **Sign messages**: Use `useSignMessage` para assinaturas off-chain

## 🐛 Troubleshooting

### Erro: "Functions cannot be passed to Client Components"
- **Causa**: Provider ou config sendo usado diretamente em Server Component
- **Solução**: Garanta que todos componentes que usam wagmi tenham `'use client'`

### Erro: "dependency @metamask/sdk not found"
- **Causa**: Dependência não instalada
- **Solução**: `pnpm add @metamask/sdk`

### WalletConnect não funciona
- **Causa**: Project ID inválido ou não configurado
- **Solução**: Obtenha ID real em [cloud.walletconnect.com](https://cloud.walletconnect.com)

### Carteira não conecta
1. Verifique se a extensão está instalada
2. Confirme que a rede está suportada em `chains`
3. Veja console do navegador para erros

## 📖 Recursos

- [Documentação Wagmi](https://wagmi.sh)
- [Documentação Viem](https://viem.sh)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [Next.js App Router](https://nextjs.org/docs/app)
