"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAccountSettingsStore } from "../model/use-account-settings-store";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useChangeEmailStore } from "../../ChangeEmailPopup/model/use-change-email-store";
import { useChangePasswordStore } from "../../ChangePasswordPopup/model/use-change-password-store";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { toast } from "sonner";
import { X } from "lucide-react";
import { API_BASE_URL } from "@/shared/api/config";
import BigUserIcon from "../../../../public/icons/BigUserIcon";
import CameraIcon from "../../../../public/icons/CameraIcon";
import TrashIcon from "../../../../public/icons/TrashIcon";
import WarningIcon from "../../../../public/icons/WarningIcon";

export default function AccountSettingsPopup() {
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Изображение должно быть не больше 10 Мб"
  );

  const {
    isOpen,
    isLoading,
    firstName,
    lastName,
    email,
    password,
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    isEditingEmail,
    isEditingPassword,
    closePopup,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setEditingEmail,
    setEditingPassword,
    initializeForm,
    saveChanges,
    resetForm,
    validateEmail,
    validatePassword,
    uploadAvatar,
    deleteAvatar,
  } = useAccountSettingsStore();

  const { user } = useAuthStore();
  const { openPopup: openChangeEmailPopup } = useChangeEmailStore();
  const { openPopup: openChangePasswordPopup } = useChangePasswordStore();

  // Initialize form when popup opens
  useEffect(() => {
    if (isOpen && user) {
      initializeForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
    // Очищаем тост при закрытии попапа
    if (!isOpen) {
      setShowErrorToast(false);
    }
  }, [isOpen, user, initializeForm]);

  const handleSave = async () => {
    try {
      const success = await saveChanges();
      if (success) {
        toast.success("Настройки аккаунта успешно обновлены");
        closePopup();
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Произошла ошибка при сохранении";
      toast.error(errorMessage);
    }
  };

  const handleCancel = useCallback(() => {
    resetForm();
    setShowErrorToast(false); // Скрываем тост при закрытии
    closePopup();
  }, [resetForm, closePopup]);

  //deploy 2

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (e.repeat) return; // игнорируем автоповтор при удержании
        e.preventDefault();
        e.stopPropagation(); // не даём событию уйти вверх (вдруг там «open»)
        handleCancel(); // только закрываем
      }
    };

    // слушаем ТОЛЬКО когда открыт и раньше всех с более высоким приоритетом
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
    };
  }, [isOpen, handleCancel]);

  const handleEmailChange = () => {
    if (isEditingEmail) {
      // Сохранить изменения email
      if (validateEmail()) {
        setEditingEmail(false);
        toast.success("Email успешно изменен");
      }
    } else {
      // Закрыть основной попап и открыть попап изменения email
      closePopup();
      openChangeEmailPopup(email);
    }
  };

  const handlePasswordChange = () => {
    if (isEditingPassword) {
      // Сохранить изменения пароля
      if (validatePassword()) {
        setEditingPassword(false);
        toast.success("Пароль успешно изменен");
      }
    } else {
      // Закрыть основной попап и открыть попап изменения пароля
      closePopup();
      openChangePasswordPopup();
    }
  };

  const handleUploadPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png,image/gif";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await uploadAvatar(file);
        toast.success("Аватар успешно обновлён");
      } catch (error: any) {
        setErrorMessage(
          error?.message || "Произошла ошибка при загрузке аватара"
        );
        setShowErrorToast(true);
        setTimeout(() => {
          setShowErrorToast(false);
        }, 5000);
      }
    };
    input.click();
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      toast.success("Аватар успешно удалён");
    } catch (error: any) {
      toast.error(error?.message || "Произошла ошибка при удалении аватара");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#BBA2FE66] backdrop-blur-[8px] flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-[24px] px-[24px] pt-[29px] pb-[30px] w-[514px] h-[700px] relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[#0B0911]">Настройки аккаунта</h2>
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

        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-[36px]">
          <div className="bg-[#BBA2FE] w-[80px] h-[80px] flex items-center justify-center rounded-full mb-[8px] relative">
            {user?.avatar ? (
              <Image
                src={`${API_BASE_URL.replace(/\/$/, "")}${user.avatar}`}
                alt={user.firstName || "User"}
                className="w-full h-full rounded-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <BigUserIcon />
            )}
            <div className="flex items-center gap-1 absolute -bottom-2.5">
              <button
                onClick={handleUploadPhoto}
                className="cursor-pointer w-[32px] h-[32px] bg-[#F4F4F4] rounded-[8px] flex items-center justify-center hover:bg-[#E9EAEE] transition-colors"
                title="Загрузить фото"
                disabled={isLoading}
              >
                <CameraIcon />
              </button>
              <button
                onClick={handleDeleteAvatar}
                className="cursor-pointer w-[32px] h-[32px] bg-[#F4F4F4] rounded-[8px] flex items-center justify-center hover:bg-[#E9EAEE] transition-colors"
                title="Удалить фото"
                disabled={isLoading}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          <h3 className="text-[#BBA2FE] text-[18px] mt-[16px] font-medium mb-[21px]">
            {user?.firstName} {user?.lastName}
          </h3>
          {!user?.firstName && !user?.lastName && <div className="h-[21px]" />}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField
                label="Имя"
                value={firstName}
                onChange={setFirstName}
                placeholder="Константин"
                isError={firstNameError}
                className="w-full"
              />
            </div>
            <div>
              <InputField
                label="Фамилия"
                value={lastName}
                onChange={setLastName}
                placeholder="Константинов"
                isError={lastNameError}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-end flex-row w-full gap-4 mt-2">
            <InputField
              label="Электронная почта"
              value={email}
              disabled={true}
              onChange={setEmail}
              placeholder="example@provider.com"
              isError={emailError}
            />
            <Button
              variant="ghost"
              onClick={handleEmailChange}
              className="max-w-[130px] !h-[40px] bg-[#F4F4F4] !text-[18px] font-normal text-[#0B0911]"
            >
              Изменить
            </Button>
          </div>

          <div className="flex items-end flex-row w-full gap-4 mt-2">
            <InputField
              label="Пароль"
              type="password"
              value={password}
              disabled={true}
              onChange={setPassword}
              placeholder="••••••"
              isError={passwordError}
              className="flex-1"
            />
            <Button
              variant="ghost"
              onClick={handlePasswordChange}
              className="max-w-[130px] !h-[40px] bg-[#F4F4F4] !text-[18px] font-normal text-[#0B0911]"
            >
              Изменить
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto w-full">
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
            Отменить
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      {showErrorToast && (
        <div className="absolute bottom-6 left-24 z-10">
          <div className="relative max-w-[350px] h-[106px] rounded-[20px] bg-white shadow-lg p-4 border border-[#E5E5E5]">
            <div className="flex items-start gap-3">
              <WarningIcon />
              <div className="flex-1">
                <div className="text-[#0B0911] text-[16px] font-semibold">
                  Загрузка не прошла
                </div>
                <div className="text-[#8F8F92] text-[14px] font-medium mt-[2px]">
                  {errorMessage}
                </div>
              </div>
              <button
                onClick={() => setShowErrorToast(false)}
                className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {/* Прогресс-бар */}
            <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden mx-4">
              <div
                className="h-full bg-[#FF4444] origin-left"
                style={{
                  animation: "errorToastCountdown 5000ms linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes errorToastCountdown {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}
