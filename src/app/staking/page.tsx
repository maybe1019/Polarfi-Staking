"use client";

import StakeModal from "@/components/common/stake-modal";
import { ContractABIs, ContractAddresses } from "@/config/constants";
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
import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";

const StakingPage = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [unstaking, setUnstaking] = useState(false);

  const { balance: mineBalance, loadBalance: loadMineBalance } =
    useMineBalanceOf(address);
  const { positions: stakePositions, loadPositions: loadStakePositions } =
    useStakePositionsOf(address);

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);

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
        confirmations: 1,
        hash,
      });

      setSelectedTokenIds([]);
      setTimeout(() => {
        loadMineBalance();
        loadStakePositions();
      }, 3000);
    } catch (error) {
      console.error("handleUnstake", error);
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
          {selectedTokenIds.length > 0 && (
            <div>
              <Button
                color="danger"
                onClick={handleUnstake}
                isLoading={unstaking}
              >
                {unstaking
                  ? "Unstaking..."
                  : `Unstake ${selectedTokenIds.length} NFT${
                      selectedTokenIds.length > 1 ? "s" : ""
                    }`}
              </Button>
            </div>
          )}
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
            </TableHeader>
            <TableBody>
              {stakePositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} aria-colspan={6}>
                    No Staked NFTs
                  </TableCell>
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
    </>
  );
};

export default StakingPage;
