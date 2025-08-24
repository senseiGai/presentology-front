import React from "react";
import { GlassContainer } from "@/shared/ui/GlassContainer";

export const GlassShowcase: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen">
      <h1 className="text-white text-3xl font-bold mb-8 text-center">
        Примеры стеклянных компонентов
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Светлый вариант */}
        <GlassContainer variant="light" blur="md" opacity="medium">
          <h3 className="text-lg font-semibold mb-2">Светлый стиль</h3>
          <p className="text-sm opacity-80">
            Светлый полупрозрачный контейнер с средним размытием
          </p>
        </GlassContainer>

        {/* Темный вариант */}
        <GlassContainer variant="dark" blur="lg" opacity="high" border>
          <h3 className="text-white text-lg font-semibold mb-2">
            Темный стиль
          </h3>
          <p className="text-white text-sm opacity-80">
            Темный контейнер с границей и сильным размытием
          </p>
        </GlassContainer>

        {/* Модальный вариант */}
        <GlassContainer variant="modal" blur="xl" rounded="xl" padding="lg">
          <h3 className="text-lg font-semibold mb-2">Модальный стиль</h3>
          <p className="text-sm opacity-80">
            Почти непрозрачный белый фон для модальных окон
          </p>
        </GlassContainer>

        {/* Карточка со слабым эффектом */}
        <GlassContainer
          variant="light"
          blur="sm"
          opacity="low"
          rounded="lg"
          className="hover:bg-white/30 transition-all cursor-pointer"
        >
          <h3 className="text-lg font-semibold mb-2">Интерактивная карточка</h3>
          <p className="text-sm opacity-80">
            Наведите для изменения прозрачности
          </p>
        </GlassContainer>

        {/* Карточка с сильным эффектом */}
        <GlassContainer
          variant="dark"
          blur="xl"
          opacity="high"
          rounded="full"
          padding="xl"
          border
        >
          <h3 className="text-white text-lg font-semibold mb-2 text-center">
            Круглая карточка
          </h3>
          <p className="text-white text-sm opacity-80 text-center">
            С максимальными скруглениями
          </p>
        </GlassContainer>

        {/* Без отступов */}
        <GlassContainer
          variant="light"
          blur="md"
          opacity="medium"
          padding="none"
          className="overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <h3 className="text-lg font-semibold mb-2">Без отступов</h3>
            <p className="text-sm opacity-80">
              Контейнер без встроенных отступов
            </p>
          </div>
        </GlassContainer>
      </div>

      {/* Пример с фоновым изображением */}
      <div
        className="mt-12 p-8 rounded-xl bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/main_bg.png')",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassContainer variant="light" blur="lg" opacity="medium" border>
            <h3 className="text-lg font-semibold mb-2">
              На фоновом изображении
            </h3>
            <p className="text-sm opacity-80">
              Стеклянный эффект работает отлично с изображениями
            </p>
          </GlassContainer>

          <GlassContainer variant="dark" blur="md" opacity="high" border>
            <h3 className="text-white text-lg font-semibold mb-2">
              Темный на изображении
            </h3>
            <p className="text-white text-sm opacity-80">
              Темный вариант также хорошо читается
            </p>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};
