import { create } from "zustand";

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

  selectAnswer: (answer: string) => void;
  setCustomInput: (text: string) => void;
  nextStep: () => void;
  skipStep: () => void;
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
        set({ currentStepIndex: steps.length });
        console.log("Завершено:", get().answers);
      }
    }
  },

  setCustomInput: (text) => {
    clearTimeout(typingTimeout);

    set({ customInput: text });

    // Запускаем дебаунс перехода
    if (text.trim().length > 1) {
      typingTimeout = setTimeout(() => {
        const { currentStepIndex, steps } = get();
        const isLastStep = currentStepIndex === steps.length - 1;

        if (!isLastStep) {
          set({ currentStepIndex: currentStepIndex + 1, customInput: "" });
        } else {
          // Завершить — делаем индекс больше длины
          set({ currentStepIndex: steps.length });
          console.log("Опрос завершён", get().answers);
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
      // Завершить — индекс за пределы массива
      set({ currentStepIndex: steps.length });
      console.log("Опрос завершён (skip)", get().answers);
    }
  },

  skipStep: () => {
    const { steps, currentStepIndex } = get();

    set((state) => ({
      answers: { ...state.answers, [steps[currentStepIndex].id]: "Пропущено" },
    }));

    get().nextStep(); // <-- теперь корректно завершает
  },

  reset: () =>
    set({
      currentStepIndex: 0,
      answers: {},
      customInput: "",
    }),
}));
