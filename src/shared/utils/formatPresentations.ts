import type { Presentation } from "@/shared/api/presentations";

export interface FormattedPresentation {
  id: string;
  images: string[];
  label: string;
  date: string;
  tag: "Сгенерированная" | "Улучшенная" | "По брендбуку";
}

export const formatPresentationsForDisplay = (
  presentations: Presentation[]
): FormattedPresentation[] => {
  return presentations.map((presentation) => {
    // Форматируем дату
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 24) {
        return "Сегодня";
      } else if (diffInHours < 48) {
        return "Вчера";
      } else if (diffInHours < 168) {
        // неделя
        return `${Math.floor(diffInHours / 24)} дня назад`;
      } else {
        return date.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        });
      }
    };

    // Определяем тег на основе типа презентации
    const getTag = (
      presentation: Presentation
    ): FormattedPresentation["tag"] => {
      switch (presentation.type) {
        case "GENERATED":
          return "Сгенерированная";
        case "IMPROVED":
          return "Улучшенная";
        case "BRANDBOOK":
          return "По брендбуку";
        default:
          return "Сгенерированная";
      }
    };

    // Используем превью если есть, иначе заглушки
    const images = presentation.thumbnail
      ? [presentation.thumbnail, presentation.thumbnail] // Дублируем для отображения двух превью
      : [
          "/assets/presentation/presentation01.png",
          "/assets/presentation/presentation01.png",
        ];

    return {
      id: presentation.id,
      images,
      label: presentation.title || "Название презентации",
      date: formatDate(presentation.updatedAt || presentation.createdAt),
      tag: getTag(presentation),
    };
  });
};
