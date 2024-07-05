import {
  ContractABIs,
  ContractAddresses,
  MineNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getMineAllowance } from "@/lib/contracts/mine";
import { formatDate } from "@/lib/utils";
import { RootState, useAppDispatch } from "@/store";
import { LoadingStatus } from "@/types/enums";
import {
  Button,
  Checkbox,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { removeNFTs } from "@/store/reducers/userReducer";
import Image from "next/image";

const UserNFTs = () => {
  const dispatch = useAppDispatch();
  const userMines = useSelector((state: RootState) => state.user.mines);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState("");
  const handleStake = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const allowance = await getMineAllowance(
        address,
        ContractAddresses.Staking
      );
      if (!allowance) {
        setBtnLabel("Approving...");
        const txHash = await writeContractAsync({
          abi: ContractABIs.Mine,
          address: ContractAddresses.Mine,
          functionName: "setApprovalForAll",
          args: [ContractAddresses.Staking, true],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
      }

      setBtnLabel("Staking...");
      const txHash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "stakeNFT",
        args: [selectedTokenIds],
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: txHash,
      });

      dispatch(removeNFTs(selectedTokenIds));
      setSelectedTokenIds([]);
    } catch (error: any) {
      console.error(
        "handleStake",
        Object.keys(error).map((key) => error[key])
      );
    }
    setLoading(false);
    setBtnLabel("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Total: {userMines.data.length}</span>

        <div>
          <Button
            color="primary"
            onClick={handleStake}
            isLoading={loading}
            disabled={selectedTokenIds.length === 0 || loading}
            className="w-28 px-0 text-center"
          >
            {loading ? btnLabel : "Stake"}
          </Button>
        </div>
      </div>

      <Table
        aria-label="Example table with dynamic content"
        classNames={{ wrapper: "bg-gray-900", th: "bg-gray-950" }}
        selectedKeys={selectedTokenIds}
      >
        <TableHeader>
          <TableColumn width={40}>
            <Checkbox
              isSelected={
                selectedTokenIds.length > 0 &&
                selectedTokenIds.length === userMines.data.length
              }
              isIndeterminate={
                selectedTokenIds.length > 0 &&
                selectedTokenIds.length !== userMines.data.length
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTokenIds(userMines.data.map((p) => p.tokenId));
                } else {
                  setSelectedTokenIds([]);
                }
              }}
            ></Checkbox>
          </TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Token Id</TableColumn>
          <TableColumn>Buy Price</TableColumn>
          <TableColumn>Staked At</TableColumn>
          <TableColumn>Last Claim</TableColumn>
          <TableColumn>Claimed Reward</TableColumn>
          <TableColumn>Latest LPR</TableColumn>
        </TableHeader>
        <TableBody>
          {userMines.data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                aria-colspan={6}
                className="text-center py-20 text-stone-400"
              >
                {userMines.status !== LoadingStatus.Fulfilled ? (
                  <Spinner />
                ) : (
                  "No MINE NFTs"
                )}
              </TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
              <TableCell className="hidden">d</TableCell>
            </TableRow>
          ) : (
            userMines.data
              .map((a) => a)
              .sort((a, b) => a.tokenId - b.tokenId)
              .map((mine, ind) => (
                <TableRow
                  key={mine.tokenId}
                  className={`group [&>td]:transition-all cursor-pointer ${
                    selectedTokenIds.includes(mine.tokenId)
                      ? "[&>td]:bg-primary/20"
                      : ""
                  }`}
                  onClick={() => {
                    if (selectedTokenIds.includes(mine.tokenId)) {
                      setSelectedTokenIds((prev) =>
                        prev.filter((t) => t !== mine.tokenId)
                      );
                    } else {
                      setSelectedTokenIds((prev) => [...prev, mine.tokenId]);
                    }
                  }}
                >
                  <TableCell className="rounded-l-md group-hover:bg-primary/10">
                    <Checkbox
                      isSelected={selectedTokenIds.includes(mine.tokenId)}
                      onChange={(e) => {}}
                    ></Checkbox>
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    <div className="flex items-center gap-2">
                      <Image
                        src={`/imgs/mines/${mine.nftType}.png`}
                        alt="mine"
                        width={1000}
                        height={1000}
                        className="w-10 h-10 rounded-md"
                      />
                      <span>{MineNames[mine.nftType]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    #{mine.tokenId}
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    {mine.buyPrice}
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    {mine.stakedTimestamp === 0
                      ? "-"
                      : `${formatDate(new Date(mine.stakedTimestamp)).date} ${
                          formatDate(new Date(mine.stakedTimestamp)).time
                        }`}
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    {mine.claimedRewards === 0
                      ? "-"
                      : `${
                          formatDate(new Date(mine.latestClaimedTimestamp)).date
                        } ${
                          formatDate(new Date(mine.latestClaimedTimestamp)).time
                        }`}
                  </TableCell>
                  <TableCell className="group-hover:bg-primary/10">
                    {mine.claimedRewards}
                  </TableCell>
                  <TableCell
                    className={`group-hover:bg-primary/10 rounded-r-md ${
                      mine.latestLpr === 0
                        ? "text-danger"
                        : mine.latestLpr < 80
                        ? "text-primary"
                        : "text-success"
                    }`}
                  >
                    {mine.latestLpr / 100}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserNFTs;
