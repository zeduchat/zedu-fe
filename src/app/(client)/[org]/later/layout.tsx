"use client";

import React from "react";
import GeneralNotificationConnection from "~/components/layout/centrifugo/general-notification-connection";
import LaterNav from "~/components/layout/sidebar/later-nav";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="w-full flex relative">
      {/* <GeneralNotificationConnection /> */}
      <LaterNav />

      <div className={`w-full lg:ml-[410px] mt-[60px] relative`}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
