import React from "react";
import clsx from "clsx";
import { useSideBarStore } from "../model/use-sidebar-store";

export const SideBarButton = ({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) => {
  const { activeItem, setActiveItem, isCollapsed } = useSideBarStore();

  const isActive = activeItem === label;

  return (
    <button
      onClick={() => setActiveItem(label)}
      className={clsx(
        "flex items-center p-1 gap-3 h-[48px] rounded-[10px] transition-all duration-300 ease-in-out cursor-pointer",
        isCollapsed ? "w-[48px] justify-center" : "w-[218px]",
        isActive
          ? "text-white bg-[#BBA2FE] font-semibold"
          : "text-[#BBA2FE] hover:bg-purple-50"
      )}
      title={isCollapsed ? label : undefined}
    >
      <div
        className={`w-[40px] h-[40px] rounded-[8px] flex items-center justify-center ${
          isActive ? "bg-white" : "bg-[#DDD1FF]"
        }`}
      >
        {icon}
      </div>
      {!isCollapsed && <span className="text-[14px] font-medium">{label}</span>}
    </button>
  );
};
