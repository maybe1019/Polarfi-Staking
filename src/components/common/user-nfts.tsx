import {
  ContractABIs,
  ContractAddresses,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getMineAllowance } from "@/lib/contracts/mine";
import { formatDate } from "@/lib/utils";
import { RootState } from "@/store";
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

const UserNFTs = () => {
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
    } catch (error) {
      console.error("handleStake", error);
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
          <TableColumn>Token Id</TableColumn>
          <TableColumn>Type Id</TableColumn>
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
            userMines.data.map((mine, ind) => (
              <TableRow key={ind}>
                <TableCell>
                  <Checkbox
                    isSelected={selectedTokenIds.includes(mine.tokenId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTokenIds((prev) => [...prev, mine.tokenId]);
                      } else {
                        setSelectedTokenIds((prev) =>
                          prev.filter((t) => t !== mine.tokenId)
                        );
                      }
                    }}
                  ></Checkbox>
                </TableCell>
                <TableCell>#{mine.tokenId}</TableCell>
                <TableCell>{mine.nftType}</TableCell>
                <TableCell>{mine.buyPrice}</TableCell>
                <TableCell>
                  {mine.stakedTimestamp === 0
                    ? "-"
                    : `${formatDate(new Date(mine.stakedTimestamp)).date} ${
                        formatDate(new Date(mine.stakedTimestamp)).time
                      }`}
                </TableCell>
                <TableCell>
                  {mine.claimedRewards === 0
                    ? "-"
                    : `${
                        formatDate(new Date(mine.latestClaimedTimestamp)).date
                      } ${
                        formatDate(new Date(mine.latestClaimedTimestamp)).time
                      }`}
                </TableCell>
                <TableCell>{mine.claimedRewards}</TableCell>
                <TableCell
                  className={
                    mine.latestLpr === 0
                      ? "text-danger"
                      : mine.latestLpr < 80
                      ? "text-primary"
                      : "text-success"
                  }
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
