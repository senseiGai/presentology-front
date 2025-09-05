import * as React from "react";

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={2}
    viewBox="0 0 12 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 .5.5"
      fill="#939396"
    />
  </svg>
);
export default MinusIcon;
