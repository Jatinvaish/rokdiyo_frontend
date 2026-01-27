'use client';

import { Sparkles } from "lucide-react";

export function CommonLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
