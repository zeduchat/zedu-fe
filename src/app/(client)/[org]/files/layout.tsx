import React from "react";
import GeneralNotificationConnection from "~/components/layout/centrifugo/general-notification-connection";
import FilesNav from "~/components/layout/sidebar/files-nav";
const FilesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex relative">
      {/* <GeneralNotificationConnection /> */}
      <FilesNav />
      <div className="w-full lg:ml-[355px] mt-[60px] relative">{children}</div>
    </div>
  );
};

export default FilesLayout;
