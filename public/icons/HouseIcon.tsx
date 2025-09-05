import * as React from "react";

const HouseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={18}
    height={19}
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 9.25v9a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75v-4.875a.375.375 0 0 0-.375-.375h-3.75a.375.375 0 0 0-.375.375v4.875A.75.75 0 0 1 6 19H.75a.75.75 0 0 1-.75-.75v-9c0-.398.158-.78.44-1.06l7.5-7.5a1.5 1.5 0 0 1 2.12 0l7.5 7.5A1.5 1.5 0 0 1 18 9.25"
      fill="#939396"
    />
  </svg>
);
export default HouseIcon;
