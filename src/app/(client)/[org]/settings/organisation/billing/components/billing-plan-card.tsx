import React from "react";
import StorageIndicator from "~/app/(client)/[org]/_components/storage/storage-indicator";
import { PlanCardProps } from "../type";

const BillingPlanCard: React.FC<PlanCardProps> = ({
  planName,
  description,
  price,
  currency,
  period,
  usersAdded,
  storageUsed,
  totalStorage,
  storageUnit,
}) => {
  const storagePercentage = (storageUsed / totalStorage) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 py-6 shadow-sm">
      <div className="mb-4 px-6 pb-6 border-b">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{planName}</h2>
        <p className="text-[#475467] font-[400] text-sm">{description}</p>
      </div>

      <div className="flex justify-between items-center mb-6 px-6 pb-4 border-b">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-gray-900">
            {currency}
            {price}
          </span>
          <span className="text-gray-500 ml-2 text-sm">{period}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-900 font-medium text-sm">
            {usersAdded}
          </span>
          <span className="text-gray-500 text-sm">
            {" "}
            {usersAdded === 1 ? "user" : "users"} added
          </span>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center mb-2 bg-[#F1F1FE] py-1 ps-1 pe-2 rounded-lg ">
          <StorageIndicator storagePercentage={storagePercentage} />
          <span className="text-sm font-medium text-[#344054]">
            {totalStorage}
            {storageUnit}
          </span>
        </div>
        <p className="text-sm text-gray-900">
          {storageUsed}
          {storageUnit} <span className="text-gray-500">Storage Used</span>
        </p>
      </div>
    </div>
  );
};

export default BillingPlanCard;
