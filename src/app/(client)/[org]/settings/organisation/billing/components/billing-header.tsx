import React from "react";
import { HeaderProps } from "../type";
import { Button } from "~/components/ui/button";

const BillingHeader: React.FC<HeaderProps> = ({
  title,
  nextBillingDate,
  onComparePlan,
  description,
}) => {
  return (
    <div className="flex flex-col justify-between items-center p-2 sm:p-3 bg-[#F1F1FE] border rounded-xl space-y-2 sm:space-y-3">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {nextBillingDate && (
          <p className="text-xs sm:text-sm text-gray-500">
            Next Billing Date: {nextBillingDate}
          </p>
        )}
      </div>
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl p-2 sm:ps-3 sm:pe-1 sm:py-1 gap-2 sm:gap-0">
        <div className="w-full sm:w-auto">
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        {onComparePlan ? (
          <Button
            onClick={onComparePlan}
            className="w-full sm:w-auto px-4 py-2 border border-[#8860F8] text-[#7141F8] rounded-md hover:bg-purple-50 transition-colors text-sm cursor-pointer"
          >
            Compare Plans
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default BillingHeader;
