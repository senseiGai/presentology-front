"use client";

import React from "react";
import Image from "next/image";
import { Toaster } from "sonner";

import { useWindowWidth } from "../hooks/useWindowWidth";

export const MainLayout = ({
  children,
  isBg,
  fullWidth = false,
}: {
  children: React.ReactNode;
  isBg?: boolean;
  fullWidth?: boolean;
}) => {
  const width = useWindowWidth();

  const middleWidth = width > 1600;
  const topWidth = width > 1800;

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
      <div
        className={
          fullWidth
            ? `relative mx-auto`
            : `${
                topWidth
                  ? "max-w-[1760px]"
                  : middleWidth
                  ? "max-w-[1560px]"
                  : "max-w-[1280px]"
              }  mx-auto relative min-h-screen`
        }
      >
        <div
          className={`${fullWidth ? "relative" : "absolute"} ${
            isBg
              ? "top-1/2 -translate-y-1/2"
              : fullWidth
              ? "min-h-screen"
              : "grid place-items-center min-h-screen"
          } z-10 w-full`}
        >
          {children}
        </div>

        <Toaster
          position="bottom-left"
          richColors
          closeButton
          duration={5000}
          style={{
            zIndex: 99999999,
          }}
          toastOptions={{
            style: {
              left: fullWidth ? "24px" : "24px", // 24px = ml-6
              bottom: "24px",
              position: "fixed",
            },
            classNames: {
              toast: "rounded-[20px] !ml-0 !z-[99999999]",
              title: "text-[#0B0911] font-semibold",
              description: "text-[#8F8F92]",
              actionButton: "rounded-[12px] border border-[#D9D9DE] px-4 py-2",
              closeButton: "text-[#8F8F92]",
            },
          }}
        />
      </div>
    </div>
  );
};
