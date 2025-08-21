import * as React from "react";

const PresentationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={21}
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18.25 2.75h-7.5v-1.5a.75.75 0 1 0-1.5 0v1.5h-7.5a1.5 1.5 0 0 0-1.5 1.5V15.5a1.5 1.5 0 0 0 1.5 1.5h3.69l-2.026 2.531a.75.75 0 1 0 1.172.938L7.36 17h5.28l2.774 3.469a.75.75 0 1 0 1.172-.938L14.56 17h3.69a1.5 1.5 0 0 0 1.5-1.5V4.25a1.5 1.5 0 0 0-1.5-1.5"
      fill="#fff"
    />
  </svg>
);
export default PresentationIcon;
