import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { validateNoticePayload } from "@/lib/validateNotice";

function parseId(raw: string | string[] | undefined): number | null {
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = parseId(req.query.id);

  if (id === null) {
    return res.status(400).json({ error: "Invalid id — must be a positive integer." });
  }

  if (req.method === "PUT") {
    const { data, errors } = validateNoticePayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const notice = await prisma.notice.update({
        where: { id },
        data: data!,
      });
      return res.status(200).json(notice);
    } catch (err) {
      if (isNotFound(err)) {
        return res.status(404).json({ error: `Notice ${id} not found.` });
      }
      console.error(`[${req.method} /api/notices/${id}]`, err);
      return res.status(500).json({ error: "Failed to update notice." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const notice = await prisma.notice.delete({ where: { id } });
      return res.status(200).json(notice);
    } catch (err) {
      if (isNotFound(err)) {
        return res.status(404).json({ error: `Notice ${id} not found.` });
      }
      console.error(`[DELETE /api/notices/${id}]`, err);
      return res.status(500).json({ error: "Failed to delete notice." });
    }
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
