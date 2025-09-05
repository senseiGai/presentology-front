import React, { useState } from "react";
import { GlassModal } from "@/shared/ui/GlassModal";
import { Button } from "@/shared/ui/Button";

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (selectedRating !== null) {
      onSubmit(selectedRating, feedback);
      onClose();
      setSelectedRating(null);
      setFeedback("");
    }
  };

  const getRatingIcon = (rating: number) => {
    if (rating <= 2) return "😞";
    if (rating <= 4) return "😐";
    return "😊";
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "bg-[#FEE2E2] border-[#F87171]";
    if (rating <= 4) return "bg-[#FEF3C7] border-[#F59E0B]";
    return "bg-[#D1FAE5] border-[#10B981]";
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-[450px]">
        <div className="text-center mb-6">
          <div className="text-[22px] font-semibold text-[#0B0911] mb-2">
            Поделитесь своим мнением
          </div>
          <div className="text-[14px] text-[#6B7280]">
            Что вам показалось неправильным?
            <br />
            Ваш отзыв очень важен для нас
          </div>
        </div>

        {/* Rating buttons */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[20px] transition-all ${
                selectedRating === rating
                  ? getRatingColor(rating)
                  : "bg-[#F9FAFB] border-[#E5E7EB] hover:bg-[#F3F4F6]"
              }`}
            >
              {selectedRating === rating ? getRatingIcon(rating) : rating}
            </button>
          ))}
        </div>

        {/* Feedback textarea */}
        <div className="mb-6">
          <label className="block text-[14px] font-medium text-[#374151] mb-2">
            Мне бы хотелось видеть...
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Опишите, что можно улучшить"
            className="w-full h-24 p-3 border border-[#D1D5DB] rounded-[8px] resize-none focus:outline-none focus:ring-2 focus:ring-[#927DCB] focus:border-transparent"
          />
        </div>

        {/* Action button */}
        <Button
          label="Отправить"
          onClick={handleSubmit}
          disabled={selectedRating === null}
          className="w-full"
        />
      </div>
    </GlassModal>
  );
};
