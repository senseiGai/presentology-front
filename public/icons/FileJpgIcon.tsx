import * as React from "react";

const FileJpgIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 4a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"
      fill="#02A0BF"
    />
    <path
      d="M14 2v6h6"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="white"
      fontSize="8"
      fontWeight="bold"
    >
      JPG
    </text>
  </svg>
);

export default FileJpgIcon;
