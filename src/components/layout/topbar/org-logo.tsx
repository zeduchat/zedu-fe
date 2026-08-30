import { PinIcon } from "~/svgs/index";
import Image from "next/image";
import { Pin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getInitials } from "~/utils/utils";
import { useMemo } from "react";

const getRandomBgColor = (name?: string) => {
  const bgColors = [
    "#f87171",
    "#fb923c",
    "#facc15",
    "#34d399",
    "#38bdf8",
    "#a78bfa",
    "#f472b6",
  ];
  const color = localStorage.getItem(`org-logo-bg-${name}`);
  if (color) {
    return color;
  }
  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  localStorage.setItem(`org-logo-bg-${name}`, randomColor);
  return randomColor;
};

export const OrgLogo = ({
  logo_url,
  name,
  showNotification = false,
  notificationCount = 0,
  onClick,
}: {
  logo_url?: string;
  name?: string;
  onClick?: () => void;

  showNotification?: boolean;
  notificationCount?: number;
}) => {
  const initialsBg = useMemo(() => getRandomBgColor(name), [name]);

  return (
    <div
      className={
        "size-full flex items-center justify-center relative rounded-sm" +
        (onClick ? " cursor-pointer" : "")
      }
      onClick={onClick}
    >
      {showNotification && notificationCount > 0 && (
        <div className="border-white border-[1.5px] text-white text-[0.5rem] size-[18px] font-semibold rounded-full absolute -right-[6px] bg-red-500 z-10 -top-[6px] flex justify-center items-center">
          {notificationCount > 10 ? "9+" : notificationCount}
        </div>
      )}
      {logo_url ? (
        <Image
          src={logo_url ?? ""}
          alt=""
          width={20}
          height={20}
          className="size-full object-center"
        />
      ) : (
        <h3
          className="text-white font-bold text-sm size-full flex items-center justify-center rounded-sm"
          style={{ backgroundColor: initialsBg }}
        >
          {getInitials(name ?? "")}
        </h3>
      )}
    </div>
  );
};

export const OrgList = ({
  logo_url,
  name,
  notificationCount = 0,
  pinned = false,
  onClick,
  onPin,
}: {
  logo_url?: string;
  name?: string;
  showNotification?: boolean;
  notificationCount?: number;
  pinned?: boolean;
  onClick?: () => void;
  onPin?: () => void;
}) => {
  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer justify-between hover:bg-gray-300 dark:hover:bg-[#2C2D30] rounded-sm px-1 py-1 transition-all duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className=" flex items-center gap-2">
          <div className="w-[23px] h-[23px] bg-[#2e8dff] rounded-sm ">
            <OrgLogo
              name={name}
              logo_url={logo_url}
              showNotification={true}
              notificationCount={notificationCount}
            />
          </div>
          <p className="text-black dark:text-zinc-100 text-sm">{name ?? ""}</p>
        </div>
        <Button
          size={"sm"}
          variant={"ghost"}
          onClick={(e) => {
            e.stopPropagation();
            onPin?.();
          }}
          className="rounded-sm p-2 hover:bg-gray-200 dark:hover:bg-white/10 z-10"
        >
          {pinned ? (
            <PinIcon />
          ) : (
            <Pin size={16} fontWeight={3} className="text-gray-500" />
          )}
        </Button>
      </div>
    </>
  );
};
