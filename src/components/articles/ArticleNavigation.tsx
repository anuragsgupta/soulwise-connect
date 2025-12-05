'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArticleNavigation() {
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </Button>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
        >
          <Bookmark className="w-5 h-5 text-gray-700" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </Button>
      </div>
    </div>
  );
}
