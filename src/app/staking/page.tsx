"use client";

import {
  ContractABIs,
  ContractAddresses,
  Messages,
  MineNames,
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
import { useAppDispatch } from "@/store";
import {
  loadUserMinerBalancesThunk,
  loadUserMinesThunk,
} from "@/store/reducers/userReducer";
import RepairModal from "@/components/common/repair-modal";
import Image from "next/image";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";
import { toast } from "react-toastify";

const StakingPage = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();
  const { checkNetworkStatus } = useCheckNetworkStatus();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [rewards, setRewards] = useState<IStakeReward[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);

  const [repairTokenId, setRepairTokenId] = useState(-1);

  const { positions: stakePositions, loadPositions: loadStakePositions } =
    useStakePositionsOf(address);

  const loadRewards = useCallback(async () => {
    setRewards(await getClaimableRewards(stakePositions.map((p) => p.tokenId)));
  }, [stakePositions]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const handleUnstake = async () => {
    if (!checkNetworkStatus()) {
      return;
    }

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

      dispatch(loadUserMinesThunk({ address, tokenIds: selectedTokenIds }));
      setSelectedTokenIds([]);
      setTimeout(() => {
        loadStakePositions();
      }, 3000);
      toast.success(Messages.Success);
    } catch (error: any) {
      console.error(
        "handleUnstake",
        Object.keys(error).map((key) => error[key])
      );
      toast.error(Messages.TransactionRejected);
    }

    setUnstaking(false);
  };

  return (
    <>
      <div>
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
              <TableColumn>Name</TableColumn>
              <TableColumn>Token Id</TableColumn>
              <TableColumn>Buy Price</TableColumn>
              <TableColumn>Staked At</TableColumn>
              <TableColumn>Last Claim</TableColumn>
              <TableColumn>Claimed Reward</TableColumn>
              <TableColumn>Claimable Reward</TableColumn>
              <TableColumn>LPR</TableColumn>
              <TableColumn className="w-32"> </TableColumn>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/imgs/mines/${position.nftType}.png`}
                          alt="mine"
                          width={1000}
                          height={1000}
                          className="w-10 h-10 rounded-md"
                        />
                        <span>{MineNames[position.nftType]}</span>
                      </div>
                    </TableCell>
                    <TableCell>#{position.tokenId}</TableCell>
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
                    <TableCell>
                      {(() => {
                        const lpr = rewards.find(
                          (r) => r.tokenId === position.tokenId
                        )?.currentLPR;
                        if (lpr !== undefined && lpr < 100) {
                          return (
                            <Button
                              color="primary"
                              className="h-8"
                              onClick={() => setRepairTokenId(position.tokenId)}
                            >
                              Claim & Repair
                            </Button>
                          );
                        }
                        return <></>;
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
      {repairTokenId !== -1 && (
        <RepairModal
          open={repairTokenId !== -1}
          onClose={() => setRepairTokenId(-1)}
          mine={stakePositions.find((s) => s.tokenId === repairTokenId)}
          lpr={rewards.find((r) => r.tokenId === repairTokenId)?.currentLPR}
          onRepairCompleted={() => {
            loadRewards();
            loadStakePositions();
            dispatch(
              loadUserMinerBalancesThunk({ address, tokenIds: [repairTokenId] })
            );
            setRepairTokenId(-1);
          }}
        />
      )}
    </>
  );
};

export default StakingPage;
