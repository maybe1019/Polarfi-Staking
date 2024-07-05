import {
  ContractABIs,
  ContractAddresses,
  RepairKitNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getFrostAllowance } from "@/lib/contracts/frost";
import { RootState, useAppDispatch } from "@/store";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { loadUserMinerBalancesThunk } from "@/store/reducers/userReducer";
import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {
  typeId: number;
};

const MinerPurchaseCard = ({ typeId }: Props) => {
  const minerInfo = useSelector(
    (state: RootState) => state.app.minerInfo[typeId]
  );
  const balance = useSelector(
    (state: RootState) => state.user.miners.balances[typeId]
  );

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();

  const minerBalances = useSelector(
    (state: RootState) => state.user.miners.balances
  );

  const [count, setCount] = useState("0");
  const [btnLabel, setBtnLabel] = useState("");

  const handleMint = async () => {
    const cnt = Number(count);
    try {
      const allowanceInNumber = await getFrostAllowance(
        address,
        ContractAddresses.Miner
      );
      if (allowanceInNumber < minerInfo.price * cnt) {
        setBtnLabel("Approving...");
        const txHash = await writeContractAsync({
          abi: ContractABIs.Frost,
          address: ContractAddresses.Frost,
          functionName: "approve",
          args: [
            ContractAddresses.Miner,
            parseEther(Number.MAX_SAFE_INTEGER.toString()),
          ],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
      }

      setBtnLabel("Minting...");

      const hash = await writeContractAsync({
        abi: ContractABIs.Miner,
        address: ContractAddresses.Miner,
        functionName: "mint",
        args: [typeId, cnt],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash,
      });
      dispatch(loadUserMinerBalancesThunk({ address, tokenIds: [typeId] }));
    } catch (error: any) {
      console.error("handleMint", error?.message);
    }
    setBtnLabel("");
  };
  return (
    <div className="bg-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="aspect-square flex items-center justify-center p-10">
        <Image
          src={`/imgs/miners/${typeId}.png`}
          alt="mine"
          width={1000}
          height={1000}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-6 flex flex-col gap-2">
        <div className="text-[24px] text-center font-bold">
          {RepairKitNames[typeId]}
        </div>

        <div className="space-y-2 my-auto py-2">
          <div className="flex justify-between">
            <span>Price</span>
            <span>{minerInfo.price} $FROST</span>
          </div>
          <div className="flex justify-between">
            <span>Repair Rate</span>
            <span>{minerInfo.repairRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>Balance</span>
            <span>{balance}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mx-auto">
          <Button
            color="primary"
            isIconOnly
            disabled={count === "" || Number(count) === 1}
            onClick={() => setCount(Math.max(1, Number(count) - 1) + "")}
          >
            <Icon icon="ic:round-chevron-left" width={24} height={24} />
          </Button>
          <Input
            type="number"
            className="w-20 [&_input]:!text-center"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <Button
            color="primary"
            isIconOnly
            disabled={count === ""}
            onClick={() => setCount(Number(count) + 1 + "")}
          >
            <Icon icon="ic:round-chevron-right" width={24} height={24} />
          </Button>
        </div>
        <Button
          color="primary"
          className="mt-2"
          isLoading={btnLabel !== ""}
          onClick={handleMint}
          disabled={btnLabel !== "" || count === ""}
        >
          {btnLabel === "" ? "Mint Miner" : btnLabel}
        </Button>
      </div>
    </div>
  );
};

export default MinerPurchaseCard;
