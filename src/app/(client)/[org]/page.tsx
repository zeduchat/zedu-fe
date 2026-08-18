"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ChannelNav from "~/components/layout/sidebar/Nav";

const People = () => {
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const resizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const minWidth = 250;
    const maxWidth = 550;
    let startX = 0;
    let startWidth = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = "auto";
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startX = e.clientX;
      if (sidebarRef.current) {
        startWidth = sidebarRef.current.offsetWidth;
      }
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ew-resize";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLargeScreen = windowWidth >= 1024;

  return (
    <>
      <ChannelNav
        resizerRef={resizerRef}
        sidebarWidth={sidebarWidth}
        sidebarRef={sidebarRef}
      />

      <div
        className={`mt-[60px] relative`}
        style={{ marginLeft: isLargeScreen ? `${sidebarWidth + 85}px` : 0 }}
      >
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <Image
            src="/image/empty-message.svg"
            width={100}
            height={100}
            className="size-20 lg:size-30"
            alt=""
            unoptimized
          />
          <h2 className="font-bold text-xl text-blue-500">Select a channel</h2>
        </div>
      </div>
    </>
  );
};
export default People;
