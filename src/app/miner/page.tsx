"use client";

import { useState } from "react";
import { MinerTypeCount } from "@/config/constants";

import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import Image from "next/image";
import MinerPurchaseCard from "@/components/common/miner-purchase-card";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const MinerPage = () => {
  const [typeId, setTypeId] = useState(1);
  const [swiper, setSwiper] = useState<SwiperClass>();

  const minerBalances = useSelector(
    (state: RootState) => state.user.miners.balances
  );

  return (
    <div>
      <div>
        <div className="w-[330px] md:w-[640px] mx-auto">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={(s) => setTypeId(s.realIndex + 1)}
            onSwiper={(s) => setSwiper(s)}
            className="w-full"
          >
            {new Array(MinerTypeCount).fill(0).map((_, i) => (
              <SwiperSlide key={i}>
                <MinerPurchaseCard typeId={i + 1} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex items-center justify-center gap-4 mt-5">
          {new Array(MinerTypeCount).fill(0).map((_, i) => (
            <button
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-primary ${
                i === typeId - 1 ? "bg-primary" : ""
              }`}
              onClick={() => swiper?.slideTo(i)}
            ></button>
          ))}
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
