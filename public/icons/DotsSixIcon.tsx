import * as React from "react";

const DotsSixIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="10.5" cy="9.5" r="1.5" fill="#8F8F92" />
    <circle cx="18.5" cy="9.5" r="1.5" fill="#8F8F92" />
    <circle cx="10.5" cy="16" r="1.5" fill="#8F8F92" />
    <circle cx="18.5" cy="16" r="1.5" fill="#8F8F92" />
    <circle cx="10.5" cy="22.5" r="1.5" fill="#8F8F92" />
    <circle cx="18.5" cy="22.5" r="1.5" fill="#8F8F92" />
  </svg>
);

export default DotsSixIcon;
