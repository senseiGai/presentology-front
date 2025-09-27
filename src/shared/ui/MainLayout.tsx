"use client";

import React from "react";
import Image from "next/image";
import { Toaster } from "sonner";

import { useWindowWidth } from "../hooks/useWindowWidth";
import { useWindowHeight } from "../hooks/useWindowHeight";
import { usePathname } from "next/navigation";

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
  const height = useWindowHeight();
  const pathname = usePathname();

  const middleWidth = width > 1600;
  const topWidth = width > 1800;
  const isMinimumHeight = 740 <= height && height <= 785;

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Фоновая картинка */}
      {isBg && pathname === "/home" && (
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
                isMinimumHeight
                  ? "max-w-[1200px]"
                  : topWidth
                  ? "max-w-[1760px]"
                  : middleWidth
                  ? "max-w-[1560px]"
                  : "max-w-[1000px] xl:max-w-[1280px]"
              }  mx-auto relative min-h-screen`
        }
      >
        <div
          className={`${fullWidth ? "relative" : "absolute"} ${
            fullWidth ? "min-h-screen" : "top-1/2 -translate-y-1/2"
          } z-10 w-full`}
        >
          {children}
        </div>
        <div
          className={`${fullWidth ? "relative" : "absolute"} ${
            fullWidth ? "" : "top-1/2 -translate-y-1/2"
          } z-10 w-full`}
        >
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
                toast: `rounded-[20px] ml-6 !z-[99999999] ${
                  pathname === "/home" && "top-64"
                }`,
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
