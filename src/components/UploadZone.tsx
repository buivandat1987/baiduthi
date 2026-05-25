import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { UploadedFile } from "../types";

interface UploadZoneProps {
  onFileUploaded: (file: UploadedFile) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  isProcessing: boolean;
}

export default function UploadZone({
  onFileUploaded,
  onUploadStart,
  onUploadEnd,
  isProcessing,
}: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    // Basic guard: 15MB size limit to avoid out of memory / gateway timeouts
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg("Kích thước tệp quá lớn. Vui lòng tải tài liệu dưới 15MB.");
      return;
    }

    setErrorMsg(null);
    onUploadStart();
    setProgressMsg(`Đang đọc tệp "${file.name}"...`);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Result = (reader.result as string).split(",")[1];
        setProgressMsg(`Trí tuệ nhân tạo Gemini đang phân tích nội dung tệp...`);

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            content: base64Result,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Không thể phân tích tệp.");
        }

        const analysis = await response.json();

        const newUploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          content: base64Result,
          textPreview: analysis.textPreview || "",
          uploadedAt: new Date().toISOString(),
          category: analysis.category || "Khác",
          summary: analysis.summary || "Tài liệu này chưa có tóm tắt chi tiết.",
          tags: analysis.tags || [],
          keyPoints: analysis.keyPoints || [],
        };

        onFileUploaded(newUploadedFile);
        setProgressMsg("");
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Đã xảy ra lỗi trong quá trình xử lý tệp với Gemini.");
      } finally {
        onUploadEnd();
      }
    };

    reader.onerror = () => {
      setErrorMsg("Có lỗi xảy ra khi đọc tệp từ trình điều khiển cục bộ.");
      onUploadEnd();
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full" id="upload-zone-wrapper">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={isProcessing ? undefined : onButtonClick}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-350 cursor-pointer flex flex-col items-center justify-center text-center outline-none ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
            : "border-slate-300 hover:border-indigo-400 bg-white/60 hover:bg-white"
        } ${isProcessing ? "opacity-90 pointer-events-none select-none" : ""}`}
        id="drag-drop-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,text/*,application/json,.csv,.md,.js,.ts,.tsx"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <Sparkles className="absolute w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-1.5 px-4">
              <p className="text-sm font-semibold text-slate-800 animate-pulse">
                {progressMsg}
              </p>
              <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                Gemini đang giải nén văn bản, nhận dạng bảng biểu, dịch mã màu và phân tích ngữ cảnh...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 space-y-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100 transition-colors">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-slate-800">
                Kéo & thả tập tin vào đây hoặc <span className="text-indigo-600 font-semibold hover:underline">Ấn để chọn</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ PDF, Ảnh (PNG, JPG), Văn bản (TXT, CSV, JSON, MD) tối đa 15MB
              </p>
            </div>
          </div>
        )}

        {/* Scan line effect helper */}
        {isProcessing && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent pointer-events-none"
          />
        )}
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start gap-2.5 text-xs"
          id="upload-error-block"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Lỗi tải lên:</span> {errorMsg}
          </div>
        </motion.div>
      )}
    </div>
  );
}
