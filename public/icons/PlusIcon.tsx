import * as React from "react";

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 6a.5.5 0 0 1-.5.5h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5a.5.5 0 0 1 1 0v5h5a.5.5 0 0 1 .5.5"
      fill={props.fill}
    />
  </svg>
);
export default PlusIcon;
