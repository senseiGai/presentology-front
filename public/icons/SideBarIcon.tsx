import * as React from "react";

const SideBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={12}
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.5.5h-11a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m-11 1H4v9H1.5zm11 9H5v-9h7.5z"
      fill="#BBA2FE"
    />
  </svg>
);
export default SideBarIcon;
