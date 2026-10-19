import { http, createConfig, createStorage } from "wagmi";
import { mezoTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [mezoTestnet],
  storage: createStorage({ storage: localStorage }),
  multiInjectedProviderDiscovery: true,
  connectors: [],
  ssr: false,
  transports: {
    [mezoTestnet.id]: http(mezoTestnet.rpcUrls.default.http[0]),
  },
});
