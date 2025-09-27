"use client";

import { useState, useEffect } from "react";

export const useWindowHeight = () => {
  const [windowHeight, setWindowHeight] = useState<number>(0);

  useEffect(() => {
    // Устанавливаем начальное значение
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowHeight;
};
