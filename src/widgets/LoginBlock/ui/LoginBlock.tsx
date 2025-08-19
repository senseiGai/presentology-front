"use client";

import React from "react";
import { SocialButton } from "@/shared/ui/SocialButton";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";

import { useLoginStore } from "../model/use-login-store";
import { useRouter } from "next/navigation";

import LogoIcon from "../../../../public/icons/Logo";
import { socials } from "../lib/socials";
import Link from "next/link";
import { ErrorCard } from "@/features/ErrorCard/ui/ErrorCard";

export const LoginBlock = () => {
  const router = useRouter();
  const {
    email,
    password,
    isLoading,
    emailError,
    passwordError,
    unknownError,
    setEmail,
    setPassword,
    login,
  } = useLoginStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, password);
    }
  };

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row justify-between 2xl:pb-[24px]">
      <div className="flex flex-col">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <h2 className="mt-[48px]">Вход</h2>
        <div className="flex flex-row items-center mt-[24px] gap-x-[8px]">
          {socials.map((social, index) => (
            <SocialButton key={index} icon={social.icon} href={social.href} />
          ))}
        </div>
        <div className="flex flex-row items-center mt-[40px]">
          <div className="h-[1px] w-[156.5px] bg-[#E9E9E9]" />
          <span className="text-[#BEBEC0] text-[14px] font-[500] mx-[8px]">
            Или
          </span>
          <div className="h-[1px] w-[156.5px] bg-[#E9E9E9]" />
        </div>
        <form className="mt-[40px] w-full" onSubmit={handleSubmit}>
          <InputField
            label="Электронная почта"
            placeholder="example@provider.com"
            value={email}
            onChange={setEmail}
          />
          <InputField
            isError={!!passwordError}
            className="mt-[16px]"
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChange={setPassword}
            type="password"
          />
          <button
            onClick={() => router.push("/password-recovery")}
            type="button"
            className="text-[#BEBEC0] text-[14px] font-[500] mt-[8px] flex justify-end w-full cursor-pointer hover:text-[#A0A0A0] transition-colors"
          >
            Забыли пароль?
          </button>
        </form>
        <Button
          type="submit"
          variant="primary"
          disabled={!email || !password || isLoading}
          className="mt-[24px]"
          label={isLoading ? "Вход..." : "Войти"}
          onClick={() =>
            handleSubmit({ preventDefault: () => {} } as React.FormEvent)
          }
        />
        {emailError && (
          <p className="mt-[16px] text-[#FF514F] text-[12px] font-medium max-w-[356px] leading-tight">
            Аккаунт с указанной почтой не найден. Убедитесь, что вы ввели
            корректный адрес или зарегистрируйтесь
          </p>
        )}
        <div className="flex flex-row items-center mt-[158px]">
          <div className="h-[1px] w-[119.5px] bg-[#E9E9E9]" />
          <span className="text-[#BEBEC0] text-[14px] font-[500] mx-[8px]">
            Еще не с нами?
          </span>
          <div className="h-[1px] w-[119.5px] bg-[#E9E9E9]" />
        </div>
        <Button
          variant="ghost"
          className="mt-[16px]"
          label="Зарегистрироваться"
          onClick={() => router.push("/registration")}
        />
        {unknownError && (
          <div className="absolute bottom-[35px]">
            <ErrorCard />
          </div>
        )}
      </div>
      <div className="ml-auto relative h-[784px]">
        <Image
          src="/assets/login_mask.webp"
          alt="Login Illustration"
          className="w-[809px] h-full"
          width={809}
          height={784}
        />
        <Link href="#" className="absolute right-4 bottom-[14px]">
          <Image
            src="/assets/logos_telegram.webp"
            alt="Login Illustration"
            className="ml-auto"
            width={55}
            height={55}
          />
        </Link>
        <Link href="#" className="absolute right-24 bottom-[14px]">
          <Image
            src="/assets/logos_vk.webp"
            alt="Login Illustration"
            className="ml-auto"
            width={55}
            height={55}
          />
        </Link>
      </div>
    </section>
  );
};
