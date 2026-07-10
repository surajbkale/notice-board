import { useState } from "react";
import Link from "next/link";
import type { Notice } from "@/types/notice";
import ConfirmModal from "./ConfirmModal";

const categoryGradient: Record<string, string> = {
  Exam: "linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)",
  Event: "linear-gradient(135deg, #059669 0%, #022c22 100%)",
  General: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
};

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
        <div
          className="relative h-48 overflow-hidden rounded-t-xl shrink-0"
          style={{ background: categoryGradient[notice.category] }}
        >
          {notice.imageUrl && (
            <img
              src={notice.imageUrl}
              alt="Notice image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
              {notice.category}
            </span>
            {isUrgent && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                Urgent
              </span>
            )}
          </div>
          <h2 className="absolute bottom-3 left-4 right-4 line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-sm">
            {notice.title}
          </h2>
        </div>

        <div className="flex-1 px-5 pt-3 pb-4">
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
