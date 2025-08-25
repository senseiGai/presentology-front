import React from "react";

// Tiny helper to join class names
function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ——————————————————————————————————————————————
// Reusable PricingCard
// ——————————————————————————————————————————————
export type PricingCardProps = {
  title: string; // e.g., "Пробуй" | "Создавай"
  price?: number | string; // e.g., 0 | 299 | "299"
  originalPrice?: string; // для зачеркнутой цены при скидке
  currency?: string; // e.g., "₽"
  period?: string; // e.g., "/ месяц"
  sublabel?: string; // short muted text under the price line
  features: string[]; // bullet list
  ctaLabel?: string; // button label
  onClick?: () => void; // button handler
  accent?: "lilac" | "orange" | "gray"; // color accent for dots/cta
  badge?: string; // small pill in header (e.g., "Ваш тариф")
  current?: boolean; // if true, renders a disabled state ("Уже ваш")
  disabled?: boolean; // disables CTA
  highlight?: boolean; // slightly emphasized card
  className?: string;
};

export function PricingCard({
  title,
  price = 0,
  originalPrice,
  currency = "₽",
  period = "/ месяц",
  sublabel,
  features,
  ctaLabel = "Подключить",
  onClick,
  accent = "lilac",
  badge,
  current,
  disabled,
  highlight,
  className,
}: PricingCardProps) {
  const isDisabled = disabled || current;

  return (
    <div
      className={cn(
        "group relative flex w-full max-w-[280px] h-[529px] flex-col justify-between rounded-[24px] transition-all hover:shadow-md",
        highlight && "ring-2 ring-black/5",
        className,
        current ? "bg-#E9E9E9 border-[1px] border-black/5" : "bg-[#F4F4F4]"
      )}
      role="region"
      aria-label={`Тариф ${title}`}
    >
      <div className="p-[24px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-[#0B0911]">{title}</h3>
          {badge && (
            <span className="rounded-[4px] bg-[#DDF3E4] px-2 py-1 text-[12px] font-medium text-[#18794E]">
              {badge}
            </span>
          )}
        </div>

        {/* Price line */}
        <div className="mt-[16px] flex items-end gap-2">
          {originalPrice && (
            <span className="text-[24px] font-medium leading-none text-[#BEBEC0] line-through mr-1">
              {originalPrice}₽
            </span>
          )}
          <span className="text-[24px] font-medium leading-none text-[#0B0911]">
            {price}₽
          </span>
          <span className="-mb-0.3 text-[11px] font-medium text-[#BEBEC0]">
            / {period}
          </span>
        </div>
        {sublabel && (
          <p className="mt-[16px] text-[13px] font-medium text-[#BEBEC0] leading-[120%] tracking-[-3%]">
            {sublabel}
          </p>
        )}

        {/* Feature list */}
        <ul className="mt-[32px] space-y-[16px]">
          {features.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-gray-800"
            >
              <span
                className={cn(
                  "mt-1 inline-block h-2 w-2 flex-none rounded-full bg-[#BBA2FE]"
                )}
                aria-hidden
              />
              <span className="text-[#0B0911] text-[14px] font-medium leading-[120%]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-[16px]">
        {current ? (
          <button
            disabled
            className="w-full h-[52px] cursor-not-allowed rounded-[8px] bg-[#F4F4F4] text-[18px] font-normal text-[#BEBEC0]"
          >
            Уже ваш
          </button>
        ) : (
          <button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
              "w-full h-[52px] cursor-pointer rounded-[8px] text-white text-[18px] font-normal transition-transform active:scale-[0.99]",
              isDisabled
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : accent === "orange"
                ? "bg-gradient-to-r from-[#FDA345] to-[#BBA2FE]"
                : accent === "gray"
                ? "bg-gray-700"
                : "bg-gradient-to-r from-violet-400 to-indigo-500"
            )}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
