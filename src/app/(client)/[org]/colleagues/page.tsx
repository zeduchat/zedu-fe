import Image from "next/image";
import React from "react";

const Agents = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center">
      <Image
        src="/image/empty-agent.svg"
        width={100}
        height={100}
        className="size-20 lg:size-30"
        alt=""
        unoptimized
      />
      {/* <h2 className="font-bold text-2xl text-blue-500">Recent Messages</h2> */}
    </div>
  );
};
export default Agents;
