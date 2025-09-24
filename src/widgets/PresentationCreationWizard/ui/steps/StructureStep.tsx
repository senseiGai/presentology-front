import React from "react";
import { usePresentationFlowStore } from "@/shared/stores/usePresentationFlowStore";

interface StructureStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const StructureStep: React.FC<StructureStepProps> = ({
  onNext,
  onBack,
}) => {
  // Store для workflow
  const { textVolume, imageSource, setTextVolume, setImageSource, uiSlides } =
    usePresentationFlowStore();

  const handleTextVolumeChange = (volume: "minimal" | "medium" | "large") => {
    const mappedVolume =
      volume === "minimal"
        ? "Минимальный"
        : volume === "medium"
        ? "Средний"
        : "Большой";
    setTextVolume(mappedVolume);
  };

  const handleImageSourceChange = (source: "flux" | "internet" | "mixed") => {
    const mappedSource =
      source === "flux"
        ? "Flux"
        : source === "internet"
        ? "Из интернета"
        : "Смешанный";
    setImageSource(mappedSource);
  };

  return (
    <div className="w-full  bg-white">
      <div className="flex">
        <div className="flex-1 px-10 py-6">
          {/* Loading text and slides appearing one by one */}
          {isLoading && (
            <>
              <div className="flex items-center justify-center gap-4 pt-[138px]">
                <CreationLoaderIcon className="animate-spin" />
                <span className="text-[24px] font-medium text-[#BBA2FE] leading-[1.3] tracking-[-0.48px]">
                  Наберитесь терпения, ИИ генерирует слайды...
                </span>
              </div>

              {/* Slides appearing during loading - SECTION 1 */}
              <div className="space-y-3 max-w-[772px] pt-8">
                {slides.slice(0, visibleSlidesCount).map((slide, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full opacity-0 cursor-move transition-all duration-200 ${
                      draggedIndex === index ? "opacity-50 scale-95" : ""
                    } ${
                      dragOverIndex === index
                        ? "border-2 border-[#BBA2FE] border-dashed"
                        : ""
                    }`}
                    style={{
                      animation: `fadeInSlide 0.5s ease-in-out ${
                        index * 0.4
                      }s forwards`,
                    }}
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                          {index + 1}
                        </span>
                        <div className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors">
                          <DotsSixIcon width={32} height={32} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {/* Заголовок слайда */}
                        {editingSlideId === index &&
                        editingField === "title" ? (
                          <input
                            type="text"
                            value={tempSlideTitle}
                            onChange={(e) => setTempSlideTitle(e.target.value)}
                            onKeyDown={handleSlideKeyPress}
                            onBlur={handleSaveSlideEdit}
                            autoFocus
                            className="w-full min-w-0 h-[32px] text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none"
                          />
                        ) : (
                          <h3
                            onClick={() => handleEditSlide(index, "title")}
                            className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all break-words"
                            title="Нажмите для редактирования"
                          >
                            {slide.title}
                          </h3>
                        )}

                        {/* Описание слайда */}
                        {editingSlideId === index &&
                        editingField === "summary" ? (
                          <textarea
                            value={tempSlideSummary}
                            onChange={(e) =>
                              setTempSlideSummary(e.target.value)
                            }
                            onKeyDown={handleSlideKeyPress}
                            onBlur={handleSaveSlideEdit}
                            autoFocus
                            rows={3}
                            className="w-full min-w-0 min-h-[72px] text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none resize-none"
                          />
                        ) : (
                          <p
                            onClick={() => handleEditSlide(index, "summary")}
                            className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all break-words"
                            title="Нажмите для редактирования"
                          >
                            {slide.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 ml-4">
                      <GrayTrashIcon width={18} height={20} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Header - only shown when not loading */}
          {!isLoading && (
            <>
              <div className="flex items-center justify-between mb-6 pt-[138px]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleSaveTitle}
                          autoFocus
                          className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] bg-transparent border-b-2 border-[#BBA2FE] outline-none min-w-[300px]"
                        />
                        <button
                          onClick={handleSaveTitle}
                          className="w-6 h-6 rounded flex items-center justify-center text-green-600 hover:bg-green-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelTitle}
                          className="w-6 h-6 rounded flex items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px]">
                          {presentationTitle}
                        </h2>
                        <button
                          onClick={handleEditTitle}
                          className="w-8 h-8 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.207 3.586 9.414.793A1 1 0 0 0 8 .793L.293 8.5A1 1 0 0 0 0 9.207v2.794a1 1 0 0 0 1 1h2.793a1 1 0 0 0 .707-.294L12.207 5a1 1 0 0 0 0-1.414m-8.414 8.415H1V9.207l5.5-5.5L9.293 6.5zM10 5.793 7.207 3l1.5-1.5L11.5 4.293z"
                              fill="#8F8F92"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px]">
                    {slides.length} слайдов
                  </p>
                </div>

                <div className="flex gap-3">
                  <AddSlideButton
                    onClick={() => setIsAddSlideModalOpen(true)}
                    isLoading={isAddingSlide}
                    variant="default"
                  />
                </div>
              </div>

              {/* Main slides list - SECTION 2 */}
              <div className="space-y-3 w-full max-h-[600px] pb-10 overflow-auto">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#F4F4F4] rounded-[8px] px-6 py-3 flex items-center justify-between w-full cursor-move transition-all duration-200 ${
                      index === 1 ? "bg-[#E9E9E9]" : ""
                    } ${
                      index === 3
                        ? "bg-[#E9E9E9] shadow-[0px_0px_10px_0px_rgba(169,169,169,0.4)]"
                        : ""
                    } ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === index
                        ? "border-2 border-[#BBA2FE] border-dashed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] w-[19px]">
                          {index + 1}
                        </span>
                        <div className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors">
                          <DotsSixIcon width={32} height={32} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {/* Заголовок слайда */}
                        {editingSlideId === index &&
                        editingField === "title" ? (
                          <input
                            type="text"
                            value={tempSlideTitle}
                            onChange={(e) => setTempSlideTitle(e.target.value)}
                            onKeyDown={handleSlideKeyPress}
                            onBlur={handleSaveSlideEdit}
                            autoFocus
                            className="w-full min-w-0 h-[32px] text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none"
                          />
                        ) : (
                          <h3
                            onClick={() => handleEditSlide(index, "title")}
                            className="text-[18px] font-semibold text-[#0B0911] leading-[1.2] tracking-[-0.36px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all break-words"
                            title="Нажмите для редактирования"
                          >
                            {slide.title}
                          </h3>
                        )}

                        {/* Описание слайда */}
                        {editingSlideId === index &&
                        editingField === "summary" ? (
                          <textarea
                            value={tempSlideSummary}
                            onChange={(e) =>
                              setTempSlideSummary(e.target.value)
                            }
                            onKeyDown={handleSlideKeyPress}
                            onBlur={handleSaveSlideEdit}
                            autoFocus
                            rows={3}
                            className="w-full min-w-0 min-h-[72px] text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] bg-white border border-[#BBA2FE] rounded-md px-2 py-1 outline-none resize-none"
                          />
                        ) : (
                          <p
                            onClick={() => handleEditSlide(index, "summary")}
                            className="text-[14px] font-normal text-[#8F8F92] leading-[1.2] tracking-[-0.42px] cursor-pointer hover:bg-white hover:shadow-sm rounded px-2 py-1 transition-all break-words"
                            title="Нажмите для редактирования"
                          >
                            {slide.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlide(index)}
                      className="bg-white w-10 h-10 rounded-[8px] border border-[#C0C0C1] flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 ml-4"
                    >
                      <GrayTrashIcon width={18} height={20} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div
          className={`w-[436px] bg-white border-l border-[#E9E9E9] flex flex-col ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          <div className="p-10 flex-1">
            <div className="mb-6">
              <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
                Объем текста
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("minimal")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      textVolume === "Минимальный"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Минимальный
                  </button>
                  <button
                    onClick={() => handleTextVolumeChange("medium")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      textVolume === "Средний"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Средний
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextVolumeChange("large")}
                    disabled={isLoading}
                    className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                      textVolume === "Большой"
                        ? "bg-[#BBA2FE] text-white"
                        : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                    } ${isLoading ? "cursor-not-allowed" : ""}`}
                  >
                    Большой
                  </button>
                </div>
              </div>
            </div>

        {/* Image Source */}
        <div className="mb-8">
          <h3 className="text-[24px] font-medium text-[#0B0911] leading-[1.3] tracking-[-0.48px] mb-6">
            Источник изображений
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleImageSourceChange("flux")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Flux"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                FLUX
                <br />
                (ИИ генерация)
              </button>
              <button
                onClick={() => handleImageSourceChange("internet")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Из интернета"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Поиск
                <br />в интернете
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleImageSourceChange("mixed")}
                className={`w-[174px] h-[90px] rounded-[8px] px-4 py-8 text-[14px] font-medium leading-[1.2] tracking-[-0.42px] text-center transition-colors ${
                  imageSource === "Смешанный"
                    ? "bg-[#BBA2FE] text-white"
                    : "bg-[#F4F4F4] text-[#0B0911] hover:bg-gray-200"
                }`}
              >
                Смешанный
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-[110px] bg-white rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-center gap-2 mt-6 px-10">
          <button
            onClick={onBack}
            className="w-[174px] h-[52px] bg-white border border-[#C0C0C1] rounded-[8px] text-[18px] font-normal text-[#0B0911] leading-[1.2] tracking-[-0.36px] hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={() => {
              // Сохраняем данные в localStorage перед переходом
              const existingData = localStorage.getItem(
                "presentationGenerationData"
              );
              if (existingData) {
                try {
                  const parsedData = JSON.parse(existingData);
                  parsedData.uiSlides = uiSlides;
                  localStorage.setItem(
                    "presentationGenerationData",
                    JSON.stringify(parsedData)
                  );
                } catch (error) {
                  console.error("Error updating presentation data:", error);
                }
              }
              onNext();
            }}
            className="flex-1 h-[52px] bg-[#BBA2FE] rounded-[8px] text-[18px] font-normal text-white leading-[1.2] tracking-[-0.36px] hover:bg-[#A693FD] transition-colors"
          >
            Далее
          </button>
        </div>
      </div>
    </>
  );
};
