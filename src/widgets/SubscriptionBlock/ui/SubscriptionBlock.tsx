"use client";

import React, { useEffect, useState } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { usePromoCodeStore } from "../model/use-promo-code-store";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import ArrowLeft from "../../../../public/icons/ArrowLeft";
import { Check, X } from "lucide-react";

import { useRouter } from "next/navigation";

export const SubscriptionBlock = () => {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);

  const {
    enteredCode,
    appliedPromo,
    isValid,
    originalPrice,
    discountedPrice,
    setEnteredCode,
    validatePromoCode,
    clearPromoCode,
  } = usePromoCodeStore();

  //   useEffect(() => {
  //     return () => reset();
  //   }, [reset]);

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setEmailTouched();
  //     await submit();
  //   };

  //   const handleResend = async () => {
  //     await resend();
  //   };

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row justify-between gap-x-[51px]">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <div className="flex flex-row items-center gap-x-[16px] mt-[48px]">
          <h2>Оплата подписки</h2>
        </div>

        <div className="mt-[40px] flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#000000] text-[14px] font-medium">
              Старт
            </span>
            <span className="text-[#C8C8C8] mt-[6px] text-[14px] font-medium">
              Счет выставляется ежемесячно
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="block text-[#000000] text-[24px] font-medium">
              {originalPrice} ₽
            </span>
          </div>
        </div>

        <div className="bg-[#E5E5E5] h-[1px] w-full mt-[24px]" />

        <form className="mt-[24px] w-full">
          <div className="relative">
            <InputField
              label="Промокод"
              placeholder="Введите промокод"
              value={enteredCode}
              onChange={(value) => {
                setEnteredCode(value);
                // Валидация происходит только после снятия фокуса
                // При изменении кода сбрасываем предыдущие результаты валидации
              }}
              onBlur={() => {
                // Валидация происходит после снятия фокуса с инпута
                validatePromoCode();
              }}
              isError={isValid === false}
            />

            {/* Индикатор статуса промокода */}
            {isValid !== null && (
              <div className="absolute right-3 top-[39px] flex items-center">
                {isValid && <Check size={16} className=" text-[#00CF1B]" />}
              </div>
            )}

            {/* Сообщения о статусе */}
            {isValid === false && (
              <p className="text-red-500 text-[12px] mt-1">
                Промокод не действителен
              </p>
            )}
          </div>

          <div className="bg-[#E5E5E5] h-[1px] w-full mt-[24px]" />

          <div className="flex flex-row items-center justify-between mt-[24px]">
            <span className="text-[#000000] text-[14px] font-medium">
              Итого к оплате
            </span>
            <div className="flex items-center gap-2">
              {appliedPromo && (
                <span className="text-[#C8C8C8] text-[18px] font-medium line-through">
                  {originalPrice} ₽
                </span>
              )}
              <span className="block text-[#000000] text-[24px] font-medium">
                {discountedPrice} ₽
              </span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-[24px] space-y-4">
            <Checkbox
              checked={agreeToTerms}
              onChange={setAgreeToTerms}
              label={
                <p className="max-w-[316px] text-[12px] leading-[130%] tracking-tighter">
                  Я принимаю{" "}
                  <button
                    type="button"
                    className="underline cursor-pointer hover:text-[#9B82FE] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Открыть условия публичной оферты");
                    }}
                  >
                    условия публичной оферты
                  </button>{" "}
                  и{" "}
                  <button
                    type="button"
                    className="underline cursor-pointer hover:text-[#9B82FE] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Открыть условия оформления подписки");
                    }}
                  >
                    условия оформления подписки
                  </button>
                  . Оплата будет списываться один раз в месяц до момента её
                  отмены, начиная с текущей даты. Автопродление активируется
                  автоматически, но вы можете отключить его в личном кабинете в
                  любое время
                </p>
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="mt-[24px]"
            label={"Далее"}
            disabled={!agreeToTerms}
            // disabled={!email || !!emailError || success}
          />
        </form>
        <div className="flex flex-row items-center gap-x-[24px] mt-auto">
          <Link
            href="#"
            className="scursor-pointer text-[#C0C0C0] hover:underline hover:text-[#9B82FE] transition-colors ease-in-out"
          >
            Политика возврата
          </Link>
          <Link
            href="#"
            className="scursor-pointer text-[#C0C0C0] hover:underline hover:text-[#9B82FE] transition-colors ease-in-out"
          >
            Платежные реквизиты
          </Link>
        </div>
        {/* {success && (
          <>
            <p className="text-green-500 text-[14px] font-medium mt-[16px]">
              Ссылка отправлена. Проверьте почту
            </p>

            <p className="text-[#BEBEC0] text-[14px] font-medium mt-[16px] tracking-[-0.4px]">
              Не получили письмо?{" "}
              {resendCooldown > 0 ? (
                <span>
                  Прислать повторно через 00:
                  {resendCooldown.toString().padStart(2, "0")}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resentSuccess}
                  className={`text-[18px] bg-[#F4F4F4] font-normal ml-[12px] tracking-[-0.4px] w-[196px] h-[40px] rounded-[8px] cursor-pointer transition-colors ${
                    resentSuccess
                      ? "text-[#BEBEC0] cursor-not-allowed"
                      : " text-[#0B0911]  hover:bg-[#E9E9E9]"
                  }`}
                >
                  Прислать повторно
                </button>
              )}
            </p>

            {resentSuccess && (
              <p className="text-green-500 text-[14px] font-medium mt-[16px]">
                Ссылка отправлена повторно. Проверьте почту
              </p>
            )}
          </>
        )} */}
      </div>

      <div className="ml-auto relative h-[784px]">
        <Image
          src="/assets/subscription/subscription_mask.png"
          alt="Login Illustration"
          className="w-[809px] h-full"
          width={809}
          height={784}
        />
        <Link href="#" className="absolute right-4 bottom-[14px]">
          <Image
            src="/assets/logos_telegram.webp"
            alt="Telegram"
            className="ml-auto"
            width={55}
            height={55}
          />
        </Link>
        <Link href="#" className="absolute right-24 bottom-[14px]">
          <Image
            src="/assets/logos_vk.webp"
            alt="VK"
            className="ml-auto"
            width={55}
            height={55}
          />
        </Link>
      </div>
    </section>
  );
};
