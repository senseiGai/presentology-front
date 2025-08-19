import * as React from "react";

const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={18}
    height={16}
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18 8a.75.75 0 0 1-.75.75H2.56l5.47 5.47a.75.75 0 0 1-1.06 1.06L.22 8.53a.75.75 0 0 1 0-1.061L6.969.72A.75.75 0 1 1 8.03 1.78L2.56 7.25h14.69A.75.75 0 0 1 18 8"
      fill="#0B0911"
    />
  </svg>
);
export default ArrowLeft;
