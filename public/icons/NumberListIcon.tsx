import * as React from "react";

const NumberListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={13}
    height={12}
    viewBox="0 0 13 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.246 6a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 .5.5m-7.5-3.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0 0 1m7 7h-7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1M.97 1.448l.276-.139V4.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.724-.447l-1 .5a.5.5 0 0 0 .448.895m2.262 6.347a1.48 1.48 0 0 0-.6-.997A1.554 1.554 0 0 0 .5 7.092q-.143.185-.223.404a.5.5 0 1 0 .937.342.5.5 0 0 1 .074-.133.547.547 0 0 1 .886.046q.053.086.068.187a.48.48 0 0 1-.103.368L.345 10.701a.5.5 0 0 0 .401.8h2a.5.5 0 0 0 0-1h-1L2.94 8.904a1.47 1.47 0 0 0 .293-1.11"
      fill={props.fill}
    />
  </svg>
);
export default NumberListIcon;
