"use client";

import FacultyAnonymousChat from "@/components/anonymous-mentoring/faculty/FacultyAnonymousChat";
import { use } from "react";

export default function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <FacultyAnonymousChat sessionId={sessionId} />
    </div>
  );
}
