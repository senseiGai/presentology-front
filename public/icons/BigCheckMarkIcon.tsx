import * as React from "react";

const BigCheckMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={21}
    height={15}
    viewBox="0 0 21 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m19.799 2.546-12 12a1.125 1.125 0 0 1-1.594 0l-5.25-5.25A1.127 1.127 0 0 1 2.55 7.702l4.454 4.454L18.207.954a1.127 1.127 0 1 1 1.594 1.594z"
      fill={props.fill}
    />
  </svg>
);
export default BigCheckMarkIcon;
