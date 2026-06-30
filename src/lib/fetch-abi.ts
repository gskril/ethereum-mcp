import { whatsabi } from '@shazow/whatsabi'
import { createPublicClient, http, type Abi, type Chain } from 'viem'
import { defineChain } from 'viem/utils'

// Supported by abidata.net
const chainIds = {
  mainnet: 1,
  goerli: 5,
  sepolia: 11155111,
  avalanche: 43114,
  avalancheFuji: 43113,
  arbitrum: 42161,
  arbitrumGoerli: 421613,
  arbitrumNova: 42170,
  base: 8453,
  baseGoerli: 84531,
  bsc: 56,
  bscTestnet: 97,
  fantom: 250,
  fantomTestnet: 4002,
  polygon: 137,
  polygonMumbai: 80001,
  polygonZkEvm: 1101,
  polygonZkEvmTestnet: 2442,
  optimism: 10,
  optimismGoerli: 420,
  gnosis: 100,
} as const

export type FetchAbiNetwork = keyof typeof chainIds

export const fetchAbiNetworks = Object.keys(chainIds) as FetchAbiNetwork[]

type AbidataResponse = {
  ok: boolean
  abi?: Abi
  error?: string
  [key: string]: unknown
}

export type FetchAbiResult = {
  ok: boolean
  abi?: Abi
  source?: 'abidata' | 'whatsabi'
  error?: string
  resolvedAddress?: string
  attempts?: {
    abidata?: AbidataResponse | { error: string }
    whatsabi?: { error: string } | { abiLength: number; resolvedAddress: string }
  }
}

function chainForNetwork(network: FetchAbiNetwork): Chain {
  const id = chainIds[network]

  return defineChain({
    id,
    name: network,
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: {
      default: { http: [`https://evm.stupidtech.net/v1/${id}`] },
    },
  })
}

async function fetchAbiFromAbidata(
  address: string,
  network: FetchAbiNetwork
): Promise<AbidataResponse> {
  const res = await fetch(`https://abidata.net/${address}?network=${network}`)
  const data = (await res.json()) as AbidataResponse

  if (!res.ok && data.ok !== true) {
    return {
      ...data,
      ok: false,
      error: data.error ?? `abidata.net request failed with status ${res.status}`,
    }
  }

  return data
}

async function fetchAbiFromWhatsabi(
  address: string,
  network: FetchAbiNetwork
): Promise<FetchAbiResult> {
  const chain = chainForNetwork(network)

  const client = createPublicClient({
    chain,
    transport: http(),
  })

  let result = await whatsabi.autoload(address, {
    provider: client,
    abiLoader: false,
    followProxies: true,
    onError: () => true,
  })

  if (result.followProxies) {
    result = await result.followProxies()
  }

  if (!result.abi?.length) {
    return {
      ok: false,
      error: 'whatsabi could not resolve an ABI for this contract',
      resolvedAddress: result.address,
    }
  }

  return {
    ok: true,
    abi: result.abi as Abi,
    source: 'whatsabi',
    resolvedAddress: result.address,
  }
}

function hasAbi(data: AbidataResponse | FetchAbiResult): data is {
  ok: true
  abi: Abi
} {
  return data.ok === true && Array.isArray(data.abi) && data.abi.length > 0
}

export async function fetchContractAbi(
  address: string,
  network: FetchAbiNetwork
): Promise<FetchAbiResult> {
  const [abidataResult, whatsabiResult] = await Promise.allSettled([
    fetchAbiFromAbidata(address, network),
    fetchAbiFromWhatsabi(address, network),
  ])

  const abidata =
    abidataResult.status === 'fulfilled'
      ? abidataResult.value
      : {
          ok: false,
          error:
            abidataResult.reason instanceof Error
              ? abidataResult.reason.message
              : String(abidataResult.reason),
        }

  const whatsabi =
    whatsabiResult.status === 'fulfilled'
      ? whatsabiResult.value
      : {
          ok: false,
          error:
            whatsabiResult.reason instanceof Error
              ? whatsabiResult.reason.message
              : String(whatsabiResult.reason),
        }

  if (hasAbi(abidata)) {
    return {
      ...abidata,
      source: 'abidata',
      attempts: {
        abidata,
        whatsabi: whatsabi.ok
          ? {
              abiLength: whatsabi.abi!.length,
              resolvedAddress: whatsabi.resolvedAddress ?? address,
            }
          : { error: whatsabi.error ?? 'unknown error' },
      },
    }
  }

  if (whatsabi.ok && whatsabi.abi?.length) {
    return {
      ...whatsabi,
      attempts: {
        abidata,
        whatsabi: {
          abiLength: whatsabi.abi.length,
          resolvedAddress: whatsabi.resolvedAddress ?? address,
        },
      },
    }
  }

  return {
    ok: false,
    error:
      abidata.error ??
      whatsabi.error ??
      'Unable to resolve ABI from abidata.net or whatsabi',
    attempts: {
      abidata,
      whatsabi: { error: whatsabi.error ?? 'unknown error' },
    },
  }
}
