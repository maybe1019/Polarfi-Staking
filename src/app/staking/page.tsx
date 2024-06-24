"use client";

import StakeModal from "@/components/common/stake-modal";
import useMineBalanceOf from "@/hooks/useMineBalanceOf";
import useStakePositionsOf from "@/hooks/useStakePositionsOf";
import { formatDate } from "@/lib/utils";
import { IStakePosition } from "@/types";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

const StakingPage = () => {
  const { address } = useAccount();

  const [stakeModalOpen, setStakeModalOpen] = useState(false);

  const { balance: mineBalance, loadBalance: loadMineBalance } =
    useMineBalanceOf(address);
  const { positions: stakePositions } = useStakePositionsOf(address);

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

        <div className="mb-2">Total Staked: {stakePositions.length} NFTs</div>
        <div>
          <Table
            aria-label="Example table with dynamic content"
            classNames={{ wrapper: "bg-gray-900", th: "bg-gray-950" }}
          >
            <TableHeader>
              <TableColumn>Token Id</TableColumn>
              <TableColumn>Type Id</TableColumn>
              <TableColumn>Buy Price</TableColumn>
              <TableColumn>Staked At</TableColumn>
              <TableColumn>Last Claim</TableColumn>
              <TableColumn>Claimed Reward</TableColumn>
            </TableHeader>
            <TableBody>
              {stakePositions.map((position, ind) => (
                <TableRow key={ind}>
                  <TableCell>#{position.tokenId}</TableCell>
                  <TableCell>{position.nftType}</TableCell>
                  <TableCell>{position.buyPrice}</TableCell>
                  <TableCell>
                    {formatDate(new Date(position.stakedTimestamp)).date}{" "}
                    {formatDate(new Date(position.stakedTimestamp)).time}
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(position.latestClaimedTimestamp)).date}{" "}
                    {formatDate(new Date(position.latestClaimedTimestamp)).time}
                  </TableCell>
                  <TableCell>{position.claimedRewards}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <StakeModal
        open={stakeModalOpen}
        setOpen={setStakeModalOpen}
        onStakeCompleted={loadMineBalance}
      />
    </>
  );
};

export default StakingPage;
