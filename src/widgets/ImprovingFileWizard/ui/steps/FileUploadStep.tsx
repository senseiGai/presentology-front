import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePresentationCreationStore } from "../../model/useImproveFileWizard";
import {
  useExtractFiles,
  useGenerateBrief,
  useAnalyzeStructure,
} from "@/shared/api/uploads";
import type { ExtractedFile } from "../../model/types";
import { useExtractPdfAndGenerateBrief } from "@/shared/api/pdfProcessing";
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
  const pdfExtractAndBriefMutation = useExtractPdfAndGenerateBrief();

  // Функция для разделения файлов по типам
  const categorizeFiles = (
    files: File[]
  ): { pdfFiles: File[]; otherFiles: File[] } => {
    const pdfFiles: File[] = [];
    const otherFiles: File[] = [];

    files.forEach((file) => {
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        pdfFiles.push(file);
      } else {
        otherFiles.push(file);
      }
    });

    return { pdfFiles, otherFiles };
  };

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
      // 1. Разделяем файлы по типам
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "processing" as const, progress: 25 }))
      );

      const { pdfFiles, otherFiles } = categorizeFiles(filesArray);
      let allExtractedFiles: ExtractedFile[] = [];
      let briefData: any = undefined;

      // 2. Обрабатываем PDF файлы через специальный эндпоинт
      if (pdfFiles.length > 0) {
        setUploadedFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "processing" as const,
            progress: 40,
          }))
        );

        const pdfResponse = await pdfExtractAndBriefMutation.mutateAsync(
          pdfFiles
        );

        if (pdfResponse.success) {
          console.log("📄 PDF processing successful:", {
            extractedTexts: pdfResponse.data.extractedTexts,
            brief: pdfResponse.data.brief,
            filesProcessed: pdfResponse.data.filesProcessed,
          });

          // Создаем ExtractedFile объекты из ответа
          const pdfExtractedFiles: ExtractedFile[] =
            pdfResponse.data.extractedTexts.map(
              (text: string, index: number) => ({
                name: pdfFiles[index]?.name || `pdf-file-${index + 1}.pdf`,
                type: "application/pdf",
                size: pdfFiles[index]?.size || 0,
                text: text,
              })
            );

          console.log("📁 Created PDF extracted files:", pdfExtractedFiles);

          allExtractedFiles.push(...pdfExtractedFiles);
          briefData = pdfResponse.data.brief;

          console.log("📚 All extracted files after PDF processing:", {
            count: allExtractedFiles.length,
            files: allExtractedFiles.map((f) => ({
              name: f.name,
              textLength: f.text?.length,
            })),
          });
        } else {
          console.error("❌ PDF processing failed:", pdfResponse);
        }
      }

      // 3. Обрабатываем остальные файлы через обычный эндпоинт
      if (otherFiles.length > 0) {
        setUploadedFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "processing" as const,
            progress: 60,
          }))
        );

        const extractResponse = await extractFilesMutation.mutateAsync(
          otherFiles
        );

        if (extractResponse.success) {
          allExtractedFiles.push(...extractResponse.data.files);

          // Если у нас еще нет брифа (не было PDF файлов), генерируем его
          if (!briefData) {
            const briefResponse = await generateBriefMutation.mutateAsync({
              texts: extractResponse.data.files.map((file) => file.text),
            });

            if (briefResponse.success) {
              briefData = briefResponse.data;
            }
          }
        }
      }

      // 4. Анализируем структуру всех файлов
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "processing" as const, progress: 80 }))
      );

      let structureData = undefined;

      console.log("📊 Structure Analysis Debug:", {
        allExtractedFilesCount: allExtractedFiles.length,
        allExtractedFiles: allExtractedFiles.map((f) => ({
          name: f.name,
          textLength: f.text?.length || 0,
          textPreview: f.text?.substring(0, 100) + "...",
        })),
      });

      // Анализируем структуру только если есть извлеченные файлы
      if (allExtractedFiles.length > 0) {
        const validFiles = allExtractedFiles.filter(
          (file) => file.text && file.text.trim().length > 0
        );

        console.log("📋 Files for structure analysis:", {
          extractedFilesCount: validFiles.length,
          filesPreview: validFiles.map(
            (file, i) => `${i}: ${file.name} (${file.text.substring(0, 50)}...)`
          ),
        });

        if (validFiles.length > 0) {
          try {
            console.log(
              "🔍 Starting structure analysis with",
              validFiles.length,
              "files"
            );
            const structureResponse =
              await analyzeStructureMutation.mutateAsync({
                files: allExtractedFiles,
              });

            console.log("✅ Structure analysis response:", structureResponse);

            if (structureResponse.success) {
              structureData = structureResponse.data;
            }
          } catch (error) {
            console.error("❌ Structure analysis failed:", error);
            console.error("Error details:", {
              message: error instanceof Error ? error.message : "Unknown error",
              name: error instanceof Error ? error.name : "Unknown",
              stack: error instanceof Error ? error.stack : "No stack trace",
            });
            // Продолжаем выполнение даже если анализ структуры не удался
          }
        } else {
          console.log("⚠️ No valid files found for structure analysis");
        }
      } else {
        console.log("⚠️ No extracted files available for structure analysis");
      }

      // Обновляем статус файлов на успех
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "success" as const, progress: 100 }))
      );

      setExtractedFiles(allExtractedFiles);

      // Сохраняем результаты в store
      updatePresentationData({
        uploadedFiles: filesArray,
        extractedFiles: allExtractedFiles,
        brief: briefData,
        structure: structureData,
      });
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
        console.error("Detailed error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        alert(
          `Не удалось обработать файлы: ${
            error.message || "Неизвестная ошибка"
          }`
        );
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
      <div className="bg-white mx-4 border-t border-[#f0f0f0] rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_6px_0px_rgba(0,0,0,0.03)] px-10 py-6">
        <div className="flex gap-2 h-[52px]">
          <button
            onClick={onBack}
            className="flex-1 h-[52px] bg-white border border-[#c0c0c1] rounded-[8px] flex items-center justify-center font-['Onest'] text-[#0b0911] text-[18px] leading-[1.2] tracking-[-0.36px] font-normal hover:bg-gray-50 transition-colors"
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
