import * as React from "react";

const GreenCheckMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m21.799 7.546-12 12a1.125 1.125 0 0 1-1.594 0l-5.25-5.25a1.128 1.128 0 0 1 1.594-1.594l4.454 4.454L20.207 5.954a1.127 1.127 0 1 1 1.594 1.594z"
      fill="#00CF1B"
    />
  </svg>
);
export default GreenCheckMarkIcon;
