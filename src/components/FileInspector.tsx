import React, { useState } from "react";
import {
  X,
  FileText,
  Bookmark,
  Hash,
  Activity,
  Copy,
  Check,
  Eye,
  FileCheck,
  Clipboard,
  AlertCircle,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { UploadedFile } from "../types";
import { formatBytes, getCategoryBadgeClasses } from "../utils";

interface FileInspectorProps {
  file: UploadedFile | null;
  onClose: () => void;
  onSendShortcutText: (text: string) => void;
  selectedForChat: string[];
  onToggleChatSelect: (id: string) => void;
}

export default function FileInspector({
  file,
  onClose,
  onSendShortcutText,
  selectedForChat,
  onToggleChatSelect,
}: FileInspectorProps) {
  const [copied, setCopied] = useState(false);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl min-h-[300px]">
        <HelpCircle className="w-10 h-10 text-slate-400 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">Chưa có tài liệu được chọn</h4>
        <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-relaxed">
          Ấn nút <span className="font-semibold text-slate-700">Chi tiết</span> bên cạnh bất kỳ tập tin nào để xem tóm tắt, từ khóa và nội dung trích xuất chi tiết từ Gemini.
        </p>
      </div>
    );
  }

  const isChatSelected = selectedForChat.includes(file.id);

  const handleCopySummary = () => {
    const summaryText = `[TÊN FILE]: ${file.name}
[PHÂN LOẠI]: ${file.category}
[TÓM TẮT]: ${file.summary}
[CÁC ĐIỂM CHÍNH]:
- ${file.keyPoints?.join("\n- ") || "Không có"}
[TỪ KHÓA]: ${file.tags?.join(", ") || "Không có"}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full animate-fade-in" id="file-inspector-panel">
      {/* File Inspector Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate leading-tight" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {formatBytes(file.size)} • {file.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 text-slate-450 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Đóng bản chi tiết"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Details Scroll Area */}
      <div className="flex-1 p-4.5 overflow-y-auto space-y-4.5">
        {/* Core Quick Toggle Action */}
        <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-center justify-between gap-3.5">
          <div className="space-y-0.5">
            <div className="text-[12px] font-semibold text-slate-800 flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Chế độ đặt câu hỏi nhanh
            </div>
            <p className="text-[11px] text-slate-500">
              {isChatSelected ? "Đã bật nối kết với Trợ lý Hỏi đáp" : "Bật để bắt đầu trò chuyện về tài liệu này"}
            </p>
          </div>
          <button
            onClick={() => onToggleChatSelect(file.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isChatSelected
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 shadow-3xs"
            }`}
          >
            {isChatSelected ? "Đã chọn Hỏi" : "Chọn Hỏi"}
          </button>
        </div>

        {/* Category & Tags Row */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            Phân loại & Thẻ
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeClasses(file.category)}`}>
              {file.category}
            </span>
            {file.tags && file.tags.map((tag) => (
              <span
                key={tag}
                onClick={() => onSendShortcutText(`Hãy giải thích về khía cạnh "${tag}" được đề cập trong tài liệu.`)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 hover:text-indigo-600 transition-colors text-slate-600 border border-slate-200/50 rounded-full text-[11px] font-medium cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Summary Block */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Tóm tắt từ Gemini
            </div>
            <button
              onClick={handleCopySummary}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Sao chép toàn bộ tóm tắt"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép tóm tắt</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-slate-700 text-sm leading-relaxed">{file.summary}</p>
          </div>
        </div>

        {/* Key points bullet points */}
        {file.keyPoints && file.keyPoints.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              Các điểm cốt lõi nổi bật ({file.keyPoints.length})
            </div>
            <ul className="space-y-1.5">
              {file.keyPoints.map((point, index) => (
                <li
                  key={index}
                  onClick={() => onSendShortcutText(`Tìm thêm chi tiết liên quan đến ý chính: "${point}"`)}
                  className="p-2 text-xs bg-slate-50/40 hover:bg-slate-50 border border-slate-200/40 hover:border-indigo-100 rounded-lg text-slate-700 flex items-start gap-2.5 transition-all cursor-pointer"
                >
                  <span className="h-5 w-5 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center shrink-0 text-[10px]">
                    {index + 1}
                  </span>
                  <span className="flex-1 leading-normal">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted text Preview Panel (OCR content / Text snapshot) */}
        {file.textPreview && file.textPreview.trim() !== "" && (
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Trích xuất xem trước văn bản
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl relative">
              <pre className="text-[11.5px] font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[160px] scrollbar-thin">
                {file.textPreview}
              </pre>
              <div className="absolute top-1 right-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(file.textPreview || "");
                  }}
                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-md text-slate-400 transition-colors cursor-pointer"
                  title="Sao chép nội dung văn bản trích xuất"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
