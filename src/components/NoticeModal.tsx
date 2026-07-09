import { useState, useEffect } from "react";
import type { Notice, Category, Priority } from "@/types/notice";

const CATEGORIES: Category[] = ["Exam", "Event", "General"];
const PRIORITIES: Priority[] = ["Normal", "Urgent"];

type Props = {
  mode: "create" | "edit";
  initial?: Notice;
  onClose: () => void;
  onSave: (notice: Notice) => void;
};

type FormState = {
  title: string;
  body: string;
  publishDate: string;
  category: Category;
  priority: Priority;
  imageUrl: string;
};

const inputClass =
  "w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-colors focus:border-stone-400 focus:ring-2 focus:ring-stone-400/10";

const labelClass = "mb-1.5 block text-xs font-medium text-stone-700";

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export default function NoticeModal({ mode, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    publishDate: initial ? toDateInput(initial.publishDate) : "",
    category: initial?.category ?? "General",
    priority: initial?.priority ?? "Normal",
    imageUrl: initial?.imageUrl ?? "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function field(key: keyof FormState) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const payload = {
      title: form.title,
      body: form.body,
      publishDate: form.publishDate,
      category: form.category,
      priority: form.priority,
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
    };

    const url =
      mode === "create" ? "/api/notices" : `/api/notices/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? [data.error ?? "Something went wrong."]);
        return;
      }
      onSave(data as Notice);
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-stone-900">
            {mode === "create" ? "Post a Notice" : "Edit Notice"}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <ul className="list-inside list-disc space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Notice title..."
              value={form.title}
              onChange={field("title")}
            />
          </div>

          <div>
            <label className={labelClass}>Body</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Notice content..."
              value={form.body}
              onChange={field("body")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={form.category}
                onChange={field("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                className={inputClass}
                value={form.priority}
                onChange={field("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Publish Date</label>
            <input
              type="date"
              className={inputClass}
              value={form.publishDate}
              onChange={field("publishDate")}
            />
          </div>

          <div>
            <label className={labelClass}>
              Image URL{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://..."
              value={form.imageUrl}
              onChange={field("imageUrl")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : mode === "create" ? "Post Notice" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
