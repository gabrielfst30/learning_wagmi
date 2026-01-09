'use client'

import * as React from 'react'
import { Connector, useConnect, useConnectors } from 'wagmi'

/**
 * @notice Lista e renderiza os conectores de carteira disponíveis e aciona a conexão ao clicar.
 * @dev Usa `useConnect` e `useConnectors` do wagmi; garante que cada botão invoque `connect` com o conector correspondente.
 */
export function WalletOptions() {
  const { connect } = useConnect()
  const connectors = useConnectors()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}