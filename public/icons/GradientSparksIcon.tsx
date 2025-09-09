import * as React from "react";

const GradientSparksIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19.504 13.5a1.48 1.48 0 0 1-.977 1.4l-4.836 1.787-1.78 4.84a1.493 1.493 0 0 1-2.802 0l-1.793-4.84-4.84-1.78a1.492 1.492 0 0 1 0-2.802l4.84-1.793 1.782-4.839a1.493 1.493 0 0 1 2.8 0l1.793 4.84 4.84 1.78a1.48 1.48 0 0 1 .973 1.407m-5.25-9h1.5V6a.75.75 0 1 0 1.5 0V4.5h1.5a.75.75 0 1 0 0-1.5h-1.5V1.5a.75.75 0 1 0-1.5 0V3h-1.5a.75.75 0 1 0 0 1.5m8.25 3h-.75v-.75a.75.75 0 1 0-1.5 0v.75h-.75a.75.75 0 1 0 0 1.5h.75v.75a.75.75 0 1 0 1.5 0V9h.75a.75.75 0 1 0 0-1.5"
      fill="url(#a)"
    />
    <defs>
      <radialGradient
        id="a"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(8.25 12 -10.8665 31.163 6.756 6)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDA345" />
        <stop offset={1} stopColor="#BBA2FE" />
      </radialGradient>
    </defs>
  </svg>
);
export default GradientSparksIcon;
