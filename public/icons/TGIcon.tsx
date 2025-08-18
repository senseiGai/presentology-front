import * as React from "react";

const TGIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
        d="M12.5 0a11.999 11.999 0 0 0-8.484 20.485 11.999 11.999 0 1 0 16.968-16.97A12 12 0 0 0 12.5 0"
        fill="url(#b)"
      />
      <path
        d="M5.932 11.873a585 585 0 0 1 6.997-3.014c3.334-1.386 4.026-1.627 4.478-1.635.1-.002.32.023.465.14.12.098.154.23.17.324.015.094.036.307.02.473-.18 1.897-.963 6.502-1.36 8.627-.167.9-.499 1.2-.82 1.23-.697.064-1.226-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.248-2.977 3.306-3.23.008-.032.015-.15-.056-.212-.07-.063-.173-.041-.248-.024q-.159.036-5.062 3.345-.716.494-1.301.48c-.428-.008-1.253-.241-1.866-.44-.75-.245-1.348-.374-1.296-.789q.04-.324.893-.663"
        fill="#fff"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={1200.5}
        y1={0}
        x2={1200.5}
        y2={2400}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2AABEE" />
        <stop offset={1} stopColor="#229ED9" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M.5 0h24v24H.5z" />
      </clipPath>
    </defs>
  </svg>
);
export default TGIcon;
