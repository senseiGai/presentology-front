import { create } from "zustand";

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

      set({ isLoading: true });
      try {
        await new Promise((res) => setTimeout(res, 1000));
        console.log("Первичная отправка:", email);

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
      } catch {
        set({ emailError: "Произошла ошибка. Попробуйте позже." });
      } finally {
        set({ isLoading: false });
      }
    },

    resend: async () => {
      const { email } = get();

      set({ isLoading: true });
      try {
        await new Promise((res) => setTimeout(res, 1000));
        console.log("Повторная отправка:", email);
        set({ resentSuccess: true }); // ✅ просто отображаем сообщение, не трогаем cooldown
      } catch {
        set({ emailError: "Произошла ошибка при повторной отправке." });
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
