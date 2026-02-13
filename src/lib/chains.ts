import { arbitrum, base, mainnet, optimism } from 'viem/chains'

const supportedChains = [mainnet, base, arbitrum, optimism]

export function chainFromName(name: string) {
  if (name.toLowerCase() === 'mainnet') return mainnet
  return supportedChains.find(
    (chain) => chain.name.toLowerCase() === name.toLowerCase()
  )
}
