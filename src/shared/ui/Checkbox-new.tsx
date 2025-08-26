import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className = "",
  id,
}: CheckboxProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex-shrink-0 mt-1">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={checkboxId}
          className={`
            ${sizeClasses[size]}
            border-2 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center
            ${
              checked
                ? "bg-[#BBA2FE] border-[#BBA2FE] text-white"
                : "bg-white border-[#E5E5E5] hover:border-[#BBA2FE]"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}
          `}
        >
          {checked && (
            <Check
              size={iconSizes[size]}
              className="text-white"
              strokeWidth={2.5}
            />
          )}
        </label>
      </div>

      {label && (
        <div
          className={`
            ${textSizes[size]}
            text-[#0B0911] font-medium cursor-pointer select-none leading-[1.4]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={handleChange}
        >
          {label}
        </div>
      )}
    </div>
  );
};
