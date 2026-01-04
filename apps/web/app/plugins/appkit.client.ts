import { createAppKit } from '@reown/appkit/vue'
import { WagmiPlugin } from '@wagmi/vue'
import { createWagmiAdapter, networks } from '~/config/appkit'

export default defineNuxtPlugin({
  name: 'appkit',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    const projectId = config.public.reownProjectId as string

    const wagmiAdapter = createWagmiAdapter(projectId)

    const appKit = createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata: {
        name: 'DeFi Assistant',
        description: 'Your DeFi lending/borrowing assistant',
        url: 'https://defi-assistant.app',
        icons: ['https://defi-assistant.app/icon.png'],
      },
      features: {
        analytics: true,
      },
    })

    nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })

    return {
      provide: {
        appKit,
      },
    }
  },
})
