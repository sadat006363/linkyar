"use client";

import { X, Copy, Share2, Link2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type ResultCardProps = {
  title: string;
  platform: string;
  url: string;
  message?: string;
  onCopyLink: () => void;
  onCopyMessage: () => void;
  onShare: () => void;
  onClose: () => void;
};

export function ResultCard({
  title,
  platform,
  url,
  message,
  onCopyLink,
  onCopyMessage,
  onShare,
  onClose,
}: ResultCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="max-w-md w-full mx-4 border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">{platform}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3">
            <p className="text-sm text-slate-600 dark:text-slate-300 break-all font-mono">
              🔗 {url}
            </p>
            {message && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                💬 {message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            onClick={onCopyLink}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            onClick={onCopyMessage}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!message}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Copy Message
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            className="flex-1 border-slate-300 dark:border-slate-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}