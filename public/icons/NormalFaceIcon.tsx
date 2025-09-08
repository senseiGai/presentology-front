import * as React from "react";

const NormalFaceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 .25A9.75 9.75 0 1 0 19.75 10 9.76 9.76 0 0 0 10 .25M6.625 7a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25m7.125 6.75h-7.5a.75.75 0 1 1 0-1.5h7.5a.75.75 0 1 1 0 1.5m-.375-4.5a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25"
      fill="#FFBA00"
    />
  </svg>
);
export default NormalFaceIcon;
