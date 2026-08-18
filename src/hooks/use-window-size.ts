"use client";

import { useState, useEffect } from "react";
import useIsMounted from "./use-is-mounted";

function useWindowSize() {
  const isMounted = useIsMounted();
  const [size, setSize] = useState(
    isMounted.current
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : {}
  );

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    if (isMounted.current) {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, [isMounted]);

  return size;
}

export default useWindowSize;
