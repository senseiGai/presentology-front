import * as React from "react";

const ThicknessIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={10}
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M16 0v1H0V0zM0 3h16v2H0zm0 4h16v3H0z" fill="#939396" />
  </svg>
);
export default ThicknessIcon;
