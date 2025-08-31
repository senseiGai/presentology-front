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
  period?: string; // e.g., "/ месяц"
  sublabel?: string; // short muted text under the price line
  features: string[]; // bullet list
  ctaLabel?: string; // button label
  onClick?: () => void; // button handler
  accent?: "lilac" | "orange" | "gray"; // color accent for dots/cta
  badge?: string; // small pill in header (e.g., "Ваш тариф")
  badgeType?: "default" | "discount"; // тип бейджа для стилизации
  current?: boolean; // if true, renders a disabled state ("Уже ваш")
  disabled?: boolean; // disables CTA
  highlight?: boolean; // slightly emphasized card
  className?: string;
  isSmall?: boolean; // for more compact cards (not used here)
  isPremium?: boolean; // for premium badge (not used here)
  cancelSubscription?: () => void; // for cancel subscription button (not used here)
  isCancelSubscription?: boolean; // loading state for cancel button (not used here)
  isActionButton?: boolean; // if true, shows action button (not used here)
  customHeight?: string; // custom height for the card
};

export function PricingCard({
  title,
  price = 0,
  originalPrice,
  period = "/ месяц",
  sublabel,
  features,
  ctaLabel = "Подключить",
  onClick,
  accent = "lilac",
  badge,
  badgeType = "default",
  current,
  highlight,
  className,
  isSmall,
  isPremium,
  cancelSubscription,
  isCancelSubscription,
  isActionButton = true,
  customHeight,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "group relative flex w-full max-w-[280px] flex-col justify-between rounded-[24px] transition-all hover:shadow-md",
        highlight && "ring-2 ring-black/5",
        className,
        current ? "bg-#E9E9E9 border-[1px] border-black/5" : "bg-[#F4F4F4]",
        customHeight ? customHeight : isSmall ? "h-[480px]" : "h-[529px]"
      )}
      role="region"
      aria-label={`Тариф ${title}`}
    >
      <div className="p-[24px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-[#0B0911]">{title}</h3>
          {badge && (
            <span
              className={cn(
                "rounded-[4px] px-2 py-1 text-[12px] font-medium",
                badgeType === "discount"
                  ? "bg-gradient-to-r from-[#FDA345] to-[#BBA2FE] text-white"
                  : "bg-[#DDF3E4] text-[#18794E]"
              )}
            >
              {badge}
            </span>
          )}
          {isPremium && isCancelSubscription && (
            <button
              onClick={cancelSubscription}
              className="text-[14px] font-medium text-[#8F8F92] cursor-pointer hover:text-[#6F6F72] transition-colors"
            >
              Отключить
            </button>
          )}
        </div>

        {/* Price line */}
        <div
          className={`${
            isSmall ? "mt-[12px]" : "mt-[16px]"
          } flex items-end gap-2`}
        >
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
        <ul
          className={`mt-[32px] ${
            isSmall ? "space-y-[12px]" : "space-y-[16px]"
          }`}
        >
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

      {isActionButton && (
        <div className="px-[16px]">
          {current ? (
            <button
              disabled={!isPremium}
              className={`mb-[16px] w-full h-[52px] ${
                !isPremium
                  ? "cursor-not-allowed text-[#BEBEC0]"
                  : "cursor-pointer"
              } rounded-[8px] bg-[#F4F4F4] text-[18px] font-normal `}
            >
              {isPremium ? "Подключить" : "Уже ваш"}
            </button>
          ) : (
            <button
              onClick={onClick}
              disabled={isPremium}
              className={cn(
                "w-full h-[52px] mb-[16px]  rounded-[8px] text-white text-[18px] font-normal transition-transform active:scale-[0.99]",
                isPremium
                  ? "cursor-not-allowed bg-gradient-to-r from-[#FDA345] to-[#BBA2FE] opacity-50"
                  : accent === "orange"
                  ? "bg-gradient-to-r from-[#FDA345] to-[#BBA2FE] cursor-pointer"
                  : accent === "gray"
                  ? "bg-gray-700"
                  : "bg-gradient-to-r from-violet-400 to-indigo-500"
              )}
            >
              {isPremium ? "Ваш тариф" : ctaLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
