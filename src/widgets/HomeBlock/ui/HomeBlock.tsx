"use client";

import React from "react";
import Sidebar from "@/features/SideBar/ui/SideBar";
import { CreatePresentationCard } from "@/features/CreatePresentationCard/ui/CreatePresentationCard";

import LogoElement from "../../../../public/icons/LogoElement";
import HeadphonesIcon from "../../../../public/icons/HeadphonesIcon";
import { createCards } from "../lib/createCards";

import { useSideBarStore } from "@/features/SideBar/model/use-sidebar-store";

export const HomeBlock = () => {
  const { activeItem } = useSideBarStore();

  return (
    <section className="flex flex-row gap-x-[24px] mt-[24px] relative">
      <Sidebar />
      <div>
        <div className="flex flex-row items-center">
          <h1 className="mr-[23px]">
            {activeItem === "Создать презентацию" && "СОЗДАТЬ"}
            {activeItem === "Мои презентации" && "МОИ"}
          </h1>
          <LogoElement />
          <h1 className="ml-[23px]">
            {activeItem === "Создать презентацию" && "ПРЕЗЕНТАЦИЮ"}
            {activeItem === "Мои презентации" && "ПРЕЗЕНТАЦИИ"}
          </h1>
        </div>
        {activeItem === "Мои презентации" && (
          <h2 className="text-white mt-[40px]">
            Создайте презентацию и она появится здесь
          </h2>
        )}
        {activeItem === "Создать презентацию" && (
          <div className="flex flex-row gap-x-4 mt-[40px]">
            {createCards.map((item, index) => {
              return (
                <CreatePresentationCard
                  key={index}
                  label={item.label}
                  description={item.description}
                  image={item.image}
                  onClick={item.onClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
