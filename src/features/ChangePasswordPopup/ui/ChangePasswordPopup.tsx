"use client";

import React from "react";
import { useChangePasswordStore } from "../model/use-change-password-store";
import { useAccountSettingsStore } from "../../AccountSettingsPopup/model/use-account-settings-store";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { ArrowLeft, X } from "lucide-react";

export default function ChangePasswordPopup() {
  const {
    isOpen,
    isLoading,
    isSuccess,
    oldPassword,
    newPassword,
    confirmPassword,
    oldPasswordError,
    oldPasswordErrorMessage,
    newPasswordError,
    newPasswordErrorMessage,
    confirmPasswordError,
    confirmPasswordErrorMessage,
    closePopup,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    resetForm,
    changePassword,
    clearErrors,
    hasMinLength,
    hasUpperCase,
    hasDigit,
    hasSpecialChar,
  } = useChangePasswordStore();

  const { openPopup: openAccountSettings } = useAccountSettingsStore();

  const handleBackToSettings = () => {
    closePopup();
    openAccountSettings();
  };

  const handleChangePassword = async () => {
    const success = await changePassword();
    // При успехе не закрываем попап, показываем экран успеха
    // Ошибки уже установлены в store при неудаче
  };

  const handleCancel = () => {
    resetForm();
    closePopup();
    openAccountSettings();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Обработчик изменения старого пароля
  const handleOldPasswordChange = (value: string) => {
    setOldPassword(value);
    // Очищаем ошибки при начале ввода
    if (oldPasswordError && value.length > 0) {
      clearErrors();
    }
  };

  // Обработчик изменения нового пароля
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    // Очищаем ошибки при начале ввода
    if (newPasswordError && value.length > 0) {
      clearErrors();
    }
  };

  // Обработчик изменения подтверждения пароля
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Очищаем ошибки при начале ввода
    if (confirmPasswordError && value.length > 0) {
      clearErrors();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] flex items-center justify-center z-50"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-[24px] px-[24px] pt-[29px] pb-[30px] w-[514px] h-[700px] relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8F8F92]" />
            </button>
            <h2 className="text-[#0B0911]">Изменение пароля</h2>
          </div>
          <div className="absolute right-6 top-6 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
            <span className="text-[18px] font-[400] text-[#8F8F92]">esc</span>
            <button
              aria-label="Закрыть"
              onClick={handleCancel}
              className="text-[#8F8F92] cursor-pointer"
            >
              <X />
            </button>
          </div>
        </div>
        {/* Content */}
        <>
          <div className="space-y-4 mt-[32px] flex-1">
            {/* Old Password */}
            <div className="w-full">
              <InputField
                label="Старый пароль"
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                placeholder="1234567A"
                isError={oldPasswordError}
                className="w-full"
              />
              {oldPasswordError && oldPasswordErrorMessage && (
                <div className="mt-2 flex items-start gap-2">
                  <p className="text-red-500 text-[12px] font-[400] leading-relaxed">
                    {oldPasswordErrorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="w-full mt-6">
              <InputField
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="1234567B"
                isError={newPasswordError}
                className="w-full"
              />
              {newPasswordError && newPasswordErrorMessage && (
                <div className="mt-2 flex items-start gap-2">
                  <p className="text-red-500 text-[12px] font-[400] leading-relaxed">
                    {newPasswordErrorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <InputField
                label="Повторите пароль"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="1234567B"
                isError={confirmPasswordError}
                className="w-full"
              />
              {confirmPasswordError && confirmPasswordErrorMessage && (
                <div className="mt-2 flex items-start gap-2">
                  <p className="text-red-500 text-[12px] font-[400] leading-relaxed">
                    {confirmPasswordErrorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="w-full mt-4">
              <p className="text-[#8F8F92] text-[12px] font-[400]">
                Пароль должен содержать:
              </p>
              <ul className="text-[12px] font-[400]">
                <li
                  className={
                    hasMinLength() ? "text-[#22C55E]" : "text-[#8F8F92]"
                  }
                >
                  – не менее 8 символов
                </li>
                <li
                  className={
                    hasUpperCase() ? "text-[#22C55E]" : "text-[#8F8F92]"
                  }
                >
                  – хотя бы одну заглавную букву
                </li>
                <li
                  className={hasDigit() ? "text-[#22C55E]" : "text-[#8F8F92]"}
                >
                  – хотя бы одну цифру
                </li>
                <li
                  className={
                    hasSpecialChar() ? "text-[#22C55E]" : "text-[#8F8F92]"
                  }
                >
                  – хотя бы один специальный символ (например, !, @, #)
                </li>
              </ul>
            </div>
          </div>

          {!isSuccess && (
            <div className="mt-auto">
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={
                  isLoading ||
                  !oldPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
                className="w-full !h-[48px] !text-[17px] !font-[400]"
              >
                {isLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          )}
        </>
        <div className="flex-1 flex flex-col  mt-[16px]">
          <div className=" mb-[60px]">
            <p className="text-[#00CF1B] text-[14px] font-[400] mb-4">
              Ваш пароль был успешно изменен!
            </p>
          </div>

          {/* Back to Settings Button */}
          <div className="mt-auto w-full">
            <Button
              variant="primary"
              onClick={handleBackToSettings}
              className="w-full !h-[48px] !text-[17px] !font-[400]"
            >
              Вернуться к настройкам
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
