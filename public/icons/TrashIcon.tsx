import * as React from "react";

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={14}
    viewBox="0 0 12 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2.834a.5.5 0 0 1-.5.5H11v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-9H.5a.5.5 0 1 1 0-1h11a.5.5 0 0 1 .5.5m-8.5-1.5h5a.5.5 0 1 0 0-1h-5a.5.5 0 1 0 0 1"
      fill="#FF514F"
    />
  </svg>
);
export default TrashIcon;
