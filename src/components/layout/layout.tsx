import React, { PropsWithChildren } from "react";
import Header from "./header";

import BannerImage from "@/assets/images/banner.png";
import Image from "next/image";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative">
      <Image src={BannerImage} alt="banner" className="absolute w-full top-0 left-0 h-auto" />
      <Header />
      <main className="min-h-[calc(100vh-64px)] flex flex-col md:min-h-[calc(100vh-80px)] [&>div]:grow py-20 container mx-auto px-4 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
