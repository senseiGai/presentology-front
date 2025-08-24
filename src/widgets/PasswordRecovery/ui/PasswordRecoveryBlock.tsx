"use client";

import React, { useEffect } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import ArrowLeft from "../../../../public/icons/ArrowLeft";

import { useRouter } from "next/navigation";
import { usePasswordRecoveryStore } from "../model/use-recovery-store";

export const PasswordRecoveryBlock = () => {
  const router = useRouter();
  const {
    email,
    emailError,
    success,
    resendCooldown,
    setEmail,
    setEmailTouched,
    submit,
    resend,
    resentSuccess,
    reset,
  } = usePasswordRecoveryStore();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched();
    await submit();
  };

  const handleResend = async () => {
    await resend();
  };

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row justify-between gap-x-[51px]">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <div className="flex flex-row items-center gap-x-[16px] mt-[48px]">
          <button
            onClick={() => router.back()}
            className="bg-[#F4F4F4] cursor-pointer rounded-[8px] w-[40px] h-[40px] flex items-center justify-center hover:bg-[#E9E9E9] transition-colors"
          >
            <ArrowLeft />
          </button>
          <h2>Восстановление пароля</h2>
        </div>

        <p className="mt-[16px] text-[#BEBEC0] text-[14px] font-[500]">
          Ссылка для восстановления придёт на вашу почту
        </p>

        <form className="mt-[40px] w-full" onSubmit={handleSubmit}>
          <InputField
            label="Электронная почта"
            placeholder="example@provider.com"
            value={email}
            onChange={setEmail}
            onBlur={setEmailTouched}
            isError={!!emailError}
          />

          <Button
            type="submit"
            variant="primary"
            className="mt-[24px]"
            label={"Отправить"}
            disabled={!email || !!emailError || success}
          />
        </form>
        {success && (
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
        )}
      </div>

      <div className="ml-auto relative h-[784px]">
        <Image
          src="/assets/registration_mask.webp"
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
