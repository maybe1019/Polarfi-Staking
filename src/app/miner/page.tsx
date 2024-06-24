"use client";

import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@nextui-org/react";
import useTokenAllowance from "@/hooks/useTokenAllowance";
import {
  ContractABIs,
  ContractAddresses,
  MineTypeCount,
} from "@/config/constants";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEther } from "viem";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import useMinerPrice from "@/hooks/useMinerPrice";
import useMinerBalanceOf from "@/hooks/useMinerBalanceOf";

const MinerPage = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [typeId, setTypeId] = useState(1);
  const [count, setCount] = useState("0");
  const [btnLabel, setBtnLabel] = useState("");

  const { balance: minerBalance, loadBalance: loadMinerBalance } =
    useMinerBalanceOf(address, typeId);
  const { price } = useMinerPrice(typeId);
  const { allowanceInNumber, loadAllowance } = useTokenAllowance(
    ContractAddresses.Frost,
    address,
    ContractAddresses.Miner
  );

  const handleMint = async () => {
    const cnt = Number(count);
    try {
      if (allowanceInNumber < price * cnt) {
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
          confirmations: 2,
          hash: txHash,
        });
        loadAllowance();
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
        confirmations: 2,
        hash,
      });
      loadMinerBalance();
    } catch (error: any) {
      console.error("handleMint", error?.message);
    }
    setBtnLabel("");
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <div className="w-[240px] h-[320px] rounded-[24px] bg-slate-900 flex items-center justify-center text-[64px] font-bold">
        ?
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold mb-5">Mint MINER</h1>
        <div>
          <div className="mb-2">TypeID</div>
          <div className="flex gap-3">
            {new Array(MineTypeCount).fill(0).map((_, ind) => (
              <Button
                key={ind}
                isIconOnly
                onClick={() => setTypeId(ind + 1)}
                variant={ind + 1 === typeId ? "solid" : "bordered"}
                color="primary"
              >
                {ind + 1}
              </Button>
            ))}
          </div>
        </div>
        <div>Price: {price} $FROST</div>
        {address && <div>Balance: {minerBalance}</div>}
        <div className="flex items-center gap-2">
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

export default MinerPage;
