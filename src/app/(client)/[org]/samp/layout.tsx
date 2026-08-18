"use client";

import React from "react";
import GeneralNotificationConnection from "~/components/layout/centrifugo/general-notification-connection";

interface LayoutProps {
  children: React.ReactNode;
}
function Layout({ children }: LayoutProps) {
  //

  return (
    <div className="w-full flex relative">
      {/* <GeneralNotificationConnection /> */}

      <div className={`w-full ml-[145px] mt-[60px] relative p-10`}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
