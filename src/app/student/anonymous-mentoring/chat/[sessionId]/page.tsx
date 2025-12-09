'use client';

import AnonymousChatInterface from '@/components/anonymous-mentoring/student/AnonymousChatInterface';
import { use } from 'react';

export default function ChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <AnonymousChatInterface sessionId={sessionId} />
    </div>
  );
}
