"use client";

import React from "react";

import MiniLogoIcon from "../../../../public/icons/MiniLogoIcon";
import SideBarIcon from "../../../../public/icons/SideBarIcon";

import { SideBarButton } from "./SideBarButton";
import UserIcon from "../../../../public/icons/UserIcon";
import LogoutIcon from "../../../../public/icons/LogOutIcon";
import { useSideBarStore } from "../model/use-sidebar-store";
import { menuItems } from "../lib/menuItems";
import { useSubscriptionPopupStore } from "../../../entities/SubscriptionPopup/model/use-subscription-popup-store";
import { SubscriptionPopup } from "../../../entities/SubscriptionPopup/ui/SubscriptionPopup";

export default function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSideBarStore();
  const { isOpen, openPopup, closePopup } = useSubscriptionPopupStore();

  return (
    <aside
      className={`${
        isCollapsed ? "w-[80px]" : "w-[250px]"
      } h-[684px] 2xl:h-[784px] bg-white rounded-[24px] shadow-lg p-4 flex flex-col justify-between transition-all duration-300`}
    >
      <div>
        <div
          className={`flex  items-center mb-6 px-1 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {isCollapsed ? null : <MiniLogoIcon />}
          <button
            className="cursor-pointer hover:bg-gray-100 p-1 rounded-md transition-colors"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Развернуть сайдбар" : "Свернуть сайдбар"}
          >
            <SideBarIcon />
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.slice(0, 3).map(({ key, label, icon }) => (
            <SideBarButton key={key} icon={icon} label={label} />
          ))}
          <div className="bg-[#DDD1FF] w-full h-[1px] mt-[16px] mb-[16px]" />
          {menuItems.slice(3, 5).map(({ key, label, icon, isSocial, href }) => (
            <SideBarButton
              isSocial={isSocial}
              href={href}
              key={key}
              icon={icon}
              label={label}
            />
          ))}
        </nav>
      </div>

      {/* Bottom controls */}
      <div className="space-y-2">
        {!isCollapsed && (
          <>
            <button
              onClick={openPopup}
              className="w-full cursor-pointer bg-gradient-to-r from-[#FDA345] to-[#BBA2FE] text-white text-[14px] font-medium h-[40px] rounded-[8px]"
            >
              Приобрести подписку
            </button>
            <button className="w-full cursor-pointer bg-[#F4F4F4] text-[#0B0911] text-[14px] font-normal h-[40px] rounded-[8px]">
              Получить +1 генерацию
            </button>
          </>
        )}

        {/* Email Block */}
        <div
          className={`mt-[24px] flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-[12px]">
                <div className="bg-[#BBA2FE] w-[40px] h-[40px] pt-0.5 cursor-pointer flex items-center justify-center rounded-full">
                  <UserIcon />
                </div>
                <span className="truncate max-w-[120px] text-[#BBA2FE] text-[12px] font-normal">
                  emaaaaaaaail@provider.com
                </span>
              </div>
              <div className="bg-[#F4F4F4] w-[24px] h-[24px] flex items-center justify-center rounded-[8px] cursor-pointer">
                <LogoutIcon />
              </div>
            </>
          ) : (
            <div
              className="bg-[#BBA2FE] w-[40px] h-[40px] pt-0.5 cursor-pointer flex items-center justify-center rounded-full"
              title="emaaaaaaaail@provider.com"
            >
              <UserIcon />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
