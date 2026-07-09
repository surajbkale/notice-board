import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "@/lib/prisma";
import NoticeCard from "@/components/NoticeCard";
import type { Notice } from "@/types/notice";

export const getServerSideProps = (async () => {
  const rows = await prisma.notice.findMany({
    orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
  });
  return {
    props: {
      initialNotices: JSON.parse(JSON.stringify(rows)) as Notice[],
    },
  };
}) satisfies GetServerSideProps<{ initialNotices: Notice[] }>;

export default function Home({
  initialNotices,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  async function handleDelete(id: number) {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Failed to delete.");
        return;
      }
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setDeleteError("Network error. Please try again.");
    }
  }

  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta
          name="description"
          content="Stay up to date with the latest notices, announcements, and events."
        />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
        <header style={{ backgroundColor: "#1c1917" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                📋
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">
                  Notice Board
                </h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {notices.length} {notices.length === 1 ? "notice" : "notices"}
                  {urgentCount > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-600/20 px-1.5 py-0.5 text-red-400">
                      {urgentCount} urgent
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/notices/new"
              className="shrink-0 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100"
            >
              + Post Notice
            </Link>
          </div>
        </header>

        {deleteError && (
          <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-center text-sm text-red-700">
            {deleteError}{" "}
            <button
              onClick={() => setDeleteError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-28">
              <div className="mb-4 text-5xl">📭</div>
              <h2 className="mb-2 text-lg font-semibold text-stone-700">
                No notices yet
              </h2>
              <p className="mb-6 text-sm text-stone-400">
                Post the first notice to get started.
              </p>
              <Link
                href="/notices/new"
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                + Post Notice
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
