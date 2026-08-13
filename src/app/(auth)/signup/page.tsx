import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold gradient-text">Sign Up</h1>
        <p className="text-muted-foreground">
          Authentication is disabled in this version.
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition">
            Go to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}