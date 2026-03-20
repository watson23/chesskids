"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/data/lessons";
import LessonPlayer from "@/components/LessonPlayer";
import ErrorBoundary from "@/components/ErrorBoundary";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = use(params);
  const router = useRouter();
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-50 gap-4">
        <h1 className="text-2xl font-bold text-amber-800">Lesson not found</h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <ErrorBoundary><LessonPlayer lesson={lesson} /></ErrorBoundary>;
}
