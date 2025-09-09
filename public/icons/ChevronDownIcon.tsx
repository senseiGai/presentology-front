import * as React from "react";

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={7}
    viewBox="0 0 12 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m11.533 1.53-5 5a.75.75 0 0 1-1.063 0l-5-5A.751.751 0 0 1 1.533.468l4.469 4.47 4.47-4.47a.751.751 0 0 1 1.062 1.062z"
      fill="#000"
    />
  </svg>
);
export default ChevronDownIcon;
