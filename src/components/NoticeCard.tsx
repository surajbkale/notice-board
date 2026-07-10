import { useState } from "react";
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
    month: "short",
    year: "numeric",
  });
}

type Props = {
  notice: Notice;
  onDelete: (id: number) => void;
  onView: (notice: Notice) => void;
};

export default function NoticeCard({ notice, onDelete, onView }: Props) {
  const isUrgent = notice.priority === "Urgent";
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <article
        onClick={() => onView(notice)}
        className={[
          "flex flex-col bg-white rounded-xl text-left cursor-pointer",
          "border border-stone-200 border-l-4",
          isUrgent ? "border-l-red-600" : "border-l-stone-200",
          "shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle[notice.category]}`}
          >
            {notice.category}
          </span>
          {isUrgent && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              Urgent
            </span>
          )}
        </div>

        <div className="flex-1 px-5 pb-4">
          <h2 className="mb-2 line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">
            {notice.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-stone-500">
            {notice.body}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
          <time className="text-xs text-stone-400">
            {formatDate(notice.publishDate)}
          </time>
          <div className="flex items-center gap-1">
            <Link
              href={`/notices/${notice.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
            >
              Edit
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </article>

      {showConfirm && (
        <ConfirmModal
          title="Delete this notice?"
          description={`"${notice.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setShowConfirm(false);
            onDelete(notice.id);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
