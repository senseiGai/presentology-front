import * as React from "react";

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={13}
    viewBox="0 0 12 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M11.5.5h-8A.5.5 0 0 0 3 1v2.5H.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 .5.5h8A.5.5 0 0 0 9 12V9.5h2.5A.5.5 0 0 0 12 9V1a.5.5 0 0 0-.5-.5m-.5 8H9V4a.5.5 0 0 0-.5-.5H4v-2h7z"
      fill="#07F"
    />
  </svg>
);
export default CopyIcon;
