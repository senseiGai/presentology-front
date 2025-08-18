// shared/ui/InputField.tsx
import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";

type Props = {
  label: string;
  placeholder: string;
  type?: "text" | "password";
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export const InputField = ({
  label,
  placeholder,
  type = "text",
  className = "",
  value,
  onChange,
}: Props) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`flex flex-col gap-2 ${className} w-full`}>
      <label className="text-[12px] font-[400] text-[#8F8F92]">{label}</label>
      <div className="relative">
        <input
          type={isPassword && !show ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-[8px] outline-none border border-gray-200 px-4 h-[40px] text-[14px] placeholder-[#BEBEC0] focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
