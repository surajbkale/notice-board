import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { validateNoticePayload } from "@/lib/validateNotice";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const notices = await prisma.notice.findMany({
        orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
      });
      return res.status(200).json(notices);
    } catch (err) {
      console.error("[GET /api/notices]", err);
      return res.status(500).json({ error: "Failed to fetch notices." });
    }
  }

  if (req.method === "POST") {
    const { data, errors } = validateNoticePayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const notice = await prisma.notice.create({ data: data! });
      return res.status(201).json(notice);
    } catch (err) {
      console.error("[POST /api/notices]", err);
      return res.status(500).json({ error: "Failed to create notice." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
