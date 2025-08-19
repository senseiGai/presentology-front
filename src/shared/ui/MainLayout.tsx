"use client";

import React from "react";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-x-hidden max-w-[1280px] mx-auto flex items-center min-h-screen ">
      {children}
    </div>
  );
};
