import * as React from "react";

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M21.649 20.626a.75.75 0 0 1-.65.375H3a.75.75 0 0 1-.649-1.125c1.428-2.469 3.629-4.239 6.196-5.078a6.75 6.75 0 1 1 6.906 0c2.568.84 4.768 2.61 6.196 5.078a.75.75 0 0 1 0 .75"
        fill="#fff"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default UserIcon;
