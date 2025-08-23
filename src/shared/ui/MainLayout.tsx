"use client";

import React from "react";
import Image from "next/image";
import HeadphonesIcon from "../../../public/icons/HeadphonesIcon";

export const MainLayout = ({
  children,
  isBg,
}: {
  children: React.ReactNode;
  isBg?: boolean;
}) => {
  return (
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Фоновая картинка */}
      {isBg && (
        <>
          <Image
            src="/assets/main_bg.png"
            fill
            alt="Main Background"
            className="absolute top-0 left-0 w-full h-full object-cover -z-20"
          />
          {/* Градиент поверх картинки */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#927DCB] to-[rgba(187,162,254,0)] -z-10" />
        </>
      )}

      {/* Контент */}
      <div className="max-w-[1280px] mx-auto">
        <div className="absolute top-1/2 -translate-y-1/2 z-10">{children}</div>
        {/* {isBg && (
          <div className="bg-[#FFFFFF] rounded-full w-[40px] h-[40px] flex items-center justify-center fixed bottom-0 right-0">
            <HeadphonesIcon />
          </div>
        )} */}
      </div>
    </div>
  );
};
