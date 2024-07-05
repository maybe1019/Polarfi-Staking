import { ContractABIs, ContractAddresses } from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { formatEther } from "viem";

export const getFrostAllowance = async (owner?: string, operator?: string) => {
  if (!owner || !operator) return 0;

  const allowance = (await wagmiClient.readContract({
    abi: ContractABIs.Frost,
    address: ContractAddresses.Frost,
    functionName: "allowance",
    args: [owner, operator],
  })) as string;

  return Number(formatEther(BigInt(allowance)));
};
