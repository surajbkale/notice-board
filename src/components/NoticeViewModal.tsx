import { useState, useEffect } from "react";
import Link from "next/link";
import type { Notice } from "@/types/notice";
import ConfirmModal from "./ConfirmModal";

const categoryStyle: Record<string, string> = {
  Exam: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100",
  Event: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  General: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Props = {
  notice: Notice;
  onClose: () => void;
  onDelete: (id: number) => void;
};

export default function NoticeViewModal({ notice, onClose, onDelete }: Props) {
  const isUrgent = notice.priority === "Urgent";
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showConfirm) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, showConfirm]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(3px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !showConfirm) onClose();
        }}
      >
        <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle[notice.category]
                  }`}
              >
                {notice.category}
              </span>
              {isUrgent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  Urgent
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            <h1 className="mb-4 text-2xl font-bold leading-tight text-stone-900">
              {notice.title}
            </h1>
            <time className="mb-6 block text-sm text-stone-400">
              Published on {formatDate(notice.publishDate)}
            </time>
            {notice.imageUrl && (
              <img
                src={notice.imageUrl}
                alt="Notice attachment"
                className="mb-6 max-h-80 w-full rounded-xl object-cover"
              />
            )}
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700">
              {notice.body}
            </div>
          </div>

          {/* Footer (Actions) */}
          <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-6 py-4 shrink-0 bg-stone-50">
            <Link
              href={`/notices/${notice.id}/edit`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200"
            >
              Edit Notice
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Delete Notice
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete this notice?"
          description={`"${notice.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setShowConfirm(false);
            onDelete(notice.id);
            onClose();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
