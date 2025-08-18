import * as React from "react";

const YandexIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M.5 12c0-6.628 5.371-12 12-12 6.626 0 12 5.372 12 12s-5.374 12-12 12c-6.629 0-12-5.372-12-12"
        fill="#FC3F1D"
      />
      <path
        d="M13.82 7.666h-.924c-1.694 0-2.585.858-2.585 2.123 0 1.43.616 2.1 1.881 2.96l1.045.703-3.003 4.487H7.99l2.695-4.014c-1.55-1.11-2.42-2.19-2.42-4.015 0-2.288 1.595-3.85 4.62-3.85h3.003v11.868H13.82z"
        fill="#fff"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.5 0h24v24H.5z" />
      </clipPath>
    </defs>
  </svg>
);
export default YandexIcon;
