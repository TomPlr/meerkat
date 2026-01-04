import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  mainnet,
  base,
  polygon,
  optimism,
  arbitrum,
  type AppKitNetwork,
} from '@reown/appkit/networks'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  base,
  polygon,
  optimism,
  arbitrum,
]

export function createWagmiAdapter(projectId: string) {
  return new WagmiAdapter({
    networks,
    projectId,
  })
}
