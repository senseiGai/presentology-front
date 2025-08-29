"use client";

import React, { useEffect } from "react";
import { useAccountSettingsStore } from "../model/use-account-settings-store";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useChangeEmailStore } from "../../ChangeEmailPopup/model/use-change-email-store";
import { useChangePasswordStore } from "../../ChangePasswordPopup/model/use-change-password-store";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { toast } from "sonner";
import { X } from "lucide-react";
import BigUserIcon from "../../../../public/icons/BigUserIcon";
import CameraIcon from "../../../../public/icons/CameraIcon";
import TrashIcon from "../../../../public/icons/TrashIcon";

export default function AccountSettingsPopup() {
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
  }, [isOpen, user, initializeForm]);

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      toast.success("Настройки аккаунта успешно обновлены");
      closePopup();
    } else {
      toast.error("Произошла ошибка при сохранении");
    }
  };

  const handleCancel = () => {
    resetForm();
    closePopup();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

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
              <img
                src={user.avatar}
                alt={user.firstName || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <BigUserIcon />
            )}
            <div className="flex items-center gap-1 absolute -bottom-2.5">
              <button className="cursor-pointer w-[32px] h-[32px] bg-[#F4F4F4] rounded-[8px] flex items-center justify-center">
                <CameraIcon />
              </button>
              <button className="cursor-pointer w-[32px] h-[32px] bg-[#F4F4F4] rounded-[8px] flex items-center justify-center">
                <TrashIcon />
              </button>
            </div>
          </div>
          <h3 className="text-[#BBA2FE] text-[18px] font-medium mb-[21px]">
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
    </div>
  );
}
