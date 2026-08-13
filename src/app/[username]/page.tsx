import { createClient } from '@/lib/supabase/client';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto flex items-center justify-center text-4xl text-white mb-4">
          {params.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">
          @{params.username}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          This profile is under construction.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Social links will appear here soon.
          </p>
          <div className="flex justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              📱
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              💬
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              📸
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold gradient-text">LinkYar</span>
          </p>
        </div>
      </div>
    </div>
  );
}