import * as React from "react";

const CompasIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 .25A9.75 9.75 0 1 0 19.75 10 9.76 9.76 0 0 0 10 .25m4.836 5.418-3 6a.4.4 0 0 1-.168.168l-6 3a.375.375 0 0 1-.504-.504l3-6a.4.4 0 0 1 .168-.168l6-3a.375.375 0 0 1 .504.504"
      fill="#fff"
    />
  </svg>
);
export default CompasIcon;
