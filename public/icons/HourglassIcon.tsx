import * as React from "react";

const HourglassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5Z"
      fill="#8F8F92"
    />
    <path
      d="M1.5 2.5v1.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.5a.5.5 0 0 1 1 0v1.75a1.25 1.25 0 0 1-1.25 1.25h-1.5v1c0 .69-.56 1.25-1.25 1.25h-8.5A1.25 1.25 0 0 1 2.75 6.5v-1h-1.5A1.25 1.25 0 0 1 0 4.25V2.5a.5.5 0 0 1 1 0Z"
      fill="#8F8F92"
    />
    <path
      d="M8 8.5c-.828 0-1.5.672-1.5 1.5v1.75c0 .138.112.25.25.25h2.5a.25.25 0 0 0 .25-.25V10c0-.828-.672-1.5-1.5-1.5Z"
      fill="#8F8F92"
    />
    <path
      d="M1.5 13.5v1.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V13.5a.5.5 0 0 1 1 0v1.75a1.25 1.25 0 0 1-1.25 1.25h-12.5A1.25 1.25 0 0 1 0 15.25V13.5a.5.5 0 0 1 1 0Z"
      fill="#8F8F92"
    />
  </svg>
);

export default HourglassIcon;
