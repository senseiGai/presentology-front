"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useWindowWidth } from "@/shared/hooks/useWindowWidth";

export interface PaymentHistoryItem {
  date: string;
  amount: string;
  status: "Успешно" | "Ошибка";
}

interface PaymentHistoryTableProps {
  data: PaymentHistoryItem[];
  itemsPerPage?: number;
  className?: string;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  data,
  itemsPerPage = 8,
  className = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const windowWidth = useWindowWidth();

  if (windowWidth <= 1535) itemsPerPage = 7;
  else itemsPerPage = 9;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`cursor-pointer w-[32px] h-[32px] rounded-[8px] text-[18px] font-[400] transition-colors ${
            currentPage === i
              ? "bg-white "
              : "bg-white text-[#0B0911]/50 opacity-50 "
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-[16px]">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer w-[32px] h-[32px] rounded-[8px] bg-[#F4F4F4] text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#939396]" />
        </button>
        {pages}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer w-[32px] h-[32px] rounded-[8px] bg-[#F4F4F4] text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-[#939396]" />
        </button>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="border-[1px] border-white rounded-[12px] overflow-hidden">
        <div className="grid grid-cols-[2.1fr_1fr_1fr]">
          <div className="p-3 text-white font-[400] text-[14px] bg-[#FFFFFF1A]">
            Дата
          </div>
          <div className="p-3 text-white font-[400] text-[14px] border-l border-white bg-[#FFFFFF1A]">
            Сумма
          </div>
          <div className="p-3 text-white font-[400] text-[14px] border-l border-white bg-[#FFFFFF1A]">
            Статус
          </div>
        </div>

        {currentData.map((item, index) => (
          <div key={index} className="grid grid-cols-[2.1fr_1fr_1fr]">
            <div className="pl-[12px] pt-[12.5px] pb-[12.5px] text-white font-[400] text-[14px]">
              {item.date}
            </div>
            <div className="p-[12px] text-white font-[400] text-[14px] border-l-[1px] border-white">
              {item.amount}
            </div>
            <div
              className={`p-[12px] font-[400] text-[14px] border-l-[1px] border-white text-white`}
            >
              {item.status}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {data.length === 0 && (
          <div className="p-8 text-center text-white/60">
            История платежей пуста
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
