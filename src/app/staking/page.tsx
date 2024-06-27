"use client";

import StakeModal from "@/components/common/stake-modal";
import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import useMineBalanceOf from "@/hooks/useMineBalanceOf";
import useStakePositionsOf from "@/hooks/useStakePositionsOf";
import { formatDate } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { getClaimableRewards } from "@/hooks/useClaimableRewards";
import { IStakeReward } from "@/types";
import RewardModal from "@/components/common/reward-modal";

const StakingPage = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [rewards, setRewards] = useState<IStakeReward[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);

  const { balance: mineBalance, loadBalance: loadMineBalance } =
    useMineBalanceOf(address);
  const { positions: stakePositions, loadPositions: loadStakePositions } =
    useStakePositionsOf(address);

  const loadRewards = useCallback(async () => {
    setRewards(await getClaimableRewards(stakePositions.map((p) => p.tokenId)));
  }, [stakePositions]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const handleUnstake = async () => {
    setUnstaking(true);

    try {
      const hash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "unstakeNFT",
        args: [selectedTokenIds],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash,
      });

      setSelectedTokenIds([]);
      setTimeout(() => {
        loadMineBalance();
        loadStakePositions();
      }, 3000);
    } catch (error: any) {
      console.error(
        "handleUnstake",
        Object.keys(error).map((key) => error[key])
      );
    }

    setUnstaking(false);
  };

  return (
    <>
      <div className="py-20 container mx-auto px-4">
        <div className="flex items-center gap-5 mb-5">
          <span>MINE Balance: {mineBalance}</span>
          {mineBalance > 0 && (
            <Button color="primary" onClick={() => setStakeModalOpen(true)}>
              Stake
            </Button>
          )}
        </div>

        <div className="mb-2 h-10 flex items-center justify-between">
          <span>Total Staked: {stakePositions.length} NFTs</span>
          <div className="flex gap-3">
            <Button
              color="primary"
              isDisabled={selectedTokenIds.length === 0}
              onClick={() => setClaimModalOpen(true)}
            >
              Claim
            </Button>
            <Button
              color="danger"
              onClick={handleUnstake}
              isLoading={unstaking}
              isDisabled={selectedTokenIds.length === 0}
            >
              {unstaking ? "Unstaking..." : `Unstake`}
            </Button>
          </div>
        </div>
        <div>
          <Table
            aria-label="Example table with dynamic content"
            classNames={{ wrapper: "bg-gray-900", th: "bg-gray-950" }}
          >
            <TableHeader>
              <TableColumn width={40}>
                <Checkbox
                  isSelected={
                    selectedTokenIds.length > 0 &&
                    selectedTokenIds.length === stakePositions.length
                  }
                  isIndeterminate={
                    selectedTokenIds.length > 0 &&
                    selectedTokenIds.length !== stakePositions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTokenIds(stakePositions.map((p) => p.tokenId));
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
              <TableColumn>Claimable Reward</TableColumn>
              <TableColumn>LPR</TableColumn>
            </TableHeader>
            <TableBody>
              {stakePositions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    aria-colspan={6}
                    className="text-center py-20 text-stone-400"
                  >
                    No Staked NFTs
                  </TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                  <TableCell className="hidden">d</TableCell>
                </TableRow>
              ) : (
                stakePositions.map((position, ind) => (
                  <TableRow key={ind}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedTokenIds.includes(position.tokenId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTokenIds((prev) => [
                              ...prev,
                              position.tokenId,
                            ]);
                          } else {
                            setSelectedTokenIds((prev) =>
                              prev.filter((t) => t !== position.tokenId)
                            );
                          }
                        }}
                      ></Checkbox>
                    </TableCell>
                    <TableCell>#{position.tokenId}</TableCell>
                    <TableCell>{position.nftType}</TableCell>
                    <TableCell>{position.buyPrice}</TableCell>
                    <TableCell>
                      {formatDate(new Date(position.stakedTimestamp)).date}{" "}
                      {formatDate(new Date(position.stakedTimestamp)).time}
                    </TableCell>
                    <TableCell>
                      {
                        formatDate(new Date(position.latestClaimedTimestamp))
                          .date
                      }{" "}
                      {
                        formatDate(new Date(position.latestClaimedTimestamp))
                          .time
                      }
                    </TableCell>
                    <TableCell>{position.claimedRewards}</TableCell>
                    <TableCell>
                      {rewards
                        .find((r) => r.tokenId === position.tokenId)
                        ?.reward.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {
                        rewards.find((r) => r.tokenId === position.tokenId)
                          ?.currentLPR
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <StakeModal
        open={stakeModalOpen}
        setOpen={setStakeModalOpen}
        onStakeCompleted={() => {
          loadMineBalance();
          loadStakePositions();
        }}
      />
      <RewardModal
        open={claimModalOpen}
        setOpen={setClaimModalOpen}
        onStakeCompleted={() => {
          loadRewards();
          loadStakePositions();
        }}
        rewards={(() => {
          const res: IStakeReward[] = [];
          for (const tokenId of selectedTokenIds) {
            const r = rewards.find((rw) => rw.tokenId === tokenId);
            if (r) {
              res.push(r);
            }
          }
          return res;
        })()}
      />
    </>
  );
};

export default StakingPage;
