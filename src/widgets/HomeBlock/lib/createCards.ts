import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const createCards = (router: AppRouterInstance) => [
  {
    label: "Создай с нуля",
    description:
      "Опиши задачу, ИИ мгновенно соберёт презентацию, сгенерирует текст и дизайн",
    image: "/assets/home/home01.png",
    onClick: () => router.push("/presentation-generation"),
  },
  {
    label: "Сделай дизайн",
    description: "Загрузи свой текст. ИИ превратит его в стильную презентацию",
    image: "/assets/home/home02.png",
    onClick: () => router.push("/design-from-text"),
  },
  {
    label: "Улучши файл",
    description: "Загрузи готовую презентацию и ИИ улучшит текст и дизайн",
    image: "/assets/home/home03.png",
    onClick: () => router.push("/presentation-generation"),
  },
  {
    label: "По брендбуку",
    description: "Создавай презентации в фирменном стиле компании",
    image: "/assets/home/home04.png",
    onClick: () => router.push("/presentation-generation"),
  },
];
