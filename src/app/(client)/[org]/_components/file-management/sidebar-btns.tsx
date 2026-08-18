import React from "react";
import { LucideProps } from "lucide-react";
interface SideBarBtnsProps {
  icon:
    | React.ComponentType<React.SVGProps<SVGSVGElement>>
    | React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SideBarBtns = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SideBarBtnsProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 hover:bg-[#42429E] text-white rounded-md cursor-pointer py-3 px-3 transition-colors ${
        isActive ? "bg-[#42429E]" : ""
      }`}
    >
      <Icon className="size-4" />
      <span className="text-[15px]">{label}</span>
    </div>
  );
};

export default SideBarBtns;
