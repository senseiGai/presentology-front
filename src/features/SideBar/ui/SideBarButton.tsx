import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { useSideBarStore } from "../model/use-sidebar-store";

export const SideBarButton = ({
  label,
  icon,
  isSocial = false,
  href,
}: {
  label: string;
  icon: React.ReactNode;
  isSocial?: boolean;
  href?: string;
}) => {
  const { activeItem, setActiveItem, isCollapsed } = useSideBarStore();

  const isActive = activeItem === label;

  const buttonContent = (
    <>
      <div
        className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center ${
          !isSocial && isActive ? "bg-white" : "bg-[#DDD1FF]"
        }`}
      >
        <div
          className={`${
            !isSocial
              ? isActive
                ? "[&_svg_path]:fill-[#BBA2FE]"
                : "[&_svg_path]:fill-[#FFFFFF]"
              : ""
          } [&_svg]:w-6 [&_svg]:h-6 flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      {!isCollapsed && <span className="text-[14px] font-medium">{label}</span>}
    </>
  );

  const baseClasses = clsx(
    "flex items-center p-1 gap-3 h-[48px] rounded-[10px] transition-all duration-300 ease-in-out cursor-pointer",
    isCollapsed ? "w-[48px] justify-center" : "w-[218px]",
    !isSocial && isActive
      ? "text-white bg-[#BBA2FE] font-semibold"
      : "text-[#BBA2FE] hover:bg-purple-50"
  );

  if (isSocial && href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        title={isCollapsed ? label : undefined}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={() => setActiveItem(label)}
      className={baseClasses}
      title={isCollapsed ? label : undefined}
    >
      {buttonContent}
    </button>
  );
};
