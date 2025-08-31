import { create } from "zustand";
import { SurveyApi } from "@/shared/api/survey.api";
import { toast } from "sonner";

interface SurveyStep {
  id: number;
  question: string;
  options: string[];
  allowCustomInput?: boolean;
}

interface SurveyState {
  steps: SurveyStep[];
  currentStepIndex: number;
  answers: Record<number, string>;
  customInput: string;
  isSubmitting: boolean;
  isCompleted: boolean;
  error: string | null;

  selectAnswer: (answer: string) => void;
  setCustomInput: (text: string) => void;
  nextStep: () => void;
  skipStep: () => void;
  submitSurvey: () => Promise<void>;
  reset: () => void;
}

let typingTimeout: ReturnType<typeof setTimeout>;

export const useSurveyStore = create<SurveyState>((set, get) => ({
  steps: [
    {
      id: 1,
      question: "Для чего вы используете Presentologi?",
      options: [
        "Работа",
        "Учёба",
        "Бизнес",
        "Развлечение",
        "Тестирование идей",
        "Личные проекты",
        "Другое",
      ],
      allowCustomInput: true,
    },
    {
      id: 2,
      question: "Какая у вас сфера деятельности?",
      options: [
        "IT",
        "Дизайн / Креатив",
        "Образование",
        "Бизнес",
        "Маркетинг",
        "Госсектор",
        "НКО",
        "Студент",
        "Финансы",
        "Юриспруденция",
        "Продажа товаров",
        "Оказание услуг",
        "Другое",
      ],
      allowCustomInput: true,
    },
    {
      id: 3,
      question: "Как вы узнали о Presentologi?",
      options: [
        "От друзей",
        "В соцсетях",
        "Поиск в интернете",
        "Из блога",
        "На мероприятии",
        "Реклама",
        "Не помню",
        "Другое",
      ],
      allowCustomInput: true,
    },
  ],

  currentStepIndex: 0,
  answers: {},
  customInput: "",
  isSubmitting: false,
  isCompleted: false,
  error: null,

  selectAnswer: (answer) => {
    const { steps, currentStepIndex } = get();
    const currentStep = steps[currentStepIndex];

    set((state) => ({
      answers: { ...state.answers, [currentStep.id]: answer },
    }));

    const isOther = answer.toLowerCase() === "другое";

    // если выбрали "Другое", остаёмся на шаге
    if (!isOther) {
      if (currentStepIndex < steps.length - 1) {
        set({ currentStepIndex: currentStepIndex + 1, customInput: "" });
      } else {
        // Автоматически отправляем опрос при завершении
        get().submitSurvey();
      }
    }
  },

  setCustomInput: (text) => {
    clearTimeout(typingTimeout);

    set({ customInput: text });

    // Запускаем дебаунс перехода
    if (text.trim().length > 1) {
      typingTimeout = setTimeout(async () => {
        const { currentStepIndex, steps } = get();
        const currentStep = steps[currentStepIndex];

        // Сохраняем кастомный ответ
        set((state) => ({
          answers: { ...state.answers, [currentStep.id]: text.trim() },
        }));

        const isLastStep = currentStepIndex === steps.length - 1;

        if (!isLastStep) {
          set({ currentStepIndex: currentStepIndex + 1, customInput: "" });
        } else {
          // Автоматически отправляем опрос при завершении
          await get().submitSurvey();
        }
      }, 4000);
    }
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    const isLastStep = currentStepIndex === steps.length - 1;

    if (!isLastStep) {
      set({ currentStepIndex: currentStepIndex + 1, customInput: "" });
    } else {
      // Автоматически отправляем опрос при завершении
      get().submitSurvey();
    }
  },

  skipStep: () => {
    const { steps, currentStepIndex } = get();

    set((state) => ({
      answers: { ...state.answers, [steps[currentStepIndex].id]: "Пропущено" },
    }));

    get().nextStep();
  },

  submitSurvey: async () => {
    const { answers } = get();

    try {
      set({ isSubmitting: true, error: null });

      // Конвертируем ответы в строковые ключи для API
      const stringAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([key, value]) => {
        stringAnswers[key] = value;
      });

      const response = await SurveyApi.submitSurvey({
        answers: stringAnswers,
        isFirstTime: true,
      });

      set({
        isCompleted: true,
        currentStepIndex: get().steps.length,
        isSubmitting: false,
      });

      toast.success(
        `Спасибо за участие в опросе! Вы получили ${response.pointsEarned} баллов.`
      );

      console.log("Опрос успешно отправлен:", response);
    } catch (err) {
      const error = err as any;
      const errorMessage =
        error?.response?.data?.message ||
        "Произошла ошибка при отправке опроса";

      set({
        error: errorMessage,
        isSubmitting: false,
      });

      toast.error(errorMessage);
      console.error("Ошибка отправки опроса:", error);
    }
  },

  reset: () => {
    clearTimeout(typingTimeout);
    set({
      currentStepIndex: 0,
      answers: {},
      customInput: "",
      isSubmitting: false,
      isCompleted: false,
      error: null,
    });
  },
}));
