"use client";

import { useState } from "react";
import { MineTypeCount } from "@/config/constants";
import UserNFTs from "@/components/common/user-nfts";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import MinePurchaseCard from "@/components/common/mine-purchase-card";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

export default function Home() {
  const [typeId, setTypeId] = useState(1);
  const [swiper, setSwiper] = useState<SwiperClass>();

  return (
    <div className="space-y-16 w-full max-w-screen-lg mx-auto">
      <div>
        <div className="w-full mx-auto relative">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={(s) => setTypeId(s.realIndex + 1)}
            onSwiper={(s) => setSwiper(s)}
            className="w-full"
          >
            {new Array(MineTypeCount).fill(0).map((_, i) => (
              <SwiperSlide key={i}>
                <MinePurchaseCard typeId={i + 1} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex items-center gap-3 absolute top-3 right-3 z-10">
            <Button
              className="rounded-full w-8 h-8 p-0 min-w-0"
              isIconOnly
              color={typeId !== 1 ? "primary" : "default"}
              onClick={() => swiper?.slidePrev()}
            >
              <Icon icon="ic:round-chevron-left" width={24} height={24} />
            </Button>
            <Button
              className="rounded-full w-8 h-8 p-0 min-w-0"
              isIconOnly
              color={typeId !== MineTypeCount ? "primary" : "default"}
              onClick={() => swiper?.slideNext()}
            >
              <Icon icon="ic:round-chevron-right" width={24} height={24} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-5">
          {new Array(MineTypeCount).fill(0).map((_, i) => (
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
      <UserNFTs />
    </div>
  );
}
