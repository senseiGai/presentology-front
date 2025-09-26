import html2canvas from "html2canvas";

/**
 * Генерирует preview изображение из слайда презентации
 */
export const generateSlidePreview = async (
  slideElement: HTMLElement,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<string> => {
  const { width = 400, height = 225, quality = 0.8 } = options;

  try {
    // Генерируем canvas из DOM элемента
    const canvas = await html2canvas(slideElement, {
      width: width,
      height: height,
      scale: 2, // Высокое разрешение
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Конвертируем в base64
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return dataUrl;
  } catch (error) {
    console.error("Error generating slide preview:", error);
    throw error;
  }
};

/**
 * Генерирует два preview изображения (как на карточке)
 */
export const generatePresentationPreviews = async (
  slidesContainer: HTMLElement
): Promise<string[]> => {
  const slides = slidesContainer.querySelectorAll(".slide");
  const previews: string[] = [];

  // Берем первые два слайда или дублируем первый
  const firstSlide = slides[0] as HTMLElement;
  const secondSlide = (slides[1] as HTMLElement) || firstSlide;

  if (firstSlide) {
    const preview1 = await generateSlidePreview(firstSlide);
    previews.push(preview1);
  }

  if (secondSlide) {
    const preview2 = await generateSlidePreview(secondSlide);
    previews.push(preview2);
  }

  return previews;
};

/**
 * Загружает base64 изображение на сервер и возвращает URL
 */
export const uploadPreviewImage = async (
  base64Image: string,
  presentationId: string
): Promise<string> => {
  try {
    // Конвертируем base64 в blob
    const response = await fetch(base64Image);
    const blob = await response.blob();

    // Создаем FormData для загрузки
    const formData = new FormData();
    formData.append("file", blob, `preview_${presentationId}.jpg`);
    formData.append("type", "presentation-preview");

    // Отправляем на сервер (нужно создать endpoint)
    const uploadResponse = await fetch("/api/upload/preview", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload preview image");
    }

    const { url } = await uploadResponse.json();
    return url;
  } catch (error) {
    console.error("Error uploading preview:", error);
    throw error;
  }
};
