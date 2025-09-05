import * as React from "react";

const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 6.75a.75.75 0 1 1-1.5 0V2.561l-6.218 6.22A.75.75 0 0 1 9.22 7.719L15.44 1.5h-4.19a.75.75 0 1 1 0-1.5h6a.75.75 0 0 1 .75.75zM14.25 9a.75.75 0 0 0-.75.75v6.75h-12v-12h6.75a.75.75 0 0 0 0-1.5H1.5A1.5 1.5 0 0 0 0 4.5v12A1.5 1.5 0 0 0 1.5 18h12a1.5 1.5 0 0 0 1.5-1.5V9.75a.75.75 0 0 0-.75-.75"
      fill="#C0C0C1"
    />
  </svg>
);
export default ShareIcon;
