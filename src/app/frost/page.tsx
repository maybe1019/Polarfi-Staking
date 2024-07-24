"use client";

import { getFrostStakingPools } from "@/lib/contracts/frost-staking";
import { RootState, useAppDispatch } from "@/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAccount, useWriteContract } from "wagmi";
import FrostStakingPool from "@/components/common/frost-staking-pool";
import { loadFrostStakingUserLocksThunk } from "@/store/reducers/userReducer";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import FrostStakingPoolCard from "@/components/common/frost-staking-pool-card";
import { IStakingPool } from "@/types";
import { getFrostAllowance } from "@/lib/contracts/frost";
import {
  ContractABIs,
  ContractAddresses,
  Messages,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { parseEther } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { toast } from "react-toastify";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

const FrostStakingPage = () => {
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();
  const pools = useSelector((state: RootState) => state.app.frostStakingPools);
  const userLocks = useSelector(
    (state: RootState) => state.user.userLocks.data
  );
  const { address } = useAccount();

  const [swiper, setSwiper] = useState<SwiperClass>();

  useEffect(() => {
    getFrostStakingPools();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch(
        loadFrostStakingUserLocksThunk({
          address,
          poolAddresses: pools.map((p) => p.poolAddress),
        })
      );
    });

    return () => clearTimeout(timerId);
  }, [address, dispatch, pools]);

  const handleLock = async (pool: IStakingPool) => {
    if (!address) return;
    try {
      const allowance = await getFrostAllowance(address, pool.poolAddress);
      if (allowance < pool.lockAmount) {
        const txHash = await writeContractAsync({
          abi: ContractABIs.Frost,
          address: ContractAddresses.Frost,
          functionName: "approve",
          args: [
            pool.poolAddress,
            parseEther(Number.MAX_SAFE_INTEGER.toString()),
          ],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
      }

      const hash = await writeContractAsync({
        abi: ContractABIs.FrostStakingPool,
        address: pool.poolAddress,
        functionName: "lock",
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: hash,
      });
      toast.success(Messages.Success);
      dispatch(
        loadFrostStakingUserLocksThunk({
          address,
          poolAddresses: pools.map((p) => p.poolAddress),
        })
      );
    } catch (error) {
      console.error(error);
      toast.error(Messages.TransactionRejected);
    }
  };

  const handleUnlock = async (pool: IStakingPool, force: boolean) => {
    if (!address) return;
    try {
      const hash = await writeContractAsync({
        abi: ContractABIs.FrostStakingPool,
        address: pool.poolAddress,
        functionName: force ? "forceUnlock" : "unlock",
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: hash,
      });
      toast.success(Messages.Success);
      dispatch(
        loadFrostStakingUserLocksThunk({
          address,
          poolAddresses: pools.map((p) => p.poolAddress),
        })
      );
    } catch (error) {
      console.error(error);
      toast.error(Messages.TransactionRejected);
    }
  };

  const handleClaim = async (pool: IStakingPool) => {
    if (!address) return;
    try {
      const hash = await writeContractAsync({
        abi: ContractABIs.FrostStakingPool,
        address: pool.poolAddress,
        functionName: "claim",
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: hash,
      });
      toast.success(Messages.Success);
      dispatch(
        loadFrostStakingUserLocksThunk({
          address,
          poolAddresses: pools.map((p) => p.poolAddress),
        })
      );
    } catch (error) {
      console.error(error);
      toast.error(Messages.TransactionRejected);
    }
  };

  return (
    <div>
      <div className="w-full mb-5 relative">
        <Swiper onSwiper={(s) => setSwiper(s)}>
          {pools.map((pool, index) => (
            <SwiperSlide key={index}>
              <FrostStakingPoolCard
                pool={pool}
                userLock={userLocks[index]}
                onClaim={() => handleClaim(pool)}
                onLock={() => handleLock(pool)}
                onUnlock={(force: boolean) => handleUnlock(pool, force)}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex items-center gap-3 absolute top-3 right-3 z-10">
          <Button
            className="rounded-full w-8 h-8 p-0 min-w-0"
            isIconOnly
            color={"primary"}
            onClick={() => swiper?.slidePrev()}
          >
            <Icon icon="ic:round-chevron-left" width={24} height={24} />
          </Button>
          <Button
            className="rounded-full w-8 h-8 p-0 min-w-0"
            isIconOnly
            color={"primary"}
            onClick={() => swiper?.slideNext()}
          >
            <Icon icon="ic:round-chevron-right" width={24} height={24} />
          </Button>
        </div>
      </div>
      <div className="bg-[#131823] rounded-xl px-4 text-[18px]">
        <table className="w-full">
          <thead>
            <tr className="text-left [&>th]:py-4">
              <th>Name</th>
              <th>Lock Amount</th>
              <th>Lock Period</th>
              <th>Reward</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {userLocks.filter((u) => u.isActive).length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-20 text-stone-400">
                  No Locks
                </td>
              </tr>
            ) : (
              userLocks.map((userLock, ind) => {
                if (userLock.isActive)
                  return (
                    <FrostStakingPool
                      key={ind}
                      pool={pools[ind]}
                      userLock={userLocks[ind]}
                      onClaim={() => handleClaim(pools[ind])}
                      onLock={() => handleLock(pools[ind])}
                      onUnlock={(force: boolean) =>
                        handleUnlock(pools[ind], force)
                      }
                    />
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrostStakingPage;
