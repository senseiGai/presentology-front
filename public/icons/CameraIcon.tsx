import * as React from "react";

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={12}
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 1.5h-1.732L9.416.223A.5.5 0 0 0 9 0H5a.5.5 0 0 0-.416.223L3.732 1.5H2A1.5 1.5 0 0 0 .5 3v7A1.5 1.5 0 0 0 2 11.5h10a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 12 1.5M9.25 6.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      fill="#939396"
    />
  </svg>
);
export default CameraIcon;
