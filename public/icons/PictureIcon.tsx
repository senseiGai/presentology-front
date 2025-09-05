import * as React from "react";

const PictureIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={26}
    height={22}
    viewBox="0 0 26 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M24 0H2a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2m-7.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M24 20H2v-4.914l5.793-5.793a1 1 0 0 1 1.414 0l8.418 8.415a1 1 0 1 0 1.415-1.415l-2.207-2.207 1.792-1.793a1 1 0 0 1 1.414 0L24 16.259z"
      fill="#C0C0C1"
    />
  </svg>
);
export default PictureIcon;
