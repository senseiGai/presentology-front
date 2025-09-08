import * as React from "react";

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={10}
    viewBox="0 0 14 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13 0H1a.5.5 0 0 0-.5.5V9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V.5A.5.5 0 0 0 13 0m-.5 9h-11V1.637l5.162 4.732a.5.5 0 0 0 .676 0L12.5 1.637z"
      fill="#000"
    />
  </svg>
);
export default MailIcon;
