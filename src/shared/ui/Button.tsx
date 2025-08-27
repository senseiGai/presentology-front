import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "primary";
  className?: string;
  type?: "button" | "submit" | "reset";
};

export const Button = ({
  label,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
  children,
}: ButtonProps) => {
  const base =
    "rounded-[8px] h-[52px] w-full flex items-center justify-center transition font-medium text-[18px] cursor-pointer";

  const variants: Record<string, string> = {
    primary: disabled
      ? "bg-[#DDD1FF] text-white cursor-not-allowed "
      : "bg-primary text-white hover:opacity-90 active:scale-[0.98] ",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "bg-[#F4F4F4] text-[#0B0911] ",
  };

  return (
    <button
      type={type}
      className={clsx(base, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children || label}
    </button>
  );
};
