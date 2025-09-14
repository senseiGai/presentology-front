"use client";

import React, { useEffect } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import { passwordRules } from "../lib/passwordRules";
import { useRegisterStore } from "../model/use-registration-store";
import { useAuthStore } from "@/shared/stores";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";

export const RegistrationBlock = () => {
  const width = useWindowWidth();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const middleWidth = width > 1600;
  const topWidth = width > 1800;

  const {
    email,
    password,
    confirmPassword,
    isLoading,

    emailError,
    confirmPasswordError,
    unknownError,

    setConfirmPasswordTouched,
    setEmailTouched,

    emailTouched,
    confirmPasswordTouched,

    passwordStatus,
    setEmail,
    setPassword,
    setConfirmPassword,

    validateAndSubmit,
    reset,
  } = useRegisterStore();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await validateAndSubmit();
    if (success) {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
      }

      toast.success("Регистрация успешно завершена!");

      router.push("/home");
    }
  };

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row gap-x-[51px] justify-between">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <h2 className="mt-[48px]">Регистрация</h2>

        <form className="mt-[40px] w-full" onSubmit={handleSubmit}>
          <InputField
            className="mt-[16px]"
            label="Электронная почта"
            placeholder="example@provider.com"
            value={email}
            onChange={setEmail}
            onBlur={setEmailTouched}
            isError={!!emailError && emailTouched}
          />

          {!!emailError && emailTouched && (
            <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
              {emailError}
            </p>
          )}

          <InputField
            className="mt-[16px]"
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChange={setPassword}
            type="password"
          />

          <InputField
            className="mt-[16px]"
            label="Повторите пароль"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={setConfirmPassword}
            onBlur={setConfirmPasswordTouched}
            type="password"
            isError={!!confirmPasswordError && confirmPasswordTouched}
          />

          {!!confirmPasswordError && confirmPasswordTouched && (
            <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
              {confirmPasswordError}
            </p>
          )}

          {!!unknownError && (
            <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
              {unknownError}
            </p>
          )}

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

          <Button
            type="submit"
            variant="primary"
            disabled={
              !!emailError ||
              !!confirmPasswordError ||
              !passwordStatus.every(Boolean) ||
              !email ||
              !password ||
              !confirmPassword ||
              isLoading
            }
            className="mt-[24px]"
            label={isLoading ? "Регистрация..." : "Зарегистрироваться"}
            onClick={() => {
              console.log("Button clicked! Debug info:", {
                emailError,
                confirmPasswordError,
                passwordStatus,
                passwordStatusEvery: passwordStatus.every(Boolean),
                email,
                password,
                confirmPassword,
                isLoading,
                disabled: !!(
                  !!emailError ||
                  !!confirmPasswordError ||
                  !passwordStatus.every(Boolean) ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  isLoading
                ),
              });
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }}
          />
        </form>

        <p className="mt-auto max-w-[356px] text-[12px] leading-[18px] tracking-[-0.2px] text-[#BEBEC0] font-normal">
          Продолжая регистрацию и вход, вы соглашаетесь с Пользовательским
          соглашением, Политикой конфиденциальности, Политикой
          возвратов и даёте Согласие на обработку персональных данных
        </p>
      </div>

      <div className="ml-auto relative h-[784px]">
        {topWidth ? (
          <Image
            src="/assets/registration_top_mask.png"
            alt="Registration Illustration"
            className="w-[1329px] h-full"
            width={1329}
            height={784}
          />
        ) : middleWidth ? (
          <Image
            src="/assets/reg_middle_mask.png"
            alt="Registration Illustration"
            className="w-[1129px] h-full"
            width={1129}
            height={784}
          />
        ) : (
          <Image
            src="/assets/registration_mask.png"
            alt="Registration Illustration"
            className="w-[809px] h-full"
            width={809}
            height={784}
          />
        )}
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
