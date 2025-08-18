import * as React from "react";

const VKIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{
        maskType: "luminance",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={25}
      height={24}
    >
      <path d="M24.382 0H.618v24h23.763z" fill="#fff" />
    </mask>
    <g mask="url(#a)">
      <path
        d="M.62 11.52c0-5.43 0-8.146 1.67-9.833S6.647 0 12.025 0h.95c5.377 0 8.066 0 9.736 1.687s1.67 4.402 1.67 9.833v.96c0 5.43 0 8.146-1.67 9.833S18.352 24 12.976 24h-.95c-5.378 0-8.066 0-9.736-1.687S.62 17.91.62 12.48z"
        fill="#07F"
      />
      <path
        d="M13.263 17.29c-5.416 0-8.505-3.75-8.634-9.99h2.713c.089 4.58 2.089 6.52 3.673 6.92V7.3h2.554v3.95c1.565-.17 3.208-1.97 3.763-3.95h2.554c-.425 2.44-2.208 4.24-3.475 4.98 1.267.6 3.297 2.17 4.07 5.01h-2.813c-.604-1.9-2.108-3.37-4.098-3.57v3.57z"
        fill="#fff"
      />
    </g>
  </svg>
);
export default VKIcon;
