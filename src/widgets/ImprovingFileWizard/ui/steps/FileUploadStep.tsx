import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePresentationCreationStore } from "../../model/useImproveFileWizard";
import {
  useExtractFiles,
  useGenerateBrief,
  useAnalyzeStructure,
} from "@/shared/api/uploads";
import type { ExtractedFile } from "../../model/types";
import BigFolderIcon from "../../../../../public/icons/BigFolderIcon";
import DocIcon from "../../../../../public/icons/DocIcon";
import CsvIcon from "../../../../../public/icons/CsvIcon";
import FilePdfIcon from "../../../../../public/icons/FilePdfIcon";
import TxtIcon from "../../../../../public/icons/TxtIcon";
import CheckCircleIcon from "../../../../../public/icons/CheckCircleIcon";
import GrayTrashIcon from "../../../../../public/icons/GrayTrashIcon";
import SandWatchIcon from "../../../../../public/icons/SandWatchIcon";

interface FileUploadStepProps {
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  isCompleted?: boolean;
}

interface UploadedFile {
  file: File;
  status: "uploading" | "success" | "error" | "processing";
  progress: number;
}

const FILE_EXTENSIONS = [
  { ext: ".docx", color: "#3451b2", bg: "#e6edfe" },
  { ext: ".csv", color: "#18794e", bg: "#ddf3e4" },
  { ext: ".pdf", color: "#ca3214", bg: "#ffe6e2" },
  { ext: ".txt", color: "#946800", bg: "#fff8bb" },
  { ext: ".pptx", color: "#bd4b00", bg: "#ffe8d7" },
  { ext: ".xlsx", color: "#5d770d", bg: "#e4f7c7" },
  { ext: ".jpeg", color: "#0c7792", bg: "#d8f3f6" },
  { ext: ".jpg", color: "#0c7792", bg: "#d8f3f6" },
  { ext: ".png", color: "#0c7792", bg: "#d8f3f6" },
];

