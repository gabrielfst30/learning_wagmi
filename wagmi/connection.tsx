'use client'

import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

/**
 * @notice Exibe os dados da conexão atual (endereço/ENS) e permite desconectar.
 * @dev Usa hooks do wagmi para: pegar o endereço (`useConnection`), resolver ENS (`useEnsName`), carregar avatar (`useEnsAvatar`) e desconectar (`useDisconnect`).
 */
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