import * as React from "react";

const ItalicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={9}
    height={10}
    viewBox="0 0 9 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9 .5a.5.5 0 0 1-.5.5H6.36L3.695 9H5.5a.5.5 0 1 1 0 1h-5a.5.5 0 0 1 0-1h2.14l2.666-8H3.5a.5.5 0 1 1 0-1h5a.5.5 0 0 1 .5.5"
      fill="#939396"
    />
  </svg>
);
export default ItalicIcon;
