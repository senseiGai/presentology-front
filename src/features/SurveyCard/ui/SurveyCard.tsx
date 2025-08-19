import clsx from "clsx";

interface SurveyCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const SurveyCard = ({ label, isSelected, onClick }: SurveyCardProps) => {
  const isOther = label.toLowerCase() === "другое";

  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-[8px] w-[174px] h-[90px] text-center text-[14px] text-[#0B0911] font-medium transition-all cursor-pointer",
        isSelected
          ? isOther
            ? "bg-primary text-white"
            : "bg-black text-white"
          : "bg-[#F4F4F4] text-black hover:bg-[#E9E9E9]"
      )}
    >
      {label}
    </button>
  );
};
