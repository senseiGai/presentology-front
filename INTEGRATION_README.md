# Presentology Frontend - Авторизация

Этот проект интегрирован с системой авторизации, использующей TanStack Query v5, Axios и Zustand для управления состоянием.

## 🔧 Установленные зависимости

- `@tanstack/react-query` - для управления состоянием сервера
- `@tanstack/react-query-devtools` - инструменты разработчика (dev-зависимость)
- `axios` - для HTTP запросов
- `zustand` - для управления клиентским состоянием (уже был установлен)

## 🏗️ Архитектура авторизации

### API слой (`src/shared/api/`)

- `config.ts` - настройка axios клиента с интерцепторами
- `auth.api.ts` - API методы для авторизации
- `presentations.api.ts` - API методы для презентаций
- `types.ts` - TypeScript типы для API
- `index.ts` - экспорт всех API функций

### Хуки (`src/shared/hooks/`)

- `useAuth.ts` - хуки для авторизации (логин, регистрация, социальные сети)
- `usePresentations.ts` - хуки для работы с презентациями

### Сторы (`src/shared/stores/`)

- `useAuthStore.ts` - глобальный стор авторизации с персистентностью

### Провайдеры (`src/shared/providers/`)

- `QueryProvider.tsx` - провайдер TanStack Query

### Компоненты безопасности (`src/shared/components/`)

- `AuthInitializer.tsx` - инициализация авторизации при загрузке
- `ProtectedRoute.tsx` - защита приватных страниц
- `PublicRoute.tsx` - ограничение доступа авторизованных к публичным страницам

## 🔐 Безопасность

### Автоматическое обновление токенов

- Интерцептор axios автоматически добавляет JWT токены к запросам
- При истечении access token автоматически обновляется через refresh token
- При неудачном обновлении пользователь перенаправляется на страницу логина

### Защита роутов

- Приватные страницы (`/home`, `/presentations`) защищены `ProtectedRoute`
- Публичные страницы (`/login`, `/registration`) используют `PublicRoute`
- Автоматическое перенаправление в зависимости от статуса авторизации

## 🚀 Использование

### Логин

```typescript
import { useLogin } from "@/shared/hooks/useAuth";

const loginMutation = useLogin();

const handleLogin = async () => {
  try {
    await loginMutation.mutateAsync({ email, password });
    // Пользователь автоматически перенаправляется
  } catch (error) {
    // Обработка ошибки
  }
};
```

### Регистрация

```typescript
import { useRegister } from "@/shared/hooks/useAuth";

const registerMutation = useRegister();

const handleRegister = async () => {
  try {
    await registerMutation.mutateAsync({
      email,
      password,
      firstName,
      lastName,
    });
    // Пользователь автоматически авторизуется
  } catch (error) {
    // Обработка ошибки
  }
};
```

### Получение профиля пользователя

```typescript
import { useProfile } from "@/shared/hooks/useAuth";

const { data: user, isLoading } = useProfile();
```

### Выход из системы

```typescript
import { useAuthStore } from "@/shared/stores/useAuthStore";

const { logout } = useAuthStore();

const handleLogout = async () => {
  await logout();
  // Пользователь автоматически перенаправляется на /login
};
```

## 🌐 Переменные окружения

Создайте файл `.env.local` со следующими переменными:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

## 📱 Социальная авторизация

Поддерживаются следующие провайдеры:

- Google OAuth
- Yandex OAuth
- VK OAuth
- Telegram Auth

Для настройки социальной авторизации обновите соответствующие кнопки в компонентах, чтобы они использовали хуки:

- `useGoogleAuth()`
- `useYandexAuth()`
- `useVkAuth()`
- `useTelegramAuth()`

## 🔧 Настройка компонентов

### Обновленные виджеты

- `LoginBlock` - интегрирован с API
- `RegistrationBlock` - интегрирован с API и расширен полями имени
- `SideBar` - показывает информацию пользователя и кнопку выхода

### Обновленные страницы

- `/login` - защищена `PublicRoute`
- `/registration` - защищена `PublicRoute`
- `/home` - защищена `ProtectedRoute`

## 🛠️ DevTools

В режиме разработки доступны TanStack Query DevTools для отладки состояния запросов.

## 📋 TODO для полной интеграции

1. Обновить социальные кнопки для работы с OAuth
2. Добавить обработку ошибок сети
3. Реализовать пагинацию для списка презентаций
4. Добавить кэширование пользователя с TTL
5. Интегрировать с системой уведомлений
