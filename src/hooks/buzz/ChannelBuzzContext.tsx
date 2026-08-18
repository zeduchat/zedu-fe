import React, { createContext, useContext } from "react";
import { useChannelBuzz, UseBuzzOptions } from "./useChannelBuzz";

// Define the context type based on the return type of useChannelBuzz
export type ChannelBuzzContextType = ReturnType<typeof useChannelBuzz>;

const ChannelBuzzContext = createContext<ChannelBuzzContextType | undefined>(
  undefined
);

export const ChannelBuzzProvider: React.FC<{
  options?: UseBuzzOptions;
  children: React.ReactNode;
}> = ({ options, children }) => {
  const buzz = useChannelBuzz(options);
  return (
    <ChannelBuzzContext.Provider value={buzz}>
      {children}
    </ChannelBuzzContext.Provider>
  );
};

export function useChannelBuzzContext() {
  const ctx = useContext(ChannelBuzzContext);
  if (!ctx)
    throw new Error(
      "useChannelBuzzContext must be used within a ChannelBuzzProvider"
    );
  return ctx;
}
