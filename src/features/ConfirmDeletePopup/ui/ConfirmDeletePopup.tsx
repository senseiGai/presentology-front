"use client";
import React from "react";
import { useConfirmDeleteStore } from "../model/use-confirm-delete-popup";
import { X } from "lucide-react";
import { toast } from "sonner"; // ⬅️ добавили
import { showDeletedToast } from "@/shared/lib/toasts";
import { GlassModal } from "@/shared/ui/GlassModal";

export function ConfirmDeleteModal() {
  const { open, title, description, closeModal } = useConfirmDeleteStore();

  return (
    <GlassModal
      isOpen={open}
      onClose={closeModal}
      size="md"
      className="h-[378px]"
    >
      <div className="flex items-center justify-center flex-col h-full relative">
        <div className="absolute right-0 top-0 w-[85px] h-[40px] flex items-center justify-center rounded-[8px] gap-x-2 bg-[#F4F4F4] hover:bg-[#E9EAEE] transition-colors duration-300 ease-in-out">
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
    </GlassModal>
  );
}
