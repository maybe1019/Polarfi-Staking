"use client";

import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@nextui-org/react";
import useTokenAllowance from "@/hooks/useTokenAllowance";
import {
  ContractABIs,
  ContractAddresses,
  MinerTypeCount,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEther } from "viem";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { loadUserMinerBalancesThunk } from "@/store/reducers/userReducer";
import {
  Checkbox,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import Image from "next/image";

const MinerPage = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();

  const minerBalances = useSelector(
    (state: RootState) => state.user.miners.balances
  );
  const minerInfo = useSelector((state: RootState) => state.app.minerInfo);

  const [typeId, setTypeId] = useState(1);
  const [count, setCount] = useState("0");
  const [btnLabel, setBtnLabel] = useState("");

  const { allowanceInNumber, loadAllowance } = useTokenAllowance(
    ContractAddresses.Frost,
    address,
    ContractAddresses.Miner
  );

  const handleMint = async () => {
    const cnt = Number(count);
    try {
      if (allowanceInNumber < minerInfo[typeId].price * cnt) {
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
    <div>
      <div className="flex items-center justify-center gap-10">
        <div className="w-[240px] flex items-center justify-center">
          <Image
            src={`/imgs/miners/${typeId}.png`}
            alt="mine"
            width={62}
            height={63}
            className="w-full h-auto"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold mb-5">Mint MINER</h1>
          <div>
            <div className="mb-2">TypeID</div>
            <div className="flex gap-3">
              {new Array(MinerTypeCount).fill(0).map((_, ind) => (
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
          <div>Price: {minerInfo[typeId].price} $FROST</div>
          <div>Repair Rate: {minerInfo[typeId].repairRate} %</div>
          {address && <div>Balance: {minerBalances[typeId]}</div>}
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
