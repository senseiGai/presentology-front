import * as React from "react";

const DotListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={13}
    height={10}
    viewBox="0 0 13 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.75 1a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m8.5 3.5h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1m0 4h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1M1.5.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m0 4a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m0 4a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5"
      fill={props.fill}
    />
  </svg>
);
export default DotListIcon;
