# Glass Components Documentation

Переиспользуемые компоненты для создания стеклянных эффектов в приложении.

## GlassContainer

Основной компонент для создания стеклянного эффекта.

### Пропы

```typescript
interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "modal";
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: "low" | "medium" | "high";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  border?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}
```

### Примеры использования

#### Базовое использование

```tsx
import { GlassContainer } from "@/shared/ui/GlassContainer";

<GlassContainer>
  <p>Содержимое с стеклянным эффектом</p>
</GlassContainer>;
```

#### Светлый вариант

```tsx
<GlassContainer variant="light" blur="md" opacity="medium">
  <div>Светлый стеклянный контейнер</div>
</GlassContainer>
```

#### Темный вариант

```tsx
<GlassContainer variant="dark" blur="lg" opacity="high" border>
  <div>Темный стеклянный контейнер с границей</div>
</GlassContainer>
```

#### Карточка с настройками

```tsx
<GlassContainer
  variant="light"
  blur="sm"
  opacity="low"
  rounded="xl"
  padding="lg"
  border
  className="hover:bg-white/40 transition-all cursor-pointer"
>
  <h3>Заголовок карточки</h3>
  <p>Описание карточки</p>
</GlassContainer>
```

## GlassModal

Компонент модального окна со стеклянным эффектом и backdrop blur.

### Пропы

```typescript
interface GlassModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  backdropClassName?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "bottom";
}
```

### Примеры использования

#### Базовая модалка

```tsx
import { GlassModal } from "@/shared/ui/GlassModal";

<GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <h2>Заголовок модалки</h2>
  <p>Содержимое модального окна</p>
</GlassModal>;
```

#### Большая модалка сверху

```tsx
<GlassModal
  isOpen={isOpen}
  onClose={onClose}
  size="lg"
  position="top"
  closeOnBackdropClick={false}
>
  <div>Большое модальное окно</div>
</GlassModal>
```

#### Модалка на весь экран

```tsx
<GlassModal isOpen={isOpen} onClose={onClose} size="full" className="p-8">
  <div>Полноэкранная модалка</div>
</GlassModal>
```

## Варианты (Variants)

### light

- `bg-white/20` - полупрозрачный белый фон
- Подходит для светлых фонов

### dark

- `bg-black/30` - полупрозрачный черный фон
- Подходит для темных фонов

### modal

- `bg-white/95` - почти непрозрачный белый фон
- Подходит для модальных окон

## Уровни размытия (Blur)

- `sm` - backdrop-blur-sm
- `md` - backdrop-blur-md (по умолчанию)
- `lg` - backdrop-blur-lg
- `xl` - backdrop-blur-xl

## Уровни прозрачности (Opacity)

- `low` - bg-opacity-10
- `medium` - bg-opacity-20 (по умолчанию)
- `high` - bg-opacity-40

## Скругления (Rounded)

- `none` - без скруглений
- `sm` - rounded-sm
- `md` - rounded-md
- `lg` - rounded-lg (по умолчанию)
- `xl` - rounded-xl
- `full` - rounded-full

## Отступы (Padding)

- `none` - p-0
- `sm` - p-2
- `md` - p-4 (по умолчанию)
- `lg` - p-6
- `xl` - p-8

## Примеры реальных компонентов

### SurveyCard со стеклянным эффектом

```tsx
// Обновленный SurveyCard использует GlassContainer
<GlassContainer
  variant={isSelected ? "dark" : "light"}
  blur="sm"
  opacity={isSelected ? "high" : "low"}
  rounded="md"
  border={isSelected}
>
  {label}
</GlassContainer>
```

### ConfirmDeleteModal

```tsx
// Модалка подтверждения удаления
<GlassModal isOpen={open} onClose={closeModal} size="md">
  <div>Удалить презентацию?</div>
</GlassModal>
```
