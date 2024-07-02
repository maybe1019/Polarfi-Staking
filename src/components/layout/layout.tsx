import React, { PropsWithChildren } from "react";
import Header from "./header";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <Header />
      <main className="min-h-[calc(100vh-64px)] flex flex-col md:min-h-[calc(100vh-80px)] [&>div]:grow py-20 container mx-auto px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
