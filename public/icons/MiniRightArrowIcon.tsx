import * as React from "react";

const MiniRightArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={10}
    viewBox="0 0 12 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m11.854 5.354-4.5 4.5a.5.5 0 1 1-.708-.707L10.293 5.5H.5a.5.5 0 0 1 0-1h9.793L6.646.854a.5.5 0 1 1 .708-.707l4.5 4.5a.5.5 0 0 1 0 .707"
      fill="#fff"
    />
  </svg>
);
export default MiniRightArrowIcon;
