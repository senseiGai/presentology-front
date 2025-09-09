import * as React from "react";

const BoldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={9}
    height={11}
    viewBox="0 0 9 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6.99 5.231A2.75 2.75 0 0 0 5.087.5H.836a.5.5 0 0 0-.5.5v9.5a.5.5 0 0 0 .5.5h5A3 3 0 0 0 6.99 5.231M1.337 1.5h3.75a1.75 1.75 0 1 1 0 3.5h-3.75zm4.5 8.5h-4.5V6h4.5a2 2 0 1 1 0 4"
      fill={props.fill}
    />
  </svg>
);
export default BoldIcon;
