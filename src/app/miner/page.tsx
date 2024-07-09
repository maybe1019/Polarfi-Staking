"use client";

import { Messages, MinerTypeCount } from "@/config/constants";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import Image from "next/image";
import {
  ContractABIs,
  ContractAddresses,
  RepairKitNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getFrostAllowance } from "@/lib/contracts/frost";
import { RootState, useAppDispatch } from "@/store";
import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { loadUserMinerBalancesThunk } from "@/store/reducers/userReducer";
import { Icon } from "@iconify/react/dist/iconify.js";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";
import { toast } from "react-toastify";

const MinerPage = () => {
  const [count, setCount] = useState("0");
  const [btnLabel, setBtnLabel] = useState("");
  const [typeId, setTypeId] = useState(1);

  const minerBalances = useSelector(
    (state: RootState) => state.user.miners.balances
  );
  const minerInfo = useSelector(
    (state: RootState) => state.app.minerInfo[typeId]
  );
  const balance = useSelector(
    (state: RootState) => state.user.miners.balances[typeId]
  );

  const { checkNetworkStatus } = useCheckNetworkStatus();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();

  const handleMint = async () => {
    const cnt = Number(count);
    if (!checkNetworkStatus()) {
      return;
    }

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
      toast.success(Messages.Success);
    } catch (error: any) {
      console.error("handleMint", error?.message);
      toast.error(Messages.TransactionRejected);
    }
    setBtnLabel("");
  };

  return (
    <div>
      <div>
        <div className="w-[330px] md:w-[640px] mx-auto">
          <div className="bg-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square p-6 grid grid-cols-2 gap-4">
              {new Array(MinerTypeCount).fill(0).map((_, id) => (
                <div
                  className={`aspect-square flex items-center justify-center border-2 cursor-pointer transition-all rounded-xl ${
                    id === typeId - 1
                      ? "border-primary bg-primary/20"
                      : "border-transparent"
                  }`}
                  key={id}
                  onClick={() => setTypeId(id + 1)}
                >
                  <Image
                    src={`/imgs/miners/${id + 1}.png`}
                    alt="miner"
                    width={1000}
                    height={1000}
                    className="w-[96px] h-auto"
                  />
                </div>
              ))}
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
        </div>
      </div>

      <div className="mt-10 max-w-screen-sm mx-auto">
        <Table
          aria-label="Example table with dynamic content"
          classNames={{ wrapper: "bg-gray-900", th: "bg-gray-950" }}
        >
          <TableHeader>
            <TableColumn>Token Id</TableColumn>
            <TableColumn>Balance</TableColumn>
          </TableHeader>
          <TableBody>
            {minerBalances.slice(1, MinerTypeCount + 1).map((balance, ind) => (
              <TableRow key={ind}>
                <TableCell>#{ind + 1}</TableCell>
                <TableCell>{balance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MinerPage;
