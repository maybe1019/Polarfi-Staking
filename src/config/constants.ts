import { AppModes } from "@/types";
import { Address } from "viem";

import FrostABI from "@/assets/abis/frost.json";
import MineABI from "@/assets/abis/mine.json";
import MinerABI from "@/assets/abis/miner.json";
import StakingABI from "@/assets/abis/staking.json";
import ERC20ABI from "@/assets/abis/erc20.json";
import FrostStakingABI from "@/assets/abis/frost-staking.json";
import FrostStakingPoolABI from "@/assets/abis/frost-staking-pool.json";

export const AppMode: AppModes = (process.env.NEXT_PUBLIC_APP_MODE ||
  AppModes.Development) as AppModes;

export const ProjectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

export const ContractAddresses = {
  Frost: process.env.NEXT_PUBLIC_FROST_TOKEN_ADDRESS as Address,
  Mine: process.env.NEXT_PUBLIC_MINE_ADDRESS as Address,
  Miner: process.env.NEXT_PUBLIC_MINER_ADDRESS as Address,
  Staking: process.env.NEXT_PUBLIC_STAKING_ADDRESS as Address,
  FrostStaking: process.env.NEXT_PUBLIC_FROST_STAKING_ADDRESS as Address,
};

export const ContractABIs = {
  Frost: FrostABI,
  Mine: MineABI,
  Miner: MinerABI,
  Staking: StakingABI,
  ERC20: ERC20ABI,
  FrostStaking: FrostStakingABI,
  FrostStakingPool: FrostStakingPoolABI,
};

export const DependencyDelayTime = 200;

export const MaxLPR = 100;

export const TransactionConfirmBlockCount = 1;

export const LDR = 10;

export const MinerTypeCount = 4;
export const MineTypeCount = 6;

export const MineNames = [
  "",
  "Ruby",
  "Obsidian",
  "Amethyst",
  "Emerald",
  "Gold",
  "Diamond",
];

export const RepairKitNames = [
  "",
  "Fluorite Repair Kit",
  "Amethyst Repair Kit",
  "Obsidian Repair Kit",
  "Agate Repair Kit",
];

export const Messages = {
  TransactionRejected: "Transaction rejected.",
  ConnectWallet: "Connect wallet.",
  WrongNetwork: "Change network.",
  Success: "Success!",
};
