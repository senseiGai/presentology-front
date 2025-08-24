// shared/lib/toasts.tsx
import { toast } from "sonner";
import React from "react";
import { X } from "lucide-react";

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
      <div className="relative  left-[88px] w-[350px] h-[157px] rounded-[20px] bg-white shadow-lg p-3">
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
  durationMs = 3000,
}: RestoredToastArgs) {
  toast.custom(
    (t) => (
      <div className="relative left-[88px] w-[350px] h-[106px] rounded-[20px] bg-white shadow-lg p-3">
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
