export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4">
        {/* هدر ساده */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">LinkYar</h1>
            <p className="text-sm text-muted-foreground">Voice-Powered Link Assistant</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
              Offline Mode
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}