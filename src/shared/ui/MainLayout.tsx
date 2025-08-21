"use client";

import React from "react";
import Image from "next/image";

export const MainLayout = ({
  children,
  isBg,
}: {
  children: React.ReactNode;
  isBg?: boolean;
}) => {
  return (
    <div className="flex items-center justify-center overflow-x-hidden">
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
      <div className="z-10 max-w-[1280px] mx-auto">{children}</div>
    </div>
  );
};
