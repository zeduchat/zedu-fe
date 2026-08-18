import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";

interface AgentLinkProps {
  agent: {
    name: string;
    role: string;
    bgColor: string;
    imageVariant: string;
  };
}

const AgentLink = ({ agent }: AgentLinkProps) => {
  const { name, role, bgColor, imageVariant } = agent;
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  return (
    <Link
      href={`/${orgSlug}/agents/${name.toLowerCase()}`}
      className="w-[276px] flex items-center gap-1.5 py-1.5 px-2 rounded-md text-[#BABAFB] cursor-pointer transition-all duration-300 hover:bg-[#5F5FE1] hover:text-white"
    >
      <div
        className="relative w-5 h-5 flex items-center justify-center border border-[#E6EAEF] rounded-sm"
        style={{ backgroundColor: bgColor }}
      >
        <Image
          src={`/bot-${imageVariant}.svg`}
          alt="Lime Bot"
          width={20}
          height={20}
        />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#6DC347] border border-white rounded-full" />
      </div>
      <h3 className="text-[15px] font-normal">
        {name} - {role}
      </h3>
    </Link>
  );
};

export default AgentLink;
