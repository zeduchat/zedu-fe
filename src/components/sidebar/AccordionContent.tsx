import React from "react";

interface ButtonData {
  id: string;
  label: string;
}
interface AccordionContentProps {
  activeButton: string | null;
  buttonData: ButtonData[];
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  activeButton,
  buttonData,
}) => {
  const activeButtonData = buttonData?.find(
    (button) => button.id === activeButton
  );

  if (
    !activeButtonData ||
    activeButtonData.id === "home" ||
    activeButtonData.id === "inbox"
  ) {
    return null;
  }

  return (
    <div className="w-[281px] p-4 text-sm text-left bg-white border-r-[1.5px] border-gray-200 h-screen flex flex-col">
      <div className="p-[20px] font-semibold text-lg">
        {activeButtonData.label}
      </div>
      <div className="flex flex-col w-full border-t p-[20px]">
        <p>content</p>
      </div>
    </div>
  );
};

export default AccordionContent;
