"use client";

import { BuzzList } from "../_components/buzzs/buzz-list";

const BuzzsPage = () => {
  return (
    <div className="relative flex h-[calc(100dvh-70px)] w-full overflow-hidden bg-white">
      <BuzzList />
    </div>
  );
};

export default BuzzsPage;
