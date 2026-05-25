import React, { useState } from "react";
import {
  FileText,
  Search,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  Eye,
  Info,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { UploadedFile } from "../types";
import { formatBytes, getCategoryBadgeClasses } from "../utils";

interface FileListProps {
  files: UploadedFile[];
  onDelete: (id: string) => void;
  selectedForChat: string[];
  onToggleChatSelect: (id: string) => void;
  selectedForInspect: UploadedFile | null;
  onSelectForInspect: (file: UploadedFile) => void;
}

const CATEGORIES = [
  "Tất cả",
  "Hóa đơn / Phiếu chi",
  "Hợp đồng / Văn bản pháp lý",
  "Báo cáo / Kế hoạch",
  "Học tập / Nghiên cứu",
  "Tài liệu kỹ thuật / Code",
  "Ghi chú cá nhân",
  "Khác",
];

export default function FileList({
  files,
  onDelete,
  selectedForChat,
  onToggleChatSelect,
  selectedForInspect,
  onSelectForInspect,
}: FileListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      (file.summary && file.summary.toLowerCase().includes(search.toLowerCase())) ||
      (file.tags && file.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesCategory =
      selectedCategory === "Tất cả" || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col space-y-4" id="document-manager-main">
      {/* Search & Category Filter Header */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm file, tóm tắt hoặc từ khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category horizontal scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin no-scrollbar" id="category-scroller">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* File List Grid */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white/50 border border-slate-200 p-8 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
          <FileText className="w-8 h-8 text-slate-400" />
          <div className="text-sm font-medium text-slate-700">Không tìm thấy tài liệu phù hợp</div>
          <p className="text-xs text-slate-500 max-w-[240px]">
            {files.length === 0
              ? "Vui lòng kéo thả hoặc tải file của bạn lên ở phần phía trên."
              : "Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc phân loại."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredFiles.map((file) => {
            const isChatSelected = selectedForChat.includes(file.id);
            const isInspected = selectedForInspect?.id === file.id;

            return (
              <div
                key={file.id}
                className={`group p-3 border rounded-xl transition-all duration-200 bg-white hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isInspected
                    ? "border-indigo-500 bg-indigo-50/10 shadow-xs"
                    : "border-slate-200"
                }`}
              >
                {/* File Left Core Info */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Interactive Chat Select Checkbox */}
                  <div
                    onClick={() => onToggleChatSelect(file.id)}
                    className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      isChatSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 hover:border-indigo-400 bg-slate-50"
                    }`}
                    title="Chọn tệp này để đặt câu hỏi trực tiếp với AI"
                  >
                    {isChatSelected && <CheckCircle2 className="w-4.5 h-4.5" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        onClick={() => onSelectForInspect(file)}
                        className="text-[14px] font-semibold text-slate-800 leading-tight truncate cursor-pointer hover:text-indigo-600 hover:underline"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 text-slate-500 bg-slate-50 border-slate-200/60">
                        {formatBytes(file.size)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
                      <span
                        className={`px-1.5 py-0.2 rounded font-medium border shrink-0 ${getCategoryBadgeClasses(
                          file.category
                        )}`}
                      >
                        {file.category}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(file.uploadedAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(file.uploadedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations Right Area */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 self-end md:self-auto border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                  <button
                    onClick={() => onSelectForInspect(file)}
                    className={`p-1.5 rounded-lg border transition-all text-xs font-medium flex items-center gap-1 ${
                      isInspected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200"
                    }`}
                    title="Xem Phân Tích Chi Tiết"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>

                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                    title="Xóa tệp khỏi hệ thống"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
