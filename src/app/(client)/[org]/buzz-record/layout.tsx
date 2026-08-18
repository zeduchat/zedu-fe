"use client";

import React, { Suspense, useEffect, useState } from "react";
import { RecorderRouteBootstrap } from "./_components/recorder-route-bootstrap";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLargeScreen = windowWidth >= 1024;

  return (
    <Suspense fallback={null}>
      <RecorderRouteBootstrap>
        <div className="w-full flex relative">
          <div
            className="w-full mt-[60px] relative"
            style={{ marginLeft: isLargeScreen ? "85px" : 0 }}
          >
            {children}
          </div>
        </div>
      </RecorderRouteBootstrap>
    </Suspense>
  );
}

export default Layout;
