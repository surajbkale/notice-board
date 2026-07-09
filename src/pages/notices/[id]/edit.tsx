import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NoticeForm from "@/components/NoticeForm";
import type { Notice } from "@/types/notice";

export const getServerSideProps = (async (context) => {
  const id = parseInt(String(context.params?.id), 10);
  if (!Number.isFinite(id) || id <= 0) return { notFound: true };

  const row = await prisma.notice.findUnique({ where: { id } });
  if (!row) return { notFound: true };

  return {
    props: {
      notice: JSON.parse(JSON.stringify(row)) as Notice,
    },
  };
}) satisfies GetServerSideProps<{ notice: Notice }>;

export default function EditNoticePage({
  notice,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Edit Notice — Notice Board</title>
        <meta name="description" content="Edit an existing notice." />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
        <header style={{ backgroundColor: "#1c1917" }}>
          <div className="mx-auto flex max-w-6xl items-center px-4 py-5 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                📋
              </div>
              <span className="text-base font-semibold text-white">
                Notice Board
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 11L5 7l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to board
            </Link>
            <h1 className="text-2xl font-semibold text-stone-900">
              Edit Notice
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Update the details of this notice.
            </p>
          </div>

          <NoticeForm initial={notice} />
        </main>
      </div>
    </>
  );
}
