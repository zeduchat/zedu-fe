import React from "react";
import { FeatureListProps } from "../type";
import Icons from "~/app/(client)/[org]/_components/billing/icons";

const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full h-full">
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span className="text-green-500 mr-3 mt-0.5">
              <Icons name="feature-bullets" svgProps={{}} />
            </span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureList;
