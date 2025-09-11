// shared/lib/toasts.tsx
import { toast } from "sonner";
import React from "react";
import { X } from "lucide-react";
import WarningIcon from "../../../public/icons/WarningIcon";
import SmileFaceIcon from "../../../public/icons/SmileFaceIcon";
import NormalFaceIcon from "../../../public/icons/NormalFaceIcon";
import SadFaceIcon from "../../../public/icons/SadFaceIcon";

type DeletedToastArgs = {
  title: string;
  onUndo?: () => void;
  durationMs?: number; // по умолчанию 5000
};

type RestoredToastArgs = {
  title: string;
  durationMs?: number; // по умолчанию 3000
};

export function showDeletedToast({
  title,
  onUndo,
  durationMs = 5000,
}: DeletedToastArgs) {
  toast.custom(
    (t) => (
      <div className="relative -ml-7 w-[350px] h-[157px] rounded-[20px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
            ✓
          </span>
          <div className="flex-1">
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Успешно удалена
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-[#8F8F92] text-[14px] font-medium mt-[16px]">
          Презентация “{title}”
        </div>

        {onUndo && (
          <button
            onClick={() => {
              onUndo();
              toast.dismiss(t);
              // Show restored toast
              showRestoredToast({ title });
            }}
            className="mt-[16px] w-full h-[40px] rounded-[8px] border-[1px] border-[#C0C0C1] text-[18px] text-[#0B0911] bg-white font-normal hover:bg-[#F6F7FA] transition cursor-pointer"
          >
            Вернуть
          </button>
        )}

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3">
          <div
            className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${durationMs}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: durationMs }
  );
}

export function showRestoredToast({
  title,
  durationMs = 5000,
}: RestoredToastArgs) {
  toast.custom(
    (t) => (
      <div className="relative -ml-7 w-[350px] h-[106px] rounded-[20px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-start gap-x-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
            ✓
          </span>
          <div className="flex-1">
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Успешно восстановлена
            </div>
            <div className="text-[#8F8F92] text-[14px] font-medium mt-[2px]">
              Презентация &quot;{title}&quot;
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3 mt-[16px]">
          <div
            className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${durationMs}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: durationMs }
  );
}

export function showSubscriptionCancelledToast() {
  toast.custom(
    (t) => (
      <div className="relative -ml-7 w-[369px] h-[106px] rounded-[20px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-center gap-x-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
            ✓
          </span>
          <div className="flex-1">
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Подписка успешно отменена{" "}
            </div>
            <div className="text-[#8F8F92] text-[14px] font-medium mt-[2px]">
              Спасибо, что были с нами! Ждем с нетерпением вашего возвращения
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3 mt-[16px]">
          <div
            className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${5000}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: 5000 }
  );
}

export function showTariffChangedToast() {
  toast.custom(
    (t) => (
      <div className="relative -ml-7 w-[350px] h-[80px] rounded-[20px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-center gap-x-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
            ✓
          </span>
          <div className="flex-1">
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Тариф успешно изменен
            </div>
            <div className="text-[#8F8F92] text-[14px] font-medium mt-[2px]">
              Спасибо, что вы с нами!
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3">
          <div
            className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${5000}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: 5000 }
  );
}

export function showUploadErrorToast() {
  toast.custom(
    (t) => (
      <div className="relative -ml-7 w-[350px] h-[106px] rounded-[20px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-center gap-x-4">
          <WarningIcon />
          <div className="flex-1">
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Загрузка не прошла
            </div>
            <div className="text-[#8F8F92] max-w-[242px] text-[14px] font-medium mt-[2px]">
              Изображение должно быть не больше 10 Мб
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3">
          <div
            className="h-[70%] bg-[#FF4444] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${5000}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: 5000 }
  );
}

// Компонент для toast с автозакрытием
const PresentationFeedbackToastContent: React.FC<{
  toastId: string | number;
}> = ({ toastId }) => {
  // Автоматически закрываем toast через 5 секунд
  React.useEffect(() => {
    const timer = setTimeout(() => {
      toast.dismiss(toastId);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toastId]);

  return (
    <div className="relative w-[350px] h-[157px] rounded-[12px] bg-white shadow-lg p-3 z-[99999999]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
            ✓
          </span>
          <div className="text-[#0B0911] text-[18px] font-semibold">
            Генерация завершена!
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>
      </div>

      <span className="text-[#8F8F92] text-[14px] font-medium mb-4 block">
        Пожалуйста, оцените качество презентации
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log("Positive feedback");
            toast.dismiss(toastId);
          }}
          className="flex-1 h-[40px] rounded-[12px] border-[1px] border-[#C0C0C1] cursor-pointer flex items-center justify-center bg-white hover:bg-[#F0FDF4]"
        >
          <SmileFaceIcon />
        </button>
        <button
          onClick={() => {
            console.log("Neutral feedback");
            toast.dismiss(toastId);
            showFeedbackFormToast();
          }}
          className="flex-1 h-[40px] rounded-[12px] border-[1px] border-[#C0C0C1] cursor-pointer flex items-center justify-center bg-white hover:bg-[#FFFBF0]"
        >
          <NormalFaceIcon />
        </button>
        <button
          onClick={() => {
            console.log("Negative feedback");
            toast.dismiss(toastId);
            showFeedbackFormToast();
          }}
          className="flex-1 h-[40px] rounded-[12px] border-[1px] border-[#C0C0C1] cursor-pointer  flex items-center justify-center bg-white hover:bg-[#FEF2F2]"
        >
          <SadFaceIcon />
        </button>
      </div>

      <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3">
        <div
          className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
          style={{
            animation: `toastCountdown ${5000}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toastCountdown {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
};

export function showPresentationFeedbackToast() {
  toast.custom((t) => <PresentationFeedbackToastContent toastId={t} />, {
    duration: Infinity, // Отключаем встроенное автозакрытие, так как мы управляем им вручную
  });
}

export function showFeedbackFormToast() {
  toast.custom(
    (t) => (
      <div className="relative w-[350px] h-[230px] rounded-[12px] bg-white shadow-lg p-3 z-[99999999]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00CF1B] text-white text-sm">
              ✓
            </span>
            <div className="text-[#0B0911] text-[18px] font-semibold">
              Поделитесь своим мнением
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-[#8F8F92] hover:text-[#6B6B6E] cursor-pointer transition"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-[#8F8F92] text-[14px] font-medium mb-4">
          Что вам показалось неправильным?
          <br />
          <span className="text-[14px]">Ваш отзыв очень важен для нас</span>
        </div>

        <input
          placeholder="Мне бы хотелось видеть..."
          className="w-full h-[40px] pl-4 border-[1px] border-[#E9E9E9] rounded-[8px] text-[14px] text-[#0B0911] placeholder-[#8F8F92] focus:outline-none focus:border-[#BBA2FE] mb-4"
        />

        <button
          onClick={() => {
            console.log("Feedback submitted");
            toast.dismiss(t);
          }}
          className="w-full h-[40px] bg-[#BBA2FE] text-white text-[18px] font-medium rounded-[8px] hover:bg-[#A990FE] transition-colors cursor-pointer"
        >
          Отправить
        </button>

        <div className="absolute left-0 right-0 bottom-2 h-[2px] overflow-hidden ml-3">
          <div
            className="h-[70%] bg-[#00CF1B] origin-left mx-auto"
            style={{
              animation: `toastCountdown ${5000}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes toastCountdown {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    ),
    { duration: 5000 }
  );
}
