"use client";

import React, { useContext } from "react";
import NotificationNav from "~/components/layout/sidebar/notification-nav";
import { DataContext } from "~/store/GlobalState";
// import UseHomeChannel from "../home/channels/hooks/home-channels";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { state } = useContext(DataContext);

  if (state?.channelLoading) return null;

  //

  return (
    <div className="w-full flex relative">
      <NotificationNav />
      {/* <UseHomeChannel /> */}

      <div className="relative mt-[60px] w-full min-w-0 lg:ml-[435px]">
        {children}
      </div>
    </div>
  );
}

export default Layout;
