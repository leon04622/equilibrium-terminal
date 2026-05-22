import { http, createConfig } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [arbitrum, mainnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
