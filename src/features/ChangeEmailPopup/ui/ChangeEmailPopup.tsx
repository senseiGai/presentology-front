"use client";

import React, { useEffect } from "react";
import { useChangeEmailStore } from "../model/use-change-email-store";
import { InputField } from "@/shared/ui/InputField";
import { Button } from "@/shared/ui/Button";
import { ArrowLeft, X } from "lucide-react";
import { useAccountSettingsStore } from "@/features/AccountSettingsPopup";
import { AuthApi } from "@/shared/api/auth.api";

export default function ChangeEmailPopup() {
  const {
    isOpen,
    isLoading,
    step,
    resendTimer,
    canResend,
    oldEmail,
    newEmail,
    verificationCode,
    newEmailError,
    newEmailErrorMessage,
    codeError,
    codeErrorMessage,
    closePopup,
    setNewEmail,
    setVerificationCode,
    resetForm,
    sendCode,
    verifyCode,
    clearErrors,
    startResendTimer,
  } = useChangeEmailStore();
  const { openPopup: openAccountSettings } = useAccountSettingsStore();

  // Локальное состояние для отображения кода
  const [debugCode, setDebugCode] = React.useState<string | null>(null);

  // Слушаем события обновления кода
  React.useEffect(() => {
    const handleCodeUpdate = (event: any) => {
      console.log(
        "🔄 [ChangeEmailPopup] Debug code updated:",
        event.detail.code
      );
      setDebugCode(event.detail.code);
    };

    // Проверяем есть ли код в localStorage при монтировании
    const savedCode = localStorage.getItem("debugVerificationCode");
    if (savedCode) {
      console.log("🔍 [ChangeEmailPopup] Found saved debug code:", savedCode);
      setDebugCode(savedCode);
    }

    window.addEventListener("debugCodeUpdated", handleCodeUpdate);
    return () => {
      window.removeEventListener("debugCodeUpdated", handleCodeUpdate);
    };
  }, []);

  // Очищаем код при закрытии попапа
  React.useEffect(() => {
    if (!isOpen) {
      setDebugCode(null);
      localStorage.removeItem("debugVerificationCode");
    }
  }, [isOpen]);

  const handleCancel = React.useCallback(() => {
    resetForm();
    closePopup();
    openAccountSettings();
  }, [resetForm, closePopup, openAccountSettings]);

  const handleBack = React.useCallback(() => {
    closePopup();
    openAccountSettings();
    clearErrors();
  }, [closePopup, openAccountSettings, clearErrors]);

  const handleBackToSettings = React.useCallback(() => {
    closePopup();
    openAccountSettings();
  }, [closePopup, openAccountSettings]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleCancel]);

  const handleSendCode = async () => {
    console.log(
      "🚀 [ChangeEmailPopup] Sending verification code to:",
      newEmail
    );
    const success = await sendCode();
    if (!success) {
      // Ошибки уже установлены в store
      return;
    }
    console.log(
      "✅ [ChangeEmailPopup] Code sent successfully, check server logs for code"
    );
    // Автоматически получаем код для тестирования через секунду
    setTimeout(() => {
      getCodeFromBackend();
    }, 1000);
    // Переход к следующему шагу происходит в store
  };

  const handleResendCode = async () => {
    console.log(
      "🔄 [ChangeEmailPopup] Resending verification code to:",
      newEmail
    );
    const success = await sendCode();
    if (success) {
      // Запускаем таймер только при повторной отправке
      startResendTimer();
      // Автоматически получаем код для тестирования
      setTimeout(() => {
        getCodeFromBackend();
      }, 1000);
    }
  };

  const handleVerifyCode = async () => {
    console.log("🔍 [ChangeEmailPopup] Verifying code:", {
      code: verificationCode,
      newEmail: newEmail,
      codeLength: verificationCode.length,
    });
    const success = await verifyCode();
    if (success) {
      console.log("✅ [ChangeEmailPopup] Email successfully changed!");
    } else {
      console.log("❌ [ChangeEmailPopup] Code verification failed");
    }
    // Не закрываем попап при успехе, переходим к экрану успеха
    // Ошибки уже установлены в store при неудаче
  };

  // Обработчик изменения email без валидации в реальном времени
  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    // Очищаем ошибки при начале ввода
    if (newEmailError && value.length > 0) {
      clearErrors();
    }
  };

  // Функция для получения кода из бэкенда (только для тестирования)
  const getCodeFromBackend = async () => {
    try {
      const result = await AuthApi.getVerificationCode();
      console.log(
        "🔑 [ChangeEmailPopup] Verification code from backend:",
        result.code
      );
      if (result.code) {
        setDebugCode(result.code);
        console.log("✅ [ChangeEmailPopup] Code displayed in UI:", result.code);
        // Также можно автоматически заполнить поле
        setVerificationCode(result.code);
      } else {
        setDebugCode(null);
        alert("Код не найден. Сначала отправьте код.");
      }
    } catch (error) {
      console.error("❌ [ChangeEmailPopup] Error getting code:", error);
      alert("Ошибка получения кода");
      setDebugCode(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
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
              onClick={handleBack}
              className="flex cursor-pointer items-center justify-center w-[40px] h-[40px] rounded-[8px] bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8F8F92]" />
            </button>
            <h2 className="text-[#0B0911]">Изменение почты</h2>
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

        {/* Content based on step */}
        <div className="space-y-6 mt-[32px]">
          <div className="flex flex-col gap-y-[12px]">
            <span className="text-[#8F8F92] text-[12px] font-[400]">
              Старая почта
            </span>
            <span className="text-[#0B0911] text-[14px] font-[400]">
              {oldEmail}
            </span>
          </div>

          <div className="w-full">
            <div className="flex flex-row items-end w-full gap-x-[16px]">
              <div className="w-full">
                <InputField
                  label="Новая почта"
                  value={newEmail}
                  onChange={handleEmailChange}
                  disabled={step !== "email" || isLoading}
                  placeholder="example@provider.com"
                  isError={newEmailError}
                  className={`${
                    step !== "success" ? "max-w-[100%]" : "max-w-[279px]"
                  }`}
                />
              </div>
              {step !== "success" && (
                <Button
                  variant="primary"
                  onClick={handleSendCode}
                  disabled={isLoading || !newEmail.trim() || step !== "email"}
                  className="!w-[171px] !h-[40px] !text-[17px] !font-[400] px-[24px] flex-shrink-0"
                >
                  {isLoading ? "Отправляем..." : "Отправить код"}
                </Button>
              )}
            </div>

            {/* Error Message */}
            {newEmailError && newEmailErrorMessage && (
              <div className="mt-2 flex items-start gap-2">
                <p className="text-red-500 text-[12px] font-[400] leading-relaxed">
                  {newEmailErrorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
        {step !== "email" && step !== "success" && (
          <div className="space-y-6 mt-[32px] flex-1 flex flex-col">
            <div className="flex-1">
              <p className="text-[#8F8F92] text-[12px] font-[400] mb-4">
                Код подтверждения был отправлен на вашу новую почту:{" "}
                <span className="font-[500] text-[#0B0911]">{newEmail}</span>
              </p>

              <div className="flex gap-2 mb-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={verificationCode[index] || ""}
                    onChange={(e) => {
                      const newCode = verificationCode.split("");
                      newCode[index] = e.target.value.replace(/\D/g, "");
                      const updatedCode = newCode.join("").slice(0, 6);
                      setVerificationCode(updatedCode);

                      // Очищаем ошибки при начале ввода
                      if (codeError && e.target.value) {
                        clearErrors();
                      }

                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        const target = e.target as HTMLInputElement;
                        const nextInput = target.parentElement?.children[
                          index + 1
                        ] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !verificationCode[index] &&
                        index > 0
                      ) {
                        const target = e.target as HTMLInputElement;
                        const prevInput = target.parentElement?.children[
                          index - 1
                        ] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className={`w-[56px] h-[56px] text-center text-[20px] font-[600] border-[1px] rounded-[8px] focus:outline-none transition-colors ${"border-[#E8E8E8] focus:border-[#BBA2FE] bg-white"}`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {codeError && codeErrorMessage && (
                <div className="flex mb-4">
                  <p className="text-red-500 text-[12px] font-[400] text-center">
                    {codeErrorMessage}
                  </p>
                </div>
              )}

              {/* Resend Code */}
              <div className="flex flex-row items-center">
                {canResend ? (
                  <span className="text-[#8F8F92] text-[12px] font-[400]">
                    Не получили код?{" "}
                  </span>
                ) : (
                  <span className="text-[#8F8F92] text-[12px] font-[400]">
                    Код отправлен повторно{" "}
                  </span>
                )}
                {canResend ? (
                  <button
                    className="text-[#8F8F92] text-[14px] font-[500] hover:text-primary duration-300 ease-in-out transition-colors cursor-pointer ml-3"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    Отправить заново
                  </button>
                ) : (
                  <span className="text-[#8F8F92] text-[14px] font-[500] ml-3">
                    Отправить заново через {resendTimer} секунд
                  </span>
                )}
              </div>

              {/* Test button to get code from backend */}
              <div className="mt-4">
                <button
                  className="text-[#BBA2FE] text-[12px] font-[400] hover:text-[#A689FD] cursor-pointer underline"
                  onClick={getCodeFromBackend}
                >
                  [TEST] Получить код из бэкенда
                </button>

                {/* Отображение кода для тестирования */}
                {debugCode && (
                  <div className="mt-2 p-3 bg-[#F0F9FF] border border-[#BBA2FE] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[#0B0911] text-[12px] font-[500]">
                        🔑 Код из логов:
                      </span>
                      <button
                        onClick={() => {
                          setVerificationCode(debugCode);
                          console.log(
                            "✅ [ChangeEmailPopup] Code auto-filled:",
                            debugCode
                          );
                        }}
                        className="text-[#BBA2FE] text-[10px] hover:text-[#A689FD] underline"
                      >
                        Заполнить
                      </button>
                    </div>
                    <div className="mt-1 font-mono text-[16px] font-[700] text-[#BBA2FE] tracking-[2px]">
                      {debugCode}
                    </div>
                    <div className="text-[#8F8F92] text-[10px] mt-1">
                      Код из серверных логов (SMTP недоступен)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-auto">
              <Button
                variant="primary"
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full !h-[48px] !text-[17px] !font-[400]"
              >
                {isLoading ? "Подтверждаем..." : "Подтвердить"}
              </Button>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {step === "success" && (
          <div className="flex-1 flex flex-col mt-[32px]">
            <div className=" mb-[60px]">
              <p className="text-[#00CF1B] text-[14px] font-[400] mb-4">
                Ваша почта была успешно изменена!
              </p>
            </div>

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
        )}
      </div>
    </div>
  );
}
