export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">GoVoiceLink</h1>
            <p className="text-sm text-muted-foreground">Voice-Powered Link Assistant</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
              Offline Mode
            </span>
          </div>
        </header>
        {children}
        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl max-w-md mx-auto border border-blue-200/50 dark:border-blue-800/30 transition-all hover:border-blue-400 dark:hover:border-blue-600">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
            >
              <span className="text-lg">✦</span>
              Get your own GoVoiceLink page for free
              <span className="text-lg">→</span>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using <span className="font-semibold text-blue-600 dark:text-blue-400">Next.js</span> &{' '}
            <span className="font-semibold text-purple-600 dark:text-purple-400">Supabase</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            © 2026 GoVoiceLink — All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
}