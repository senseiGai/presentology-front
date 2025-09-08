import * as React from "react";

const GrayTrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={18}
    height={20}
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 3.75a.75.75 0 0 1-.75.75h-.75V18a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18V4.5H.75a.75.75 0 0 1 0-1.5h16.5a.75.75 0 0 1 .75.75M5.25 1.5h7.5a.75.75 0 1 0 0-1.5h-7.5a.75.75 0 1 0 0 1.5"
      fill="#C0C0C1"
    />
  </svg>
);
export default GrayTrashIcon;
