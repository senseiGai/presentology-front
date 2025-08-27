"use client";

import React, { useEffect } from "react";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import Image from "next/image";
import LogoIcon from "../../../../public/icons/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SecureMasterCardIcon from "../../../../public/icons/SecureMasterCardIcon";
import SecureVisaIcon from "../../../../public/icons/SecureVisaIcon";
import SecureMirIcon from "../../../../public/icons/SecureMirIcon";
import { usePaymentStore } from "@/shared/stores/usePaymentStore";
import { Mascot } from "@/shared/ui";

export const PaymentMethodsBlock = () => {
  const router = useRouter();

  // Zustand store
  const {
    sendEmail,
    showCardForm,
    paymentSuccess,
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,
    email,
    emailError,
    cardNumberError,
    expiryDateError,
    cvvError,
    cardholderNameError,
    setSendEmail,
    setShowCardForm,
    setPaymentSuccess,
    setFormattedCardNumber,
    setFormattedExpiryDate,
    setFormattedCvv,
    setCardholderName,
    setEmail,
    validateCardForm,
  } = usePaymentStore();

  // Disable page scroll while this block is mounted (restore on unmount)
  useEffect(() => {
    const scrollY = window.scrollY || window.pageYOffset;

    // save previous inline styles to restore later
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;

    // lock scrolling by fixing body position and hiding overflow
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // prevent wheel and touch move
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });

    // also prevent space/arrow keys causing scroll
    const onKeyDown = (e: KeyboardEvent) => {
      const keys = [
        " ",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ];
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      // restore styles
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", onKeyDown as EventListener);

      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;

      // restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateCardForm();
    if (isValid) {
      // Simulate payment processing
      setTimeout(() => {
        setPaymentSuccess(true);
      }, 1000);
    }
  };

  const handleGoToHome = () => {
    router.push("/home");
  };

  // Check if all card fields are filled
  const isCardFormComplete = cardNumber && expiryDate && cvv && cardholderName;

  // If payment is successful, show success page
  if (paymentSuccess) {
    return (
      <section className="pt-[24px] pl-[40px] flex flex-row items-start justify-between gap-x-[51px] overflow-auto">
        <div className="flex flex-col w-[356px]">
          <div className="relative w-full">
            <LogoIcon />
          </div>

          <div className="mt-[48px]">
            <h2 className="text-[#000000] text-[24px] font-medium">
              Подписка успешно оплачена!
            </h2>
          </div>

          <div className="absolute bottom-4 w-[356px]">
            <Button
              variant="primary"
              label="На главную"
              onClick={handleGoToHome}
            />
          </div>
        </div>

        <div className="ml-auto relative h-[784px]">
          <div className="relative">
            <Image
              priority
              src="/assets/subscription/subscription_mask02.png"
              alt="Login Illustration"
              className="w-[809px] h-full"
              width={809}
              height={784}
            />
            <Button
              variant="ghost"
              className="absolute top-[334px] left-1/2 -translate-x-1/2 w-[292px] max-w-[292px]"
              label="Перейти к подписке"
              onClick={handleGoToHome}
            />
            <Mascot className="!absolute w-[429px] h-[429px] bottom-[-120px] left-[330px] transform -translate-x-1/2 -rotate-[-9.65deg]" />
          </div>
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
  }

  return (
    <section className="pt-[24px] pl-[40px] flex flex-row items-start justify-between gap-x-[51px] overflow-auto">
      <div className="flex flex-col w-[356px]">
        <div className="relative w-full">
          <LogoIcon />
        </div>
        <div className="flex flex-row items-center gap-x-[16px] mt-[48px]">
          <h2>Метод оплаты</h2>
        </div>

        <div className="mt-[40px] flex flex-row items-center justify-between">
          <span className="text-[#000000] text-[14px] font-medium">
            Покупка подписки Старт
          </span>
          <span className="text-[#000000] text-[24px] font-medium">490 ₽</span>
        </div>

        <div className="flex flex-row items-center gap-x-4 mt-[24px]">
          <span className="text-[14px] font-medium text-[#0A0A0A]">
            Отправить квитанцию на почту
          </span>
          <Checkbox checked={sendEmail} onChange={setSendEmail} />
        </div>

        <form className="mt-[8px] w-full">
          <div className="relative">
            <InputField
              label="Электронная почта"
              placeholder="example@provider.com"
              value={email}
              onChange={setEmail}
              isError={emailError}
            />
            {emailError && (
              <span className="text-[#FF514F] text-[12px] absolute top-full mt-1 mb-[24px] block">
                Недопустимый адрес
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="ghost"
            className={`${emailError ? "mt-[32px]" : "mt-[24px]"}`}
          >
            <Image src="/sbp-icon.svg" alt="SBP Icon" width={64} height={32} />
          </Button>
          <Button type="submit" variant="ghost" className="mt-[8px]">
            <Image src="/t-pay.svg" alt="TPay Icon" width={72} height={32} />
          </Button>
          <Button
            variant="ghost"
            className="mt-[8px]"
            label="Банковской картой"
            onClick={() => setShowCardForm(true)}
          />
        </form>

        {showCardForm && (
          <form onSubmit={handleCardPayment} className="mt-[24px] space-y-4">
            <div className={`${cardNumberError ? "mb-[36px]" : ""} relative`}>
              <InputField
                label="Данные карты"
                placeholder="1234 5678 1234 5678"
                value={cardNumber}
                onChange={setFormattedCardNumber}
                isError={cardNumberError}
              />
              {cardNumberError && (
                <span className="text-[#FF514F] text-[12px] absolute top-full mt-1 mb-[24px] block">
                  Неверный номер карты
                </span>
              )}
            </div>

            <div
              className={`${
                expiryDateError || cvvError ? "mt-[36px] mb-[36px]" : ""
              } flex gap-4`}
            >
              <div className="relative flex-1">
                <InputField
                  label="ММ/ГГ"
                  placeholder="ММ/ГГ"
                  value={expiryDate}
                  onChange={setFormattedExpiryDate}
                  className="flex-1"
                  isError={expiryDateError}
                />
                {expiryDateError && (
                  <span className="text-[#FF514F] text-[12px] absolute top-full mt-1 mb-[24px] block">
                    Неверная дата
                  </span>
                )}
              </div>
              <div className="relative flex-1">
                <InputField
                  label="Код CVV/CVC"
                  placeholder="123"
                  value={cvv}
                  onChange={setFormattedCvv}
                  className="flex-1"
                  isError={cvvError}
                />
                {cvvError && (
                  <span className="text-[#FF514F] text-[12px] absolute top-full mt-1 mb-[24px] block">
                    Неверный CVV/CVC
                  </span>
                )}
              </div>
            </div>

            <div
              className={`relative ${cardholderNameError ? "mt-[36px]" : ""}`}
            >
              <InputField
                label="Имя владельца карты"
                placeholder="Имя Фамилия"
                value={cardholderName}
                onChange={setCardholderName}
                isError={cardholderNameError}
              />
              {cardholderNameError && (
                <span className="text-[#FF514F] text-[12px] absolute top-full mt-1 mb-[24px] block">
                  Неверное имя
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className={`${
                cardholderNameError ? "mt-[40px]" : ""
              } mt-[16px] bg-[#BBA2FE] hover:bg-[#A685FE] ${
                !isCardFormComplete ? "opacity-50 cursor-not-allowed" : ""
              }`}
              label="Оплатить"
              disabled={!isCardFormComplete}
            />
          </form>
        )}
        <div
          className={`${
            showCardForm ? "pb-[24px] mt-[66px]" : "mt-[227px]"
          } flex flex-row items-center justify-between w-full`}
        >
          <SecureVisaIcon />
          <SecureMasterCardIcon />
          <SecureMirIcon />
        </div>
      </div>

      <div className="ml-auto relative h-[784px]">
        <Image
          priority
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
