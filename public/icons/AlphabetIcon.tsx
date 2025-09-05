import * as React from "react";

const AlphabetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={26}
    height={22}
    viewBox="0 0 26 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22 14.5c0 .813-.916 1.5-2 1.5s-2-.687-2-1.5.916-1.5 2-1.5 2 .688 2 1.5M26 2v18a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2M14.921 16.61l-5.5-13a1 1 0 0 0-1.842 0l-5.5 13a1 1 0 0 0 1.842.78L5.355 14h6.29l1.434 3.39a1 1 0 1 0 1.842-.78M24 10.5C24 8.57 22.205 7 20 7a4.36 4.36 0 0 0-2.597.835 1 1 0 1 0 1.195 1.604c.408-.292.9-.446 1.402-.439 1.07 0 1.975.67 2 1.47v1a4.4 4.4 0 0 0-2-.47c-2.205 0-4 1.57-4 3.5s1.795 3.5 4 3.5a4.4 4.4 0 0 0 2.116-.532A1 1 0 0 0 24 17zM6.201 12H10.8L8.5 6.566z"
      fill="#C0C0C1"
    />
  </svg>
);
export default AlphabetIcon;
