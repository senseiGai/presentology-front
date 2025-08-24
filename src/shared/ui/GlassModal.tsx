import React, { useEffect } from "react";
import clsx from "clsx";
import { GlassContainer } from "./GlassContainer";

interface GlassModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  backdropClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "bottom";
}

export const GlassModal: React.FC<GlassModalProps> = ({
  children,
  isOpen,
  onClose,
  className,
  backdropClassName,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  position = "center",
}) => {
  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape || !onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Блокировка скролла body
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-[350px] max-w-sm";
      case "md":
        return "w-[450px] max-w-md";
      case "lg":
        return "w-[600px] max-w-lg";
      case "xl":
        return "w-[800px] max-w-xl";
      case "full":
        return "w-full h-full";
      default:
        return "w-[450px] max-w-md";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "items-start pt-20";
      case "bottom":
        return "items-end pb-20";
      case "center":
      default:
        return "items-center justify-center";
    }
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[100] flex",
        getPositionClasses(),
        "p-4"
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop с blur эффектом */}
      <div
        className={clsx(
          "absolute inset-0 bg-black/30 backdrop-blur-[10px]",
          backdropClassName
        )}
      />

      {/* Контент модалки */}
      <div
        className={clsx(
          "relative z-10 animate-[modalIn_.2s_ease-out]",
          getSizeClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassContainer
          variant="modal"
          blur="lg"
          rounded="xl"
          padding="lg"
          border
          className={clsx("shadow-2xl", className)}
        >
          {children}
        </GlassContainer>
      </div>
    </div>
  );
};
