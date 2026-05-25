import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Clipboard,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Check,
} from "lucide-react";
import { ChatMessage, UploadedFile } from "../types";
import { parseMarkdownToReact } from "../utils";

interface ChatWorkspaceProps {
  files: UploadedFile[];
  selectedFileIds: string[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isResponding: boolean;
}

export default function ChatWorkspace({
  files,
  selectedFileIds,
  messages,
  onSendMessage,
  isResponding,
}: ChatWorkspaceProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeFiles = files.filter((f) => selectedFileIds.includes(f.id));
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom upon new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isResponding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;
    
    const textToSend = input;
    setInput("");
    onSendMessage(textToSend);
  };

  const handleShortcutClick = (shortcutText: string) => {
    if (isResponding) return;
    onSendMessage(shortcutText);
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Determine relative prompt suggestions based on selected items
  const getPromptShortcuts = () => {
    if (activeFiles.length === 0) {
      return [
        { label: "Giới thiệu chức năng", prompt: "Hãy giới thiệu chi tiết về bạn và chỉ ra những cách tôi có thể khai thác sức mạnh của hệ thống này." },
        { label: "Xem hướng dẫn up file", prompt: "Làm thế nào để tôi tải file lên và tận dụng trí tuệ Gemini phân tích?" },
      ];
    } else if (activeFiles.length === 1) {
      const name = activeFiles[0].name;
      return [
        { label: "Tóm tắt tài liệu", prompt: `Hãy tóm tắt chi tiết, liệt kê các ý cốt lõi có trong tài liệu "${name}" này.` },
        { label: "Trích xuất mốc thời gian & dữ liệu", prompt: `Hãy rà soát kỹ tài liệu "${name}" và trích xuất tất cả các mốc thời gian, số liệu quan trọng nhất.` },
        { label: "Đề xuất cải tiến tài liệu", prompt: `Hãy đánh giá nội dung tài liệu "${name}" và đưa ra 3 điểm đề xuất cải tiến nội dung chuyên nghiệp.` },
      ];
    } else {
      const fileNames = activeFiles.map((f) => `"${f.name}"`).join(" và ");
      return [
        { label: "So sánh các file", prompt: `Hãy so sánh điểm giống nhau và khác nhau chính giữa các tài liệu: ${fileNames}. Trình bày theo dạng bảng rõ ràng.` },
        { label: "Tổng hợp thông tin chung", prompt: `Hãy tổng hợp một báo cáo chung hợp nhất toàn bộ thông tin quan trọng từ tài liệu: ${fileNames}.` },
      ];
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden" id="chat-workspace-root">
      {/* Workspace Context Bar */}
      <div className="px-4.5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Trợ lý Hỏi đáp Tài liệu</h3>
            <p className="text-[11px] text-slate-500">Đặt câu hỏi trực tiếp hoặc so sánh chéo các tài liệu đã tải lên</p>
          </div>
        </div>

        {/* Selected Context Indicators */}
        <div className="flex items-center gap-1.5">
          {activeFiles.length > 0 ? (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200/50 text-[11px] font-medium animate-fade-in shadow-2xs">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Đang kết nối: {activeFiles.length} file</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 text-[11px] font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Chế độ trò chuyện chung</span>
            </div>
          )
          }
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[250px] bg-slate-50/40" id="dialogue-box">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto my-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-semibold text-slate-800">Chào bạn! Tôi có thể giúp gì cho bạn?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tải các tài liệu, hợp đồng, hóa đơn lên, sau đó tick vào checkbox phía trước tên tài liệu để nối kết nối dữ liệu. Tôi sẽ giúp bạn phân tích, tóm tắt, so sánh và kiểm toán một cách dễ dàng.
              </p>
            </div>

            {/* Default Shortcuts */}
            <div className="w-full flex flex-col gap-1.5 pt-2">
              {getPromptShortcuts().map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleShortcutClick(item.prompt)}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 font-medium transition-all hover:border-indigo-200 cursor-pointer shadow-3xs"
                >
                  ✨ {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAi = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    isAi ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-3xs text-xs font-semibold ${
                      isAi
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900 text-purple-100"
                    }`}
                  >
                    {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  {/* Bubble Content */}
                  <div className="space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl relative group/bubble ${
                        isAi
                          ? "bg-white text-slate-800 border border-slate-200/85 shadow-3xs rounded-tl-xs"
                          : "bg-indigo-600 text-white shadow-sm rounded-tr-xs"
                      }`}
                    >
                      {/* Message Content */}
                      <div className="space-y-1.5 prose max-w-none text-[14px]">
                        {isAi ? (
                          parseMarkdownToReact(msg.content)
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Tool Copy Button (AI reply only) */}
                      {isAi && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="absolute bottom-2 right-2 opacity-0 group-hover/bubble:opacity-100 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-all shadow-3xs cursor-pointer"
                          title="Sao chép câu trả lời"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Clipboard className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Timestamp & metadata */}
                    <div className={`text-[10px] text-slate-400 px-1 ${!isAi ? "text-right" : ""}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI responding typing loader */}
            {isResponding && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-7.5 h-7.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-3xs">
                  <Bot className="w-4.5 h-4.5 text-indigo-150 animate-bounce" />
                </div>
                <div className="bg-white border border-slate-200/85 p-4 rounded-2xl rounded-tl-xs shadow-3xs flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Trợ lý thông minh đang tổng hợp dữ liệu...</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Shortcut bar right above input */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-thin shrink-0 select-none no-scrollbar">
          {getPromptShortcuts().map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleShortcutClick(item.prompt)}
              disabled={isResponding}
              className="px-2.5 py-1 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer shadow-3xs shrink-0"
            >
              ✨ {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Action Form */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2.5 shrink-0" id="query-submit-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            activeFiles.length > 0
              ? `Nhập câu hỏi liên quan đến ${activeFiles.length} tài liệu đã tick...`
              : "Nhập câu hỏi cho trợ lý AI..."
          }
          className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans text-slate-800"
          disabled={isResponding}
        />
        <button
          type="submit"
          disabled={!input.trim() || isResponding}
          className={`p-2.5 rounded-xl block text-white transition-all shadow-sm shrink-0 cursor-pointer ${
            input.trim() && !isResponding
              ? "bg-indigo-600 hover:bg-indigo-500 hover:shadow-md"
              : "bg-slate-300 pointer-events-none"
          }`}
          title="Gửi câu hỏi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
