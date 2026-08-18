import { FC, ReactNode } from "react";
import { Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  imageUrl?: string; // Optional image
  buttonText?: string; // Button text (if applicable)
  buttonIcon?: ReactNode; // Button icon (optional)
  inputPlaceholder?: string; // Input placeholder (if applicable)
  onButtonClick?: () => void;
  moreIcon?: ReactNode; // Dynamic more icon (optional)
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  imageUrl,
  buttonText,
  buttonIcon,
  inputPlaceholder,
  onButtonClick,
}) => {
  return (
    <header className="flex items-center p-5 justify-between border-b border-[#E6EAEF] bg-white">
      {/* Left side: Image (if exists) + Title */}
      <div className="flex items-center gap-3">
        {imageUrl && (
          <img src={imageUrl} alt="icon" className="w-8 h-8 rounded-full" />
        )}
        <h1 className="text-lg text-[#1D2939] font-bold">{title}</h1>
      </div>

      {/* Right side: Button/Input + More icon */}
      <div className="flex items-center gap-3">
        {inputPlaceholder ? (
          <div className="w-[272px] h-[36px] rounded-md shadow-md border border-[#E6EAEF] p-[10px] gap-[6px] flex items-center">
            <Search size={16} color="#98A2B3" />
            <input
              type="text"
              placeholder={inputPlaceholder}
              className="text-[#98A2B3] focus:outline-none w-full"
            />
          </div>
        ) : buttonText || buttonIcon ? (
          <button
            onClick={onButtonClick}
            className="w-8 h-8 flex justify-center shadow-sm border border-[#E6EAEF] items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-[5px]"
          >
            {buttonIcon && <span>{buttonIcon}</span>}
            {buttonText}
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default PageHeader;