export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onNext,
  onBack,
  canProceed = true,
  isCompleted = false,
}) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isDesignMode = mode === "design";

  const { presentationData, updatePresentationData } =
    usePresentationCreationStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API хуки
  const extractFilesMutation = useExtractFiles();
  const generateBriefMutation = useGenerateBrief();
  const analyzeStructureMutation = useAnalyzeStructure();

  // Initialize uploaded files from store on mount
  useEffect(() => {
    if (presentationData.uploadedFiles?.length) {
      const initialFiles = presentationData.uploadedFiles.map((file: File) => ({
        file,
        status: "success" as const,
        progress: 100,
      }));
      setUploadedFiles(initialFiles);
    }
  }, [presentationData.uploadedFiles]);

  const handleFileSelect = async (files: FileList) => {
    const filesArray = Array.from(files);

    // Валидация файлов для режима "Улучши файл"
    if (!isDesignMode) {
      const invalidFiles = filesArray.filter((file) => {
        const ext = file.name.toLowerCase().split(".").pop();
        return ext !== "pdf" && ext !== "pptx";
      });

      if (invalidFiles.length > 0) {
        alert(
          `Для режима "Улучши файл" доступны только PDF и PPTX файлы. Недопустимые файлы: ${invalidFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }
    }

    const newFiles = filesArray.map((file) => ({
      file,
      status: "uploading" as const,
      progress: 50,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    try {
      // 1. Извлекаем текст из файлов
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "processing" as const, progress: 75 }))
      );

      const extractResponse = await extractFilesMutation.mutateAsync(
        filesArray
      );

      if (extractResponse.success) {
        setExtractedFiles(extractResponse.data.files);

        // 2. Генерируем бриф
        const briefResponse = await generateBriefMutation.mutateAsync({
          files: extractResponse.data.files,
        });

        // 3. Анализируем структуру
        const structureResponse = await analyzeStructureMutation.mutateAsync({
          files: extractResponse.data.files,
        });

        // Обновляем статус файлов на успех
        setUploadedFiles((prev) =>
          prev.map((f) => ({ ...f, status: "success" as const, progress: 100 }))
        );

        // Сохраняем результаты в store
        updatePresentationData({
          uploadedFiles: filesArray,
          extractedFiles: extractResponse.data.files,
          brief: briefResponse.success ? briefResponse.data : undefined,
          structure: structureResponse.success
            ? structureResponse.data
            : undefined,
        });
      } else {
        throw new Error("Не удалось извлечь текст из файлов");
      }
    } catch (error: any) {
      console.error("File processing error:", error);

      // Обновляем статус файлов на ошибку
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "error" as const, progress: 100 }))
      );

      // Показываем ошибку пользователю
      if (error.message === "Добавьте хотя бы один файл") {
        alert("Добавьте хотя бы один файл");
      } else {
        alert("Не удалось обработать файлы. Попробуйте еще раз.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    // Также очищаем извлеченные данные если удаляются все файлы
    setUploadedFiles((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      if (remaining.length === 0) {
        setExtractedFiles([]);
        updatePresentationData({
          uploadedFiles: [],
          extractedFiles: [],
          brief: undefined,
          structure: undefined,
        });
      }
      return remaining;
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    switch (ext) {
      case "docx":
      case "doc":
      case "pptx":
      case "ppt":
      case "xlsx":
      case "xls":
        return <DocIcon className="size-6" />;
      case "csv":
        return <CsvIcon className="size-6" />;
      case "pdf":
        return <FilePdfIcon className="size-6" />;
      case "txt":
        return <TxtIcon className="size-6" />;
      case "jpeg":
      case "jpg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return <DocIcon className="size-6" />;
      default:
        return <DocIcon className="size-6" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return { text: "Загружается", color: "#BEBEC0" };
      case "processing":
        return { text: "Обработка", color: "#386AFF" };
      case "success":
        return { text: "Загружено", color: "#00CF1B" };
      case "error":
        return { text: "Ошибка", color: "#FF514F" };
      default:
        return { text: "Неизвестно", color: "#BEBEC0" };
    }
  };

  const getProgressBarColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "#386AFF";
      case "processing":
        return "#386AFF";
      case "success":
        return "#00CF1B";
      case "error":
        return "#FF514F";
      default:
        return "#BEBEC0";
    }
  };

  const truncateFileName = (fileName: string, maxLength: number = 15) => {
    if (fileName.length <= maxLength) {
      return fileName;
    }

    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const maxNameLength = maxLength - (extension ? extension.length + 4 : 3); // Account for "..." and "."

    if (maxNameLength <= 0) {
      return `...${extension ? "." + extension : ""}`;
    }

    const truncatedName = nameWithoutExt.substring(0, maxNameLength);
    return `${truncatedName}...${extension ? "." + extension : ""}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-10 pt-8 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full max-w-[356px]">
          <h2 className="font-['Onest'] text-[#0b0911] text-[24px] font-medium leading-[1.3] tracking-[-0.48px]">
            Основа презентации
          </h2>
          <div className="flex flex-wrap gap-1 max-w-[226px]">
            {FILE_EXTENSIONS.filter(
              ({ ext }) => isDesignMode || ext === ".pdf" || ext === ".pptx"
            ).map(({ ext, color, bg }) => (
              <div
                key={ext}
                className="px-2 py-1 rounded-[4px] font-['Onest'] text-[12px] font-medium leading-[1.3] tracking-[-0.36px]"
                style={{ backgroundColor: bg, color }}
              >
                {ext}
              </div>
            ))}
          </div>

          {/* Upload area */}
          <div
            className={`bg-[#F3F6FF] h-[150px] rounded-[8px] border border-dashed transition-colors relative cursor-pointer ${
              isDragOver
                ? "border-[#bba2fe] bg-[#EEF2FF]"
                : "border-[#C0C0C1] hover:bg-[#EEF2FF]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col gap-1.5 items-center justify-center w-[210px] mx-auto h-full">
              <BigFolderIcon />
              <div className="font-['Onest'] text-[14px] font-normal text-[#8F8F92] text-center tracking-[-0.42px] leading-[1.2]">
                Перетащите сюда файлы
                <br />
                или нажмите для выбора
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex gap-2 items-center w-full">
                  {getFileIcon(file.file.name)}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between items-center font-['Onest'] text-[12px] font-normal leading-[1.3] tracking-[-0.36px]">
                      <span className="text-[#0b0911] truncate flex-1 min-w-0 pr-2">
                        {truncateFileName(file.file.name)}
                      </span>
                      <span
                        className="text-nowrap flex-shrink-0"
                        style={{ color: getStatusText(file.status).color }}
                      >
                        {getStatusText(file.status).text}
                      </span>
                    </div>
                    <div className="bg-[#f4f4f4] h-[4px] rounded-[8px] overflow-hidden w-full">
                      <div
                        className="h-[4px] rounded-[8px] transition-all duration-300"
                        style={{
                          backgroundColor: getProgressBarColor(file.status),
                          width: `${file.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(file.status === "uploading" ||
                      file.status === "processing") && (
                      <SandWatchIcon className="size-6" />
                    )}
                    {file.status === "success" && (
                      <CheckCircleIcon className="size-6" />
                    )}
                    {(file.status === "success" || file.status === "error") && (
                      <button onClick={() => removeFile(index)}>
                        <GrayTrashIcon className="size-6" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f0f0f0] rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] px-10 py-6">
        <div className="flex gap-2 h-[52px]">
          <button
            onClick={onBack}
            className="w-[174px] h-[52px] bg-white border border-[#c0c0c1] rounded-[8px] flex items-center justify-center font-['Onest'] text-[#0b0911] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={canProceed ? onNext : undefined}
            disabled={!canProceed}
            className={`flex-1 h-[52px] rounded-[8px] flex items-center justify-center font-['Onest'] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal transition-colors ${
              canProceed
                ? "bg-[#bba2fe] text-white hover:bg-[#a688fd] cursor-pointer"
                : "bg-[#DDD1FF] text-white"
            }`}
          >
            Далее
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={
          isDesignMode
            ? ".docx,.csv,.pdf,.txt,.pptx,.xlsx,.jpeg,.jpg,.png"
            : ".pdf,.pptx"
        }
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
