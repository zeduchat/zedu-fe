import { SVGProps } from "react";
const CreditCard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={66}
    height={40}
    viewBox="0 0 66 40"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path fill="#FF5F00" d="M41.889 4.28h-17.5v31.444h17.5V4.279Z" />
      <path
        fill="#EB001B"
        d="M25.5 20A20.125 20.125 0 0 1 33.111 4.28C24.445-2.555 11.89-1.055 5.056 7.667-1.778 16.334-.278 28.89 8.444 35.723a19.947 19.947 0 0 0 24.723 0A20.01 20.01 0 0 1 25.5 20Z"
      />
      <path
        fill="#F79E1B"
        d="M65.5 20c0 11.056-8.944 20-20 20-4.5 0-8.833-1.5-12.333-4.277C41.833 28.89 43.333 16.334 36.5 7.612c-1-1.222-2.111-2.39-3.333-3.333 8.666-6.834 21.277-5.334 28.055 3.388A19.795 19.795 0 0 1 65.5 20.001ZM63.611 32.39v-.668h.278v-.11h-.667v.11h.278v.667h.111Zm1.278 0v-.779h-.222l-.223.556-.222-.556H64v.778h.167v-.611l.222.5h.166l.223-.5v.611h.11Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.778 0H65.5v40H.778z" />
      </clipPath>
    </defs>
  </svg>
);
export default CreditCard;
