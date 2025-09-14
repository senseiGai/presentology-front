"use client";

import React from "react";
import Sidebar from "@/features/SideBar/ui/SideBar";
import { CreatePresentationCard } from "@/features/CreatePresentationCard/ui/CreatePresentationCard";

import LogoElement from "../../../../public/icons/LogoElement";
import { createCards } from "../lib/createCards";

import { useSideBarStore } from "@/features/SideBar/model/use-sidebar-store";
import HeadphonesIcon from "../../../../public/icons/HeadphonesIcon";
import { PresentationCard } from "@/features/PresentationCard/ui/PresentationCard";
import { PricingCard } from "@/entities/SubscriptionCard/ui/SubscriptionCard";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";
import {
  PaymentHistoryTable,
  type PaymentHistoryItem,
} from "@/shared/ui/PaymentHistoryTable";
import { useSubscriptionStore } from "@/shared/stores";
import { CancelSubPopup, OfferPopup } from "@/entities/SubscriptionPopup";
import { useSurveyStatus } from "@/shared/hooks/useSurvey";
import { useRouter } from "next/navigation";

export const HomeBlock = () => {
  const { activeItem } = useSideBarStore();
  const windowWidth = useWindowWidth();
  const router = useRouter();

  // Проверяем статус опроса
  const {
    data: surveyStatus,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurveyStatus();

  const {
    isPremium,
    hasDiscount,
    showCancelPopup,
    showOfferPopup,
    openCancelPopup,
    closeCancelPopup,
    closeOfferPopup,
    cancelSubscription,
    stayWithDiscount,
    activateDiscount,
  } = useSubscriptionStore();

  // isSmall только на экранах меньше 1535px
  const isSmall = windowWidth < 1535;

  // Отладочная информация для статуса опроса
  console.log("Survey Status Debug:", {
    surveyStatus,
    surveyLoading,
    surveyError,
    hasCompletedSurvey: surveyStatus?.hasCompletedSurvey,
  });

  // Моковые данные для истории платежей
  const paymentHistory: PaymentHistoryItem[] = [
    { date: "31 июля 2025, 16:30", amount: "299 ₽", status: "Успешно" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Успешно" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Успешно" },
    { date: "31 августа 2025, 22:30", amount: "299 ₽", status: "Ошибка" },
  ];

  const presentationsContent = [
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Улучшенная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Сгенерированная",
    },
    {
      images: [
        "/assets/presentation/presentation01.png",
        "/assets/presentation/presentation01.png",
      ],
      label: "Название презентации",
      date: "Вчера",
      tag: "Улучшенная",
    },
  ];

  return (
    <section className="flex flex-row gap-x-[24px] 2xl:gap-x-[20px] mt-[24px] relative">
      <Sidebar />
      <div>
        <div className="flex flex-row items-center">
          <h1 className="mr-[23px]">
            {activeItem === "Создать презентацию" && "СОЗДАТЬ"}
            {activeItem === "Мои презентации" && "МОИ"}
            {activeItem === "Приобрести подписку" && "ЛИЧНЫЙ"}
          </h1>
          <LogoElement />
          <h1 className="ml-[23px]">
            {activeItem === "Создать презентацию" && "ПРЕЗЕНТАЦИЮ"}
            {activeItem === "Мои презентации" && "ПРЕЗЕНТАЦИИ"}
            {activeItem === "Приобрести подписку" && "КАБИНЕТ"}
          </h1>
        </div>
        <div
          className={`${
            activeItem === "Мои презентации" ||
            activeItem === "Приобрести подписку"
              ? "overflow-y-auto max-h-[580px] 2xl:max-h-[674px]"
              : ""
          }  pb-[24px] flex-1`}
        >
          {activeItem === "Создать презентацию" && (
            <div className="flex flex-row gap-x-4 mt-[24px] 2xl:mt-[40px]">
              {createCards(router).map((item, index) => {
                return (
                  <CreatePresentationCard
                    key={index}
                    label={item.label}
                    description={item.description}
                    image={item.image}
                    onClick={item.onClick}
                  />
                );
              })}
            </div>
          )}
          {activeItem === "Мои презентации" &&
            (presentationsContent.length === 0 ? (
              <h2 className="text-white mt-[24px] 2xl:mt-[40px]">
                Создайте презентацию и она появится здесь
              </h2>
            ) : (
              <div className="grid grid-cols-3 gap-[24px] 2xl:gap-[20px] mt-[40px]">
                {presentationsContent.map((item, index) => (
                  <PresentationCard
                    key={index}
                    label={item.label}
                    images={item.images}
                    date={item.date}
                    tag={
                      item.tag as
                        | "Сгенерированная"
                        | "Улучшенная"
                        | "По брендбуку"
                    }
                  />
                ))}
              </div>
            ))}
          {activeItem === "Приобрести подписку" && (
            <div className="flex flex-row gap-x-[40px] mt-[24px] 2xl:mt-[40px]">
              <div className="flex flex-col">
                <h2 className="text-white">Подписка</h2>
                <div className="flex flex-row gap-x-[16px] mt-[16px]">
                  <PricingCard
                    isPremium={isPremium}
                    isSmall={isSmall}
                    className="bg-[#FFFFFF]"
                    title="Пробуй"
                    price={0}
                    period="месяц"
                    badge="Ваш тариф"
                    sublabel="Для тестирования сервиса и разовой подготовки презентаций"
                    features={[
                      "1 презентация в месяц",
                      "До 10 слайдов",
                      "Экспорт в PDF",
                      "Полный доступ к дизайнам и шаблонам",
                      "Лучшие ИИ‑модели для текста и картинок",
                    ]}
                    current
                    accent="lilac"
                  />

                  <PricingCard
                    isCancelSubscription
                    isPremium={isPremium}
                    cancelSubscription={openCancelPopup}
                    isSmall={isSmall}
                    title="Создавай"
                    price={hasDiscount ? 239 : 299}
                    originalPrice={hasDiscount ? "299" : undefined}
                    period="месяц"
                    badgeType={hasDiscount ? "discount" : "default"}
                    sublabel="Для активной работы и регулярной генерации презентаций"
                    features={[
                      "Безлимитное количество презентаций",
                      "Без ограничений по слайдам",
                      "Экспорт в PDF и PPTX",
                      "Хранилище на 100 презентаций",
                      "Полный доступ к дизайнам и шаблонам",
                      "Лучшие ИИ‑модели для текстa и картинок",
                    ]}
                    ctaLabel="Подключить"
                    accent="orange"
                    highlight
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-white ">История платежей</h2>
                <div className="mt-[16px]">
                  <span className="text-white text-[14px] font-[400]">
                    Следующее списание 31 августа 2025
                  </span>
                  <PaymentHistoryTable
                    data={paymentHistory}
                    className="mt-[16px] min-w-[350px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button className="bg-[#FFFFFF] cursor-pointer rounded-full w-[40px] h-[40px] flex items-center justify-center absolute bottom-0 right-[24px]  z-20">
        <HeadphonesIcon />
      </button>

      {/* Попапы */}
      <CancelSubPopup
        isOpen={showCancelPopup}
        onConfirm={stayWithDiscount}
        onCancel={cancelSubscription}
        onDismiss={closeCancelPopup}
      />

      <OfferPopup
        isOpen={showOfferPopup}
        onSubscribe={() => {
          // Активируем скидку и закрываем попап
          activateDiscount();
          console.log("Подписка подключена со скидкой!");
        }}
        onClose={closeOfferPopup}
      />
    </section>
  );
};
