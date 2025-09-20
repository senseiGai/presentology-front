"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface MascotProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const PresentationMascot: React.FC<MascotProps> = ({
  className,
  size = "md",
}) => {
  const getSizeMultiplier = () => {
    switch (size) {
      case "sm":
        return 0.6;
      case "md":
        return 1;
      case "lg":
        return 1.3;
      case "xl":
        return 1.6;
      default:
        return 1;
    }
  };

  const sizeMultiplier = getSizeMultiplier();
  const baseSize = 500; // Base size in pixels
  const scaledSize = baseSize * sizeMultiplier;

  const mascotRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mascotRef.current) {
        const rect = mascotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getEyePosition = () => {
    const maxRadius = 8; // максимальный радиус движения глаза в пикселях
    const distance = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);

    if (distance === 0) {
      return { x: 0, y: 0 };
    }

    // Нормализуем направление
    const normalizedX = mousePosition.x / distance;
    const normalizedY = mousePosition.y / distance;

    // Ограничиваем движение кругом с более высокой чувствительностью
    const moveDistance = Math.min(distance / 20, maxRadius);

    return {
      x: normalizedX * moveDistance,
      y: normalizedY * moveDistance,
    };
  };

  return (
    <div
      ref={mascotRef}
      className={clsx("relative overflow-visible", className)}
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
      }}
    >
      <div
        className="absolute w-[10px] h-[10px] rounded-full bg-white transition-transform duration-100 ease-out"
        style={{
          top: "18%",
          left: "50%",
          transform: `translate(calc(-50% - 11.5px), -50%) translate(${
            getEyePosition().x
          }px, ${getEyePosition().y}px)`,
        }}
      />
      <div
        className="absolute w-[10px] h-[10px] rounded-full bg-white transition-transform duration-100 ease-out"
        style={{
          top: "18%",
          left: "53%",
          transform: `translate(calc(-50% + 11.5px), -50%) translate(${
            getEyePosition().x
          }px, ${getEyePosition().y}px)`,
        }}
      />
    </div>
  );
};
