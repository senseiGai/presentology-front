"use client";

import React from "react";
import Image from "next/image";
import { SurveyCard } from "@/features/SurveyCard/ui/SurveyCard";
import { useSurveyStore } from "../model/use-survey-store";
import LogoIcon from "../../../../public/icons/Logo";
import { InputField } from "@/shared/ui/InputField"; // Подключи, если у тебя есть
import { Button } from "@/shared/ui/Button";
import { Mascot } from "@/shared/ui";

export const SurveyBlock = () => {
  const {
    steps,
    currentStepIndex,
    answers,
    customInput,
    selectAnswer,
    setCustomInput,
    skipStep,
  } = useSurveyStore();

  const isCompleted = currentStepIndex >= steps.length;

  if (isCompleted) {
    return (
      <section className="mt-[24px] flex flex-row gap-x-[51px]">
        <div
          className="relative w-[809px] h-[784px] bg-cover bg-center bg-no-repeat overflow-hidden flex justify-center"
          style={{ backgroundImage: "url('/assets/survey.png')" }}
        >
          <Mascot className="!absolute w-[429px] h-[429px] bottom-[-80px] left-1/2 transform -translate-x-1/2" />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div>
            <LogoIcon />
            <h2 className="mt-[56px]">Спасибо за ваши ответы!</h2>
            <p className="mt-[16px] text-[14px] font-medium text-[#00CF1B] max-w-[356px]">
              Вы успешно прошли опрос — 100 баллов генерации уже зачислены на
              ваш аккаунт
            </p>
          </div>
          <Button
            className="absolute bottom-0 mb-[24px] max-w-[356px]"
            variant="primary"
            onClick={() => {}}
            label="На главную"
          />
        </div>
      </section>
    );
  }

  const step = steps[currentStepIndex];
  const selected = answers[step.id];

  const originalSelected = answers[step.id];
  const isOtherSelected =
    step.allowCustomInput && originalSelected?.toLowerCase() === "другое";

  return (
    <section className="mt-[24px] flex flex-row gap-x-[51px] py-[35px]">
      <div
        className="relative w-[809px] h-[784px] bg-cover bg-center bg-no-repeat overflow-hidden flex justify-center"
        style={{ backgroundImage: "url('/assets/survey.png')" }}
      >
        <Mascot className="!absolute w-[429px] h-[429px] bottom-[-80px] left-1/2 transform -translate-x-1/2" />
      </div>
      <div className="flex flex-col">
        <LogoIcon />
        <h2 className="mt-[56px] max-w-[350px] text-[20px] font-bold">
          {step.question}
        </h2>

        <div className="mt-[32px] mb-[32px] grid grid-cols-2 gap-[8px]">
          {step.options.map((option) => (
            <SurveyCard
              key={option}
              label={option}
              isSelected={selected === option}
              onClick={() => selectAnswer(option)}
            />
          ))}
        </div>

        {isOtherSelected && step.allowCustomInput && (
          <InputField
            label="Введите свой вариант"
            placeholder="Свой вариант"
            value={customInput}
            onChange={setCustomInput}
          />
        )}

        <button
          onClick={skipStep}
          className="mt-auto w-[147px] h-[52px] text-[18px] text-[#0B0911] border-[1px] border-[#C0C0C1] rounded-[8px] cursor-pointer transition-colors hover:bg-[#E9E9E9] flex items-center justify-center"
        >
          Пропустить
        </button>
      </div>
    </section>
  );
};
