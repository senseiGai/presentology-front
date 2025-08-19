"use client";

import React, { useEffect } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import { passwordRules } from "../lib/passwordRules";
import { useRegisterStore } from "../model/use-registration-store";

import { useRouter } from "next/navigation";

export const RegistrationBlock = () => {
  const router = useRouter();
  const {
    email,
    password,
    confirmPassword,
    isLoading,

    emailError,
    confirmPasswordError,

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit();
    if (!isLoading) {
      router.push("/survey");
    }
  };

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row justify-between">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <h2 className="mt-[48px]">Регистрация</h2>

        <form className="mt-[40px] w-full" onSubmit={handleSubmit}>
          <InputField
            label="Электронная почта"
            placeholder="example@provider.com"
            value={email}
            onChange={setEmail}
            onBlur={setEmailTouched}
            isError={!!emailError && emailTouched}
          />

          {/* {!!emailError && (
            <p className="text-[#FF514F] text-[12px] font-medium mt-[8px]">
              Пользователь с такой почтой уже существует
            </p>
          )} */}

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
            onBlur={setConfirmPasswordTouched} // 👈
            type="password"
            isError={!!confirmPasswordError && confirmPasswordTouched}
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
          />
        </form>

        <p className="mt-[135px] max-w-[356px] text-[12px] leading-[18px] tracking-[-0.2px] text-[#BEBEC0] font-normal">
          Продолжая регистрацию и вход, вы соглашаетесь с Пользовательским
          соглашением, Политикой конфиденциальности, Политикой
          возвратов и даёте Согласие на обработку персональных данных
        </p>
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
