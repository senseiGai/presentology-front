import React from "react";
import clsx from "clsx";

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "modal";
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: "low" | "medium" | "high";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  border?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  variant = "light",
  blur = "md",
  opacity = "medium",
  rounded = "lg",
  border = false,
  padding = "md",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "light":
        return "bg-white/20";
      case "dark":
        return "bg-black/30";
      case "modal":
        return "bg-white/95";
      default:
        return "bg-white/20";
    }
  };

  const getBlurClasses = () => {
    switch (blur) {
      case "sm":
        return "backdrop-blur-sm";
      case "md":
        return "backdrop-blur-md";
      case "lg":
        return "backdrop-blur-lg";
      case "xl":
        return "backdrop-blur-xl";
      default:
        return "backdrop-blur-md";
    }
  };

  const getOpacityClasses = () => {
    switch (opacity) {
      case "low":
        return "bg-opacity-10";
      case "medium":
        return "bg-opacity-20";
      case "high":
        return "bg-opacity-40";
      default:
        return "bg-opacity-20";
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "xl":
        return "rounded-xl";
      case "full":
        return "rounded-full";
      default:
        return "rounded-lg";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "p-0";
      case "sm":
        return "p-2";
      case "md":
        return "p-4";
      case "lg":
        return "p-6";
      case "xl":
        return "p-8";
      default:
        return "p-4";
    }
  };

  return (
    <div
      className={clsx(
        // Основные стили стеклянного эффекта
        getVariantClasses(),
        getBlurClasses(),
        getOpacityClasses(),
        getRoundedClasses(),
        getPaddingClasses(),
        // Дополнительные стили
        border && "border border-white/20",
        "shadow-lg",
        // Пользовательские классы
        className
      )}
    >
      {children}
    </div>
  );
};
