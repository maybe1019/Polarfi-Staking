"use client";

import { useState } from "react";
import { MineTypeCount } from "@/config/constants";
import UserNFTs from "@/components/common/user-nfts";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import MinePurchaseCard from "@/components/common/mine-purchase-card";

export default function Home() {
  const [typeId, setTypeId] = useState(1);
  const [swiper, setSwiper] = useState<SwiperClass>();

  return (
    <div className="space-y-16">
      <div>
        <div className="w-[330px] md:w-[640px] mx-auto">
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
