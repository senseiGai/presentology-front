import * as React from "react";

const WarningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={28}
    height={25}
    viewBox="0 0 28 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M27.6 20.511 16.667 1.528a3.095 3.095 0 0 0-5.337 0L.399 20.51a2.94 2.94 0 0 0 0 2.965A3.04 3.04 0 0 0 3.07 25h21.86a3.04 3.04 0 0 0 2.666-1.524 2.94 2.94 0 0 0 .002-2.965M13 10.001a1 1 0 1 1 2 0v5a1 1 0 0 1-2 0zm1 11a1.5 1.5 0 1 1 0-3.002A1.5 1.5 0 0 1 14 21"
      fill="#FF514F"
    />
  </svg>
);
export default WarningIcon;
