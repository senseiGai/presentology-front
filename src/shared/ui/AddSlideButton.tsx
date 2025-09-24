import React from "react";
import PlusIcon from "../../../public/icons/PlusIcon";

interface AddSlideButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "compact" | "icon-only";
  className?: string;
  isLoading?: boolean;
}

export const AddSlideButton: React.FC<AddSlideButtonProps> = ({
  onClick,
  disabled = false,
  variant = "default",
  className = "",
  isLoading = false,
}) => {
  const baseClasses =
    "bg-[#BBA2FE] rounded-[8px] flex items-center justify-center text-white font-normal leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] active:bg-[#9B85FD] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#BBA2FE] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#BBA2FE]";

  const variantClasses = {
    default:
      "h-[52px] px-4 sm:px-6 pr-3 sm:pr-4 gap-2 text-[16px] sm:text-[18px] min-w-[160px] sm:min-w-[180px]",
    compact: "h-[40px] px-3 gap-1.5 text-[14px] min-w-[120px]",
    "icon-only": "h-[40px] w-[40px] p-2",
  };

  const iconSize = {
    default: { width: 20, height: 20, smWidth: 24, smHeight: 24 },
    compact: { width: 16, height: 16, smWidth: 18, smHeight: 18 },
    "icon-only": { width: 20, height: 20, smWidth: 20, smHeight: 20 },
  };

  const currentIconSize = iconSize[variant];

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {variant !== "icon-only" && <span className="ml-2">Загрузка...</span>}
        </>
      );
    }

    if (variant === "icon-only") {
      return (
        <PlusIcon
          fill="white"
          width={currentIconSize.width}
          height={currentIconSize.height}
        />
      );
    }

    return (
      <>
        {variant === "default" && (
          <>
            <span className="hidden sm:inline">Добавить слайд</span>
            <span className="sm:hidden">Добавить</span>
          </>
        )}
        {variant === "compact" && <span>Добавить</span>}
        <div
          className={`${
            variant === "default" ? "w-6 h-6 sm:w-8 sm:h-8" : "w-5 h-5"
          } flex items-center justify-center`}
        >
          <PlusIcon
            fill="white"
            width={currentIconSize.width}
            height={currentIconSize.height}
            className={variant === "default" ? "sm:w-[24px] sm:h-[24px]" : ""}
          />
        </div>
      </>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Добавить новый слайд"
      type="button"
    >
      {renderContent()}
    </button>
  );
};
