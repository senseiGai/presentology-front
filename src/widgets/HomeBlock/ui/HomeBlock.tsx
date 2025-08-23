"use client";

import React from "react";
import Sidebar from "@/features/SideBar/ui/SideBar";
import { CreatePresentationCard } from "@/features/CreatePresentationCard/ui/CreatePresentationCard";

import LogoElement from "../../../../public/icons/LogoElement";
import { createCards } from "../lib/createCards";

import { useSideBarStore } from "@/features/SideBar/model/use-sidebar-store";
import HeadphonesIcon from "../../../../public/icons/HeadphonesIcon";
import { PresentationCard } from "@/features/PresentationCard/ui/PresentationCard";

export const HomeBlock = () => {
  const { activeItem } = useSideBarStore();

  const presentationsContent = [
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Улучшенная",
    },
  ];

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
        {activeItem === "Мои презентации" &&
          (presentationsContent.length === 0 ? (
            <h2 className="text-white mt-[40px]">
              Создайте презентацию и она появится здесь
            </h2>
          ) : (
            <div className="grid grid-cols-3 gap-x-[24px] gap-y-[24px] mt-[40px]">
              {presentationsContent.map((item, index) => (
                <PresentationCard
                  key={index}
                  label={item.label}
                  images={item.images}
                  date={item.date}
                  tag={
                    item.tag as
                      | "Сгенерированная"
                      | "Улучшенная"
                      | "По брендбуку"
                  }
                />
              ))}
            </div>
          ))}
      </div>
      <button className="bg-[#FFFFFF] cursor-pointer rounded-full w-[40px] h-[40px] flex items-center justify-center absolute bottom-0 right-[24px]  z-20">
        <HeadphonesIcon />
      </button>
    </section>
  );
};
