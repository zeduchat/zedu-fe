import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
  side?: "bottom" | "top" | "right" | "left";
}

const Tooltips = ({ text, children, side = "top" }: TooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent
        side={side}
        className="bg-black text-white p-2 rounded-md text-sm"
      >
        <TooltipArrow className="fill-black" />

        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export default Tooltips;
