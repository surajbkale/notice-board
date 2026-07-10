import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      if (!res.ok) throw new Error("Upload failed.");

      const json = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: json.secure_url as string }));
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearImage() {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      imageUrl: form.imageUrl.trim() || null,
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
                <option key={c} value={c}>
                  {c}
                </option>
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
                <option key={p} value={p}>
                  {p}
                </option>
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
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.publishDate}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Image{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </label>

          {form.imageUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-stone-200">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-44 w-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-black/80"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M7.5 2.5l-5 5M2.5 2.5l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Remove
              </button>
            </div>
          ) : (
            <label
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed",
                "cursor-pointer px-4 py-10 text-center transition-colors",
                uploading
                  ? "border-stone-300 bg-stone-50 cursor-wait"
                  : uploadError
                    ? "border-red-300 hover:border-red-400 hover:bg-red-50"
                    : "border-stone-200 hover:border-stone-400 hover:bg-stone-50",
              ].join(" ")}
            >
              {uploading ? (
                <>
                  <svg
                    className="h-6 w-6 animate-spin text-stone-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm text-stone-500">Uploading…</span>
                </>
              ) : (
                <>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-stone-400"
                  >
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium text-stone-600">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-stone-400">
                    PNG, JPG, GIF, WEBP — up to 10 MB
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
          )}

          {uploadError && (
            <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
          )}
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
            disabled={submitting || uploading}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Post Notice"}
          </button>
        </div>
      </form>
    </div>
  );
}
