import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { mainnet, polygon, sepolia } from "wagmi/chains";
import { AppMode, ProjectId } from "./constants";
import { getPublicClient } from "@wagmi/core";
import { AppModes } from "@/types";

if (!ProjectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const MainChain = AppMode === AppModes.Development ? sepolia : polygon;
// Create wagmiConfig
const chains = [MainChain] as const;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: ProjectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const config =
  AppMode === AppModes.Development
    ? createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
      })
    : createConfig({
        chains: [mainnet],
        transports: {
          [mainnet.id]: http(),
        },
      });

export const wagmiClient = getPublicClient(config);
