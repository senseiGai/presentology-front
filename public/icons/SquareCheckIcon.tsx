import * as React from "react";

const SquareCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={46}
    height={46}
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#a)">
      <rect x={7} y={7} width={32} height={32} rx={8} fill="#fff" />
      <path
        d="m29.533 20.03-8 8a.75.75 0 0 1-1.063 0l-3.5-3.5a.75.75 0 1 1 1.063-1.062l2.969 2.97 7.47-7.468a.751.751 0 1 1 1.062 1.062z"
        fill="#BBA2FE"
      />
    </g>
    <defs>
      <filter
        id="a"
        x={0}
        y={0}
        width={46}
        height={46}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feMorphology
          radius={1}
          operator="dilate"
          in="SourceAlpha"
          result="effect1_dropShadow_2877_11334"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={3} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0.733333 0 0 0 0 0.635294 0 0 0 0 0.996078 0 0 0 0.3 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_2877_11334"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_2877_11334"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SquareCheckIcon;
