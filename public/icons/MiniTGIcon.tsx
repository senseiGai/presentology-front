import * as React from "react";

const MiniTGIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={17}
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M8 .5a7.999 7.999 0 1 0 0 15.998A7.999 7.999 0 0 0 8 .5"
        fill="url(#b)"
      />
      <path
        d="M3.62 8.415a390 390 0 0 1 4.666-2.01c2.222-.924 2.683-1.084 2.985-1.09a.53.53 0 0 1 .31.094.34.34 0 0 1 .113.216c.01.063.024.204.013.315-.12 1.265-.641 4.335-.906 5.752-.112.6-.333.8-.547.82-.465.043-.817-.307-1.267-.602-.704-.462-1.101-.749-1.785-1.2-.79-.52-.278-.806.172-1.273.118-.123 2.165-1.985 2.204-2.153.005-.022.01-.1-.037-.142s-.115-.027-.165-.016Q9.269 7.15 6 9.356q-.479.33-.868.32c-.285-.005-.835-.16-1.244-.293-.5-.163-.898-.25-.863-.526q.026-.216.595-.442"
        fill="#fff"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={800}
        y1={0.5}
        x2={800}
        y2={1600.5}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2AABEE" />
        <stop offset={1} stopColor="#229ED9" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 .5h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default MiniTGIcon;
