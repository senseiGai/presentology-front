"use client";

import React, { useEffect } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import ArrowLeft from "../../../../public/icons/ArrowLeft";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordStore } from "../model/use-reset-password-store";
import { passwordRules } from "@/widgets/RegistrationBlock/lib/passwordRules";

export const ResetPasswordBlock = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    successMessage,
    errorMessage,
    isLoading,
    passwordStatus,
    setPassword,
    setConfirmPassword,
    resetPassword,
    reset,
  } = useResetPasswordStore();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
    return () => reset();
  }, [token, router, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token && password && confirmPassword) {
      const success = await resetPassword(token, password, confirmPassword);
      if (success) {
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    }
  };

  if (!token) {
    return null;
  }

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row justify-between gap-x-[51px]">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <div className="flex flex-row items-center gap-x-[16px] mt-[48px]">
          <button
            onClick={() => router.push("/login")}
            className="bg-[#F4F4F4] cursor-pointer rounded-[8px] w-[40px] h-[40px] flex items-center justify-center hover:bg-[#E9E9E9] transition-colors"
          >
            <ArrowLeft />
          </button>
          <h2>Новый пароль</h2>
        </div>

        <p className="mt-[16px] text-[#BEBEC0] text-[14px] font-[500]">
          Введите новый пароль для вашего аккаунта
        </p>

        {successMessage ? (
          <div className="mt-[40px]">
            <p className="text-green-500 text-[16px] font-medium">
              {successMessage}
            </p>
            <p className="text-[#BEBEC0] text-[14px] font-medium mt-[16px]">
              Перенаправляем на страницу входа...
            </p>
          </div>
        ) : (
          <>
            <form className="mt-[40px] w-full" onSubmit={handleSubmit}>
              <InputField
                label="Новый пароль"
                placeholder="Введите новый пароль"
                value={password}
                onChange={setPassword}
                type="password"
                isError={!!passwordError}
              />

              <InputField
                className="mt-[16px]"
                label="Повторите пароль"
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
                isError={!!confirmPasswordError}
              />

              <p className="mt-[24px] text-[12px] text-[#C8C8C8] font-[400]">
                Пароль должен содержать:
              </p>
              {passwordRules.map((rule, index) => (
                <p
                  key={index}
                  className={`text-[12px] font-[400] ${
                    passwordStatus[index] ? "text-green-500" : "text-[#C8C8C8]"
                  }`}
                >
                  {rule}
                </p>
              ))}

              {confirmPasswordError && (
                <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
                  {confirmPasswordError}
                </p>
              )}

              {errorMessage && (
                <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="mt-[24px]"
                label={isLoading ? "Изменение пароля..." : "Изменить пароль"}
                disabled={
                  !password ||
                  !confirmPassword ||
                  !!passwordError ||
                  !!confirmPasswordError ||
                  !passwordStatus.every(Boolean) ||
                  isLoading
                }
              />
            </form>
          </>
        )}
      </div>

      <div className="ml-auto relative h-[784px]">
        <Image
          src="/assets/registration_mask.png"
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
