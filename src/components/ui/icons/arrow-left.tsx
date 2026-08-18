import * as React from "react";
import { SVGProps } from "react";
const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    viewBox="0 0 24 25"
    {...props}
  >
    <path
      stroke="#1E1E1E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M19.5 12h-14m0 0 7 7m-7-7 7-7"
    />
  </svg>
);
export default ArrowLeft;
