import Image from "next/image";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="relative mb-8">
      <div className="">
        <Image
          src={"/empty-box.svg"}
          width={100}
          height={100}
          alt="empty state icon"
          className="w-[300px] h-[300px]"
        />
      </div>
    </div>
    <p className="text-sm font-medium text-[#344054] -mt-12">
      You have not used any paid agent yet.
    </p>
    <p className="text-[#344054] text-center text-sm">
      You can track your usage history here once you start using them.
    </p>
  </div>
);

export default EmptyState;
