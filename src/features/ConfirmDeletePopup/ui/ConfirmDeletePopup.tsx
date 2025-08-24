"use client";
import React, { useEffect, useRef } from "react";
import { useConfirmDeleteStore } from "../model/use-confirm-delete-popup";
import { X } from "lucide-react";
import { toast } from "sonner"; // ⬅️ добавили
import { showDeletedToast } from "@/shared/lib/toasts";

export function ConfirmDeleteModal() {
  const { open, title, description, onConfirm, closeModal } =
    useConfirmDeleteStore();

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  const backdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onMouseDown={backdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[10px]" />

      <div
        ref={dialogRef}
        className="relative z-10 w-[450px] h-[378px] flex items-center justify-center flex-col rounded-[20px] bg-white shadow-lg p-[24px] animate-[modalIn_.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
          <span className="text-[18px] font-[400] text-[#8F8F92]">esc</span>
          <button
            aria-label="Закрыть"
            onClick={closeModal}
            className="text-[#8F8F92] cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="mt-[48px] max-w-[320px] text-center">
          <h3 className="text-[24px] leading-tight font-medium text-[#0B0911]">
            Удалить <br /> «{title}»?
          </h3>
          <p className="mt-[24px] text-[14px] font-medium text-[#BEBEC0] mx-4">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto w-full">
          <button
            onClick={closeModal}
            className="h-[52px] cursor-pointer rounded-[8px] bg-[#F4F4F4] text-[#0B0911] hover:bg-[#E9EAEE] transition-colors ease-in-out duration-300"
          >
            Оставить
          </button>
          <button
            onClick={async () => {
              await onConfirm?.(); // удалили
              showDeletedToast({
                title,
                onUndo: () => {
                  console.log("Undo delete presentation:");
                },
                durationMs: 5000,
              });
              closeModal();
            }}
            className="h-[52px] rounded-[8px] text-white bg-[#FF514F] hover:bg-[#FF3030] transition-colors cursor-pointer ease-in-out duration-300"
          >
            Удалить
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            transform: translateY(6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
