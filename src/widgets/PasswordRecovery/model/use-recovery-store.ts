import { create } from "zustand";
import { AuthApi } from "@/shared/api/auth.api";

interface PasswordRecoveryState {
  email: string;
  emailError: string | null;
  emailTouched: boolean;
  isLoading: boolean;
  success: boolean;
  resendCooldown: number;
  resentSuccess: boolean;
  timerInterval: NodeJS.Timeout | null;

  setEmail: (email: string) => void;
  setEmailTouched: () => void;
  submit: () => Promise<void>; // первая отправка
  resend: () => Promise<void>; // повторная отправка
  reset: () => void;
}

export const usePasswordRecoveryStore = create<PasswordRecoveryState>(
  (set, get) => ({
    email: "",
    emailError: null,
    emailTouched: false,
    isLoading: false,
    success: false,
    resendCooldown: 0,
    resentSuccess: false,
    timerInterval: null,

    setEmail: (email) => {
      const { emailTouched } = get();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let emailError = null;

      if (emailTouched && !emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      }

      set({ email, emailError });
    },

    setEmailTouched: () => {
      const { email } = get();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let emailError = null;

      if (!emailRegex.test(email)) {
        emailError = "Некорректный формат почты";
      }

      set({ emailTouched: true, emailError });
    },

    submit: async () => {
      const { email } = get();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        set({ emailError: "Некорректный формат почты", emailTouched: true });
        return;
      }

      set({ isLoading: true, emailError: null });
      try {
        await AuthApi.forgotPassword({ email });

        const cooldown = 60;

        set({
          success: true,
          resendCooldown: cooldown,
          resentSuccess: false,
        });

        const interval = setInterval(() => {
          set((state) => {
            if (state.resendCooldown <= 1) {
              clearInterval(state.timerInterval!);
              return { resendCooldown: 0, timerInterval: null };
            }
            return { resendCooldown: state.resendCooldown - 1 };
          });
        }, 1000);

        set({ timerInterval: interval });
      } catch (error: any) {
        console.error("Password recovery error:", error);
        let errorMessage = "Произошла ошибка. Попробуйте позже.";

        if (error.response?.status === 404) {
          errorMessage = "Пользователь с указанной почтой не найден";
        } else if (error.response?.status === 429) {
          errorMessage = "Слишком много попыток. Попробуйте позже";
        }

        set({ emailError: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    resend: async () => {
      const { email } = get();

      set({ isLoading: true });
      try {
        await AuthApi.forgotPassword({ email });
        set({ resentSuccess: true });
      } catch (error: any) {
        console.error("Resend password recovery error:", error);
        let errorMessage = "Произошла ошибка при повторной отправке.";

        if (error.response?.status === 429) {
          errorMessage = "Слишком много попыток. Попробуйте позже";
        }

        set({ emailError: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    reset: () => {
      const { timerInterval } = get();
      if (timerInterval) clearInterval(timerInterval);
      set({
        email: "",
        emailError: null,
        emailTouched: false,
        isLoading: false,
        success: false,
        resendCooldown: 0,
        resentSuccess: false,
        timerInterval: null,
      });
    },
  })
);
