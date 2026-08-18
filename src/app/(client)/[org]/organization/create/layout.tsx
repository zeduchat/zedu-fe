"use client";

import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}
function Layout({ children }: LayoutProps) {
  return (
    <div className="w-full flex relative">
      <div className={`w-full lg:ml-[130px] mt-[80px] relative`}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
