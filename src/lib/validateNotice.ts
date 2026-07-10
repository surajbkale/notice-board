import { Category, Priority } from "@/generated/prisma/client";

export type NoticePayload = {
  title: string;
  body: string;
  publishDate: Date;
  category: Category;
  priority: Priority;
  imageUrl?: string | null;
};

export type ValidationResult =
  | { data: NoticePayload; errors: [] }
  | { data: null; errors: string[] };

const VALID_CATEGORIES = Object.values(Category) as string[];
const VALID_PRIORITIES = Object.values(Priority) as string[];

export function validateNoticePayload(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { data: null, errors: ["Request body must be a JSON object."] };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    errors.push("`title` is required and must be a non-empty string.");
  }

  if (typeof raw.body !== "string" || raw.body.trim() === "") {
    errors.push("`body` is required and must be a non-empty string.");
  }

  let publishDate: Date | null = null;
  if (raw.publishDate === undefined || raw.publishDate === null) {
    errors.push("`publishDate` is required.");
  } else {
    const parsed = new Date(raw.publishDate as string);
    if (isNaN(parsed.getTime())) {
      errors.push(
        '`publishDate` must be a valid ISO 8601 date string (e.g. "2026-07-10").'
      );
    } else {
      publishDate = parsed;
    }
  }

  if (!raw.category || !VALID_CATEGORIES.includes(raw.category as string)) {
    errors.push(`\`category\` must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  if (!raw.priority || !VALID_PRIORITIES.includes(raw.priority as string)) {
    errors.push(`\`priority\` must be one of: ${VALID_PRIORITIES.join(", ")}.`);
  }

  let imageUrl: string | null | undefined;
  if (raw.imageUrl === null) {
    imageUrl = null;
  } else if (raw.imageUrl !== undefined) {
    if (typeof raw.imageUrl !== "string" || raw.imageUrl.trim() === "") {
      errors.push("`imageUrl`, when provided, must be a non-empty string.");
    } else {
      imageUrl = raw.imageUrl.trim();
    }
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      title: (raw.title as string).trim(),
      body: (raw.body as string).trim(),
      publishDate: publishDate!,
      category: raw.category as Category,
      priority: raw.priority as Priority,
      imageUrl,
    },
    errors: [],
  };
}
