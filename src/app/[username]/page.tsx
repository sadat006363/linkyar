'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mic, Link2, Globe, Twitter, Instagram, Youtube, Linkedin, Github, MessageCircle, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const [links, setLinks] = useState<any[]>([]);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', params.username)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        if (profile) {
          setUserName(profile.full_name || 'User');
          const { data: userLinks, error: linksError } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', params.username)
            .order('sort_order', { ascending: true })
            .eq('is_active', true);
          
          if (linksError) {
            console.error('Links error:', linksError);
          }
          setLinks(userLinks || []);
        } else {
          // اگر پروفایل وجود نداشت، از username به‌عنوان نام استفاده کن
          setUserName(decodeURIComponent(params.username));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.username]);

  // تابع تشخیص صدا برای صفحه عمومی
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('❌ Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    toast.info('🎤 Listening... Say the platform name (e.g. Telegram)');

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      console.log('🎤 Voice command received on public page:', command);
      setIsListening(false);

      // جستجو در عنوان، پلتفرم و کلیدواژه‌ها
      const found = links.find(link => {
        const keywords = link.keywords?.toLowerCase() || '';
        return link.title.toLowerCase().includes(command) ||
               link.platform.toLowerCase().includes(command) ||
               keywords.includes(command);
      });

      if (found) {
        toast.success(`✅ Redirecting to ${found.title}...`);
        // هدایت به لینک مقصد
        window.location.href = found.url;
      } else {
        toast.error(`❌ No link found for "${command}". Please try again.`);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('❌ Microphone access denied. Please allow microphone access.');
      } else {
        toast.error('❌ Voice recognition error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {userName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {links.length} {links.length === 1 ? 'link' : 'links'}
          </p>

          {/* Voice Button */}
          <button
            onClick={startVoiceRecognition}
            disabled={isListening}
            className={`mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto ${
              isListening ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            {isListening ? 'Listening...' : 'Say the platform name'}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            🎤 Click the button and say the name of the platform (e.g. "Telegram", "WhatsApp")
          </p>
        </div>

        {/* Links List */}
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 group"
            >
              <span className="text-2xl">{link.icon || '🔗'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{link.title}</h3>
                <p className="text-xs text-muted-foreground">{link.platform}</p>
              </div>
              <span className="text-slate-400 group-hover:text-blue-500 transition-colors">→</span>
            </a>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Link2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              No links available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This user hasn't added any links yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">GoVoiceLink</span>
          </p>
        </div>
      </div>
    </div>
  );
}