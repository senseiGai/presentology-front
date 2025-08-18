import Link from "next/link";
import React from "react";

export const SocialButton = ({
  icon,
  href,
}: {
  icon: React.ReactNode;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-center w-[83px] h-[40px] bg-[#F4F4F4] rounded-[8px]"
    >
      {icon}
    </Link>
  );
};
