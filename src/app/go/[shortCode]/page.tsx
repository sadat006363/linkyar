'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MagicRedirectPage({
  params,
}: {
  params: { shortCode: string };
}) {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const { shortCode } = params;
    
    // خواندن از localStorage
    const magicLinks = JSON.parse(localStorage.getItem('govoicelink_magic_links') || '{}');
    const targetUrl = magicLinks[shortCode];

    if (targetUrl) {
      // حذف لینک از localStorage (یک بار مصرف)
      delete magicLinks[shortCode];
      localStorage.setItem('govoicelink_magic_links', JSON.stringify(magicLinks));
      
      // هدایت به مقصد
      window.location.href = targetUrl;
    } else {
      setError(true);
    }
  }, [params]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">❌ Invalid or expired link</h1>
          <p className="text-muted-foreground mt-2">This magic link is no longer valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-muted-foreground mt-4">Redirecting...</p>
      </div>
    </div>
  );
}