import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Notice, Category, Priority } from "@/types/notice";

const CATEGORIES: Category[] = ["Exam", "Event", "General"];
const PRIORITIES: Priority[] = ["Normal", "Urgent"];

type FormState = {
  title: string;
  body: string;
  publishDate: string;
  category: Category;
  priority: Priority;
  imageUrl: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errs: FieldErrors = {};
  if (!form.title.trim()) errs.title = "Title is required.";
  if (!form.body.trim()) errs.body = "Body is required.";
  if (!form.publishDate) {
    errs.publishDate = "Publish date is required.";
  } else if (isNaN(new Date(form.publishDate).getTime())) {
    errs.publishDate = "Enter a valid date.";
  }
  return errs;
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

const labelClass = "mb-1.5 block text-xs font-medium text-stone-700";

type Props = {
  initial?: Notice;
};

export default function NoticeForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    publishDate: initial ? toDateInput(initial.publishDate) : "",
    category: initial?.category ?? "General",
    priority: initial?.priority ?? "Normal",
    imageUrl: initial?.imageUrl ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (attempted) setFieldErrors(validate(form));
  }, [form, attempted]);

  function field(key: keyof FormState) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function inputCls(key: keyof FormState) {
    const hasError = attempted && fieldErrors[key];
    return [
      "w-full rounded-lg border px-3 py-2.5 text-sm text-stone-900",
      "placeholder:text-stone-400 outline-none transition-colors focus:ring-2",
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
        : "border-stone-200 focus:border-stone-400 focus:ring-stone-400/10",
    ].join(" ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setServerErrors([]);

    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      publishDate: form.publishDate,
      category: form.category,
      priority: form.priority,
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
    };

    const url = isEdit ? `/api/notices/${initial!.id}` : "/api/notices";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerErrors(data.errors ?? [data.error ?? "Something went wrong."]);
        return;
      }
      router.push("/");
    } catch {
      setServerErrors(["Network error. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {serverErrors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <ul className="list-inside list-disc space-y-0.5">
            {serverErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            className={inputCls("title")}
            placeholder="Notice title..."
            value={form.title}
            onChange={field("title")}
          />
          {attempted && fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Body</label>
          <textarea
            className={`${inputCls("body")} resize-none`}
            rows={5}
            placeholder="Notice content..."
            value={form.body}
            onChange={field("body")}
          />
          {attempted && fieldErrors.body && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.body}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputCls("category")}
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
              className={inputCls("priority")}
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
            className={inputCls("publishDate")}
            value={form.publishDate}
            onChange={field("publishDate")}
          />
          {attempted && fieldErrors.publishDate && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.publishDate}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Image URL{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <input
            type="url"
            className={inputCls("imageUrl")}
            placeholder="https://..."
            value={form.imageUrl}
            onChange={field("imageUrl")}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving…"
              : isEdit
              ? "Save Changes"
              : "Post Notice"}
          </button>
        </div>
      </form>
    </div>
  );
}
