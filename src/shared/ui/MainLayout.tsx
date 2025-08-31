"use client";

import React from "react";
import Image from "next/image";
import { Toaster } from "sonner";

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
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#927DCB] to-[rgba(187,162,254,0)] -z-10" />
        </>
      )}

      {/* Контент */}
      <div className="max-w-[1280px] mx-auto relative min-h-screen">
        <div
          className={`absolute ${
            isBg
              ? "top-1/2 -translate-y-1/2"
              : "grid place-items-center min-h-screen"
          } z-10 w-full`}
        >
          {children}
          <Toaster
            position="bottom-left"
            richColors
            closeButton
            duration={5000}
            style={{
              zIndex: 99999999,
            }}
            toastOptions={{
              classNames: {
                toast: "rounded-[20px] ml-6 !z-[99999999]",
                title: "text-[#0B0911] font-semibold",
                description: "text-[#8F8F92]",
                actionButton:
                  "rounded-[12px] border border-[#D9D9DE] px-4 py-2",
                closeButton: "text-[#8F8F92]",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
