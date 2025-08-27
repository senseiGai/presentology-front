"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import MiniLogoIcon from "../../../../public/icons/MiniLogoIcon";
import SideBarIcon from "../../../../public/icons/SideBarIcon";

import { SideBarButton } from "./SideBarButton";
import Image from "next/image";
import LogoutIcon from "../../../../public/icons/LogOutIcon";
import { useSideBarStore } from "../model/use-sidebar-store";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { menuItems } from "../lib/menuItems";
import { useSubscriptionPopupStore } from "../../../entities/SubscriptionPopup/model/use-subscription-popup-store";

export default function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSideBarStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Вы успешно вышли из системы");
      router.push("/login");
    } catch (error) {
      toast.error("Произошла ошибка при выходе");
    }
  };

  // Получаем первую букву имени для аватара
  const avatarLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";
  const displayEmail = user?.email || "email@provider.com";
  const { openPopup } = useSubscriptionPopupStore();

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
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.firstName || "User"}
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-[16px] font-semibold">
                      {avatarLetter}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[120px] text-[#BBA2FE] text-[12px] font-normal">
                  {displayEmail}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-[#F4F4F4] w-[24px] h-[24px] flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-[#E4E4E4] transition-colors"
                title="Выйти"
              >
                <LogoutIcon />
              </button>
            </>
          ) : (
            <div
              className="bg-[#BBA2FE] w-[40px] h-[40px] pt-0.5 cursor-pointer flex items-center justify-center rounded-full"
              title={displayEmail}
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.firstName || "User"}
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-[16px] font-semibold">
                  {avatarLetter}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
