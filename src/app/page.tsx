import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold gradient-text">GoVoiceLink</h1>
        <p className="text-xl text-muted-foreground">
          Voice-Powered Link Assistant
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition">
              Go to Dashboard
            </button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          💡 No sign-up required. All data is stored securely in the cloud.
        </p>
      </div>
    </main>
  );
}