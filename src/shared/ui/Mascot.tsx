"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface MascotProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showImage?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  className,
  size = "md",
  showImage: _showImage = true,
}) => {
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

  const getEyePosition = (_isLeft: boolean) => {
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

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-32 h-32";
      case "md":
        return "w-40 h-40";
      case "lg":
        return "w-48 h-48";
      case "xl":
        return "w-60 h-60";
      default:
        return "w-40 h-40";
    }
  };

  return (
    <div
      ref={mascotRef}
      className={clsx(
        "mascot-glass-container relative overflow-hidden",
        getSizeClasses(),
        className
      )}
      style={{
        background: "rgba(255, 255, 255, 0.28)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderRadius: "50%",
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.5),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1),
          inset 0 0 40px 20px rgba(255, 255, 255, 0.02),
          0 0 100px 50px rgba(253, 163, 69, 0.5),
          0 0 150px 75px rgba(255, 255, 255, 1),
          0 0 200px 100px rgba(253, 163, 69, 0.5)
        `,
      }}
    >
      {/* Оранжевый блюр компонент сзади стекла */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-full "
        style={{
          background:
            "radial-gradient(circle, rgba(253, 163, 69, 1) 0%, rgba(253, 163, 69, 0.5) 50%, transparent 100%)",
          filter: "blur(60px)",
          transform: "scale(1.2)",
        }}
      />
      <div
        className="absolute top-[-100px] left-0 w-full h-full rounded-full "
        style={{
          background:
            "radial-gradient(circle, rgba(253, 163, 69, 0.4) 0%, rgba(253, 163, 69, 0.5) 50%, transparent 100%)",
          filter: "blur(60px)",
          transform: "scale(1.2)",
        }}
      />

      {/* Белый блюр компонент сзади стекла */}
      <div
        className="absolute top-0 right-0 w-full h-full rounded-full "
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 60%, transparent 100%)",
          filter: "blur(120px)",
          transform: "scale(0.8) translate(10px, -5px)",
        }}
      />
      <div
        className="absolute bottom-[0px] right-0 w-full h-full rounded-full "
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.5) 60%, transparent 100%)",
          filter: "blur(120px)",
          transform: "scale(0.8) translate(10px, -5px)",
        }}
      />
      <div
        className="absolute top-[200px] right-0 w-full h-full rounded-full "
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 60%, transparent 100%)",
          filter: "blur(120px)",
          transform: "scale(0.8) translate(10px, -5px)",
        }}
      />

      {/* Верхний градиент */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
        }}
      />

      {/* Белые точки-глаза */}
      <div
        className="absolute w-[10px] h-[10px] rounded-full bg-white transition-transform duration-100 ease-out"
        style={{
          top: "30%",
          left: "50%",
          transform: `translate(calc(-50% - 11.5px), -50%) translate(${
            getEyePosition(true).x
          }px, ${getEyePosition(true).y}px)`,
        }}
      />
      <div
        className="absolute w-[10px] h-[10px] rounded-full bg-white transition-transform duration-100 ease-out"
        style={{
          top: "30%",
          left: "50%",
          transform: `translate(calc(-50% + 11.5px), -50%) translate(${
            getEyePosition(false).x
          }px, ${getEyePosition(false).y}px)`,
        }}
      />

      {/* Левый градиент */}
      <div
        className="absolute top-0 left-0 w-px h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))",
        }}
      />

      {/* Светящаяся граница (border) */}
      <div
        className="absolute inset-[-3px] rounded-full"
        style={{
          background: "transparent",
          border: "2px solid rgba(255, 255, 255, 0.8)",
          filter: "blur(1px)",
        }}
      />

      {/* Дополнительное внешнее свечение */}
      <div
        className="absolute inset-[-8px] rounded-full"
        style={{
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          filter: "blur(3px)",
        }}
      />

      {/* Мягкое внешнее свечение */}
      <div
        className="absolute inset-[-15px] rounded-full"
        style={{
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};
