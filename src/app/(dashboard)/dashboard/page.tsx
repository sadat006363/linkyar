'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Search, 
  Mic, 
  Copy, 
  Trash2, 
  Edit, 
  Link2, 
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  MessageCircle,
  Phone,
  Mail,
  Sparkles,
  UserCircle,
  Settings,
  Camera,
  Facebook,
  Music,
  Pin,
  Share2  // ← اضافه شده
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ResultCard } from '@/components/ResultCard';

type LinkType = {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  keywords: string;
  message: string;
  isQuickAction: boolean;
};

type ProfileType = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
};

// ============================================================
// Feature Flag: فقط لینک جادویی یا نسخه‌ی کامل
// ============================================================
const isMagicLinkOnly = process.env.NEXT_PUBLIC_FEATURE_MAGIC_LINK_ONLY === 'true';

function getUserId(): string {
  let userId = localStorage.getItem('govoicelink_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('govoicelink_user_id', userId);
  }
  return userId;
}

// ============================================================
// آیکون‌های پلتفرم‌ها با رنگ‌های متناسب
// ============================================================
const platformIcons: { [key: string]: JSX.Element } = {
  telegram: <MessageCircle className="w-5 h-5 text-blue-500" />,
  whatsapp: <MessageCircle className="w-5 h-5 text-green-500" />,
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  linkedin: <Linkedin className="w-5 h-5 text-blue-600" />,
  twitter: <Twitter className="w-5 h-5 text-blue-400" />,
  facebook: <Facebook className="w-5 h-5 text-blue-700" />,
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  tiktok: <Music className="w-5 h-5 text-black dark:text-white" />,
  snapchat: <Camera className="w-5 h-5 text-yellow-500" />,
  reddit: <MessageCircle className="w-5 h-5 text-orange-500" />,
  pinterest: <Pin className="w-5 h-5 text-red-600" />,
  github: <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
  discord: <MessageCircle className="w-5 h-5 text-indigo-500" />,
  gmail: <Mail className="w-5 h-5 text-red-400" />,
  outlook: <Mail className="w-5 h-5 text-blue-400" />,
  website: <Globe className="w-5 h-5 text-purple-500" />,
  phone: <Phone className="w-5 h-5 text-green-600" />,
  email: <Mail className="w-5 h-5 text-red-400" />,
};

// ============================================================
// کلیدواژه‌های پیش‌فرض بر اساس پلتفرم و زبان
// ============================================================
const getDefaultKeywords = (platform: string, lang: string): string => {
  const map: Record<string, Record<string, string>> = {
    telegram: {
      en: 'telegram, tg, t.me',
      fa: 'تلگرام, کانال تلگرام, تی‌وی',
      ar: 'تليجرام, التيليجرام',
      tr: 'telegram, telgraf',
    },
    whatsapp: {
      en: 'whatsapp, wa, wa.me',
      fa: 'واتساپ, واتس‌اپ, واتس',
      ar: 'واتساب, الواتساب',
      tr: 'whatsapp',
    },
    instagram: {
      en: 'instagram, ig, insta',
      fa: 'اینستاگرام, اینستا',
      ar: 'إنستغرام, إنستا',
      tr: 'instagram, insta',
    },
    linkedin: {
      en: 'linkedin, in',
      fa: 'لینکدین',
      ar: 'لينكدين',
      tr: 'linkedin',
    },
    twitter: {
      en: 'twitter, x, tweet',
      fa: 'توییتر, ایکس',
      ar: 'تويتر, إكس',
      tr: 'twitter, x',
    },
    facebook: {
      en: 'facebook, fb, meta',
      fa: 'فیسبوک, فیس‌بوک',
      ar: 'فيسبوك, ميتا',
      tr: 'facebook, fb',
    },
    youtube: {
      en: 'youtube, yt, video',
      fa: 'یوتیوب, آپارات',
      ar: 'يوتيوب, فيديو',
      tr: 'youtube, video',
    },
    tiktok: {
      en: 'tiktok, tt, tok',
      fa: 'تیک‌تاک, تیک تاک',
      ar: 'تيك توك',
      tr: 'tiktok',
    },
    snapchat: {
      en: 'snapchat, snap',
      fa: 'اسنپ‌چت, اسنپ',
      ar: 'سناب شات',
      tr: 'snapchat',
    },
    reddit: {
      en: 'reddit, r/',
      fa: 'ردیت',
      ar: 'ريديت',
      tr: 'reddit',
    },
    pinterest: {
      en: 'pinterest, pin',
      fa: 'پینترست',
      ar: 'بينتيريست',
      tr: 'pinterest',
    },
    github: {
      en: 'github, gh, repo',
      fa: 'گیت‌هاب, گیت هاب',
      ar: 'غيت هاب',
      tr: 'github',
    },
    discord: {
      en: 'discord, dc',
      fa: 'دیسکورد',
      ar: 'ديسكورد',
      tr: 'discord',
    },
    gmail: {
      en: 'gmail, email, mail',
      fa: 'جیمیل, ایمیل, پست الکترونیک',
      ar: 'جي ميل, بريد إلكتروني',
      tr: 'gmail, e-posta',
    },
    outlook: {
      en: 'outlook, hotmail',
      fa: 'اوت‌لوک, هات‌میل',
      ar: 'أوت لوك, هوتميل',
      tr: 'outlook, hotmail',
    },
    website: {
      en: 'website, site, web',
      fa: 'وب‌سایت, سایت',
      ar: 'موقع إلكتروني',
      tr: 'web sitesi',
    },
  };
  return map[platform.toLowerCase()]?.[lang] || map[platform.toLowerCase()]?.en || '';
};

export default function DashboardPage() {
  const supabase = createClient();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('User');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [showResult, setShowResult] = useState(false);
  const [resultLink, setResultLink] = useState<LinkType | null>(null);

  // بارگذاری زبان از localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('govoicelink_language') || 'en';
    setSelectedLanguage(savedLang);
  }, []);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    
    const savedName = localStorage.getItem('govoicelink_user_name');
    const savedAvatar = localStorage.getItem('govoicelink_user_avatar');
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    
    loadProfile(id);
    fetchLinks(id);
  }, []);

  const changeLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('govoicelink_language', lang);
    toast.success(`Language changed to ${lang.toUpperCase()}`);
  };

  const loadProfile = async (uid: string) => {
    try {
      console.log('🔄 Loading profile for user_id:', uid);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading profile:', error);
        if (error.code === '42P01') {
          toast.error('Profile table not found. Please run the SQL script.');
        } else {
          toast.error('Failed to load profile');
        }
        return;
      }

      if (data) {
        console.log('✅ Profile loaded:', data);
        setProfile(data);
        if (data.full_name) {
          setUserName(data.full_name);
          localStorage.setItem('govoicelink_user_name', data.full_name);
        }
        if (data.avatar_url) {
          console.log('🖼️ Avatar URL from DB:', data.avatar_url);
          setUserAvatar(data.avatar_url);
          localStorage.setItem('govoicelink_user_avatar', data.avatar_url);
          setAvatarKey(prev => prev + 1);
        } else {
          console.log('⚠️ No avatar_url in profile');
        }
      } else {
        console.log('ℹ️ No profile found, creating new one...');
        const newId = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: newId,
            user_id: uid, 
            full_name: 'User' 
          }]);

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          toast.error('Failed to create profile: ' + insertError.message);
        } else {
          console.log('✅ Profile created successfully');
          toast.success('Profile created!');
          loadProfile(uid);
        }
      }
    } catch (error) {
      console.error('💥 Unexpected error loading profile:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const fetchLinks = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Failed to load links');
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const handleCopy = async (url: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${platform} link copied!`);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const copyLinkOnly = (link: LinkType) => {
    handleCopy(link.url, link.platform);
    setShowResult(false);
  };

  const copyMessageWithLink = (link: LinkType) => {
    const fullText = link.message 
      ? `${link.message}\n${link.url}`
      : link.url;
    navigator.clipboard.writeText(fullText);
    toast.success('✅ Message + link copied!');
    setShowResult(false);
  };

  const shareLink = (link: LinkType) => {
    const shareData = {
      title: link.title,
      text: link.message || link.url,
      url: link.url,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      const fullText = link.message 
        ? `${link.message}\n${link.url}`
        : link.url;
      navigator.clipboard.writeText(fullText);
      toast.success('✅ Shared (copied to clipboard)!');
    }
    setShowResult(false);
  };

  // ============================================================
  // تابع ارسال دوگانه (لینک مستقیم + صفحه عمومی)
  // ============================================================
  const sendDualLink = async (link: LinkType) => {
    // ۱. ابتدا از ادمین می‌خواهیم فرمان صوتی بدهد
    toast.info('🎤 Say the platform name (e.g. Telegram)...');
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('🎤 Voice command for dual send:', command);

      // پیدا کردن لینک مرتبط با فرمان
      const found = links.find(l => {
        const keywords = l.keywords?.toLowerCase() || '';
        return l.title.toLowerCase().includes(command) ||
               l.platform.toLowerCase().includes(command) ||
               keywords.includes(command);
      });

      if (found) {
        const directLink = found.url;
        const publicProfileLink = `https://govoicelink.vercel.app/${userId}`;
        const message = `📌 لینک‌های من: ${publicProfileLink}\n\n🔗 لینک مستقیم ${found.platform}: ${directLink}`;
        
        await navigator.clipboard.writeText(message);
        toast.success(`✅ پیام آماده کپی شد! (${found.platform})`);
      } else {
        toast.error('❌ No link found for: ' + command);
      }
    };

    recognition.onerror = () => {
      toast.error('❌ Voice recognition error. Please try again.');
    };

    recognition.start();
  };

  // ============================================================
  // تابع تشخیص صدا (برای جستجوی معمولی)
  // ============================================================
  const startVoiceRecognition = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('🎤 Voice command received:', command);
      
      const found = links.find(link => {
        const keywords = link.keywords?.toLowerCase() || '';
        return link.title.toLowerCase().includes(command) ||
               link.platform.toLowerCase().includes(command) ||
               keywords.includes(command);
      });
      
      if (found) {
        setResultLink(found);
        setShowResult(true);
      } else {
        toast.error('❌ No link found for: ' + command);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error);
      toast.error('❌ Voice recognition error. Please try again.');
    };

    recognition.start();
    toast.info('🎤 Listening...');
  };

  // ============================================================
  // تابع ساخت لینک جادویی (فقط در حالت Magic Link Only)
  // ============================================================
  const generateMagicLink = async () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    toast.info('🎤 Say the platform name (e.g. Telegram)...');

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('🎤 Voice command for magic link:', command);

      const found = links.find(link => {
        const keywords = link.keywords?.toLowerCase() || '';
        return link.title.toLowerCase().includes(command) ||
               link.platform.toLowerCase().includes(command) ||
               keywords.includes(command);
      });

      if (found) {
        const token = crypto.randomUUID();
        const shortCode = token.substring(0, 8);
        const magicLink = `https://govoicelink.vercel.app/go/${shortCode}`;

        const magicLinks = JSON.parse(localStorage.getItem('govoicelink_magic_links') || '{}');
        magicLinks[shortCode] = found.url;
        localStorage.setItem('govoicelink_magic_links', JSON.stringify(magicLinks));

        await navigator.clipboard.writeText(magicLink);
        toast.success(`✅ Magic link copied: ${magicLink}`);
        setResultLink(found);
        setShowResult(true);
      } else {
        toast.error('❌ No link found for: ' + command);
      }
    };

    recognition.onerror = () => {
      toast.error('❌ Voice recognition error. Please try again.');
    };

    recognition.start();
  };

  // ============================================================
  // توابع CRUD لینک‌ها
  // ============================================================
  const addLink = async (data: Omit<LinkType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newLink = {
      ...data,
      user_id: userId,
      sort_order: links.length,
    };
    const { data: inserted, error } = await supabase
      .from('links')
      .insert([newLink])
      .select()
      .single();

    if (error) {
      toast.error('Failed to add link: ' + error.message);
      return;
    }
    setLinks([...links, inserted]);
    toast.success(`${data.platform} added!`);
  };

  const updateLink = async (id: string, data: Partial<LinkType>) => {
    const { error } = await supabase
      .from('links')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update link: ' + error.message);
      return;
    }
    const updated = links.map(link =>
      link.id === id ? { ...link, ...data } : link
    );
    setLinks(updated);
    toast.success('Link updated!');
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to delete link: ' + error.message);
      return;
    }
    setLinks(links.filter(link => link.id !== id));
    toast.success('Link deleted!');
  };

  const updateUserName = async (name: string) => {
    setUserName(name);
    localStorage.setItem('govoicelink_user_name', name);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('user_id', userId);
    if (error) {
      toast.error('Failed to update name: ' + error.message);
    } else {
      toast.success('Name updated!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Image size should be less than 2MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserAvatar(dataUrl);
      toast.info('Uploading...');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Failed to upload image: ' + uploadError.message);
        const savedAvatar = localStorage.getItem('govoicelink_user_avatar');
        if (savedAvatar) {
          setUserAvatar(savedAvatar);
        } else {
          setUserAvatar('');
        }
        e.target.value = '';
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) {
        toast.error('Failed to save avatar URL: ' + updateError.message);
        const savedAvatar = localStorage.getItem('govoicelink_user_avatar');
        if (savedAvatar) {
          setUserAvatar(savedAvatar);
        } else {
          setUserAvatar('');
        }
        e.target.value = '';
        return;
      }

      setUserAvatar(publicUrl);
      localStorage.setItem('govoicelink_user_avatar', publicUrl);
      setAvatarKey(prev => prev + 1);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('An unexpected error occurred.');
      const savedAvatar = localStorage.getItem('govoicelink_user_avatar');
      if (savedAvatar) {
        setUserAvatar(savedAvatar);
      } else {
        setUserAvatar('');
      }
    }

    e.target.value = '';
  };

  const triggerFileUpload = (mode: 'gallery' | 'camera') => {
    if (fileInputRef.current) {
      if (mode === 'camera') {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(search.toLowerCase()) ||
    link.platform.toLowerCase().includes(search.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    const key = platform.toLowerCase();
    return platformIcons[key] || <Link2 className="w-5 h-5 text-gray-400" />;
  };

  const getInitials = () => {
    return userName.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full hover:ring-4 hover:ring-blue-400/50 transition-all outline-none">
                    <Avatar key={avatarKey} className="w-24 h-24 border-4 border-slate-200 dark:border-slate-700 shadow-lg">
                      {userAvatar ? (
                        <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        {userAvatar ? (
                          <AvatarImage src={userAvatar} alt={userName} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{userName}</p>
                        <p className="text-xs text-muted-foreground">Free Plan</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => {
                    const newName = prompt('Enter your name:', userName);
                    if (newName && newName.trim()) {
                      updateUserName(newName.trim());
                    }
                  }}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Edit Name</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => triggerFileUpload('gallery')}>
                    <Camera className="w-4 h-4 mr-2" />
                    <span>Choose from Gallery</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => triggerFileUpload('camera')}>
                    <Camera className="w-4 h-4 mr-2" />
                    <span>Take Photo</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    <span className="mr-2">🇬🇧</span>
                    <span>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('fa')}>
                    <span className="mr-2">🇮🇷</span>
                    <span>فارسی</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                    <span className="mr-2">🇸🇦</span>
                    <span>العربية</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('tr')}>
                    <span className="mr-2">🇹🇷</span>
                    <span>Türkçe</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => {
                    window.open(`/${userId}`, '_blank');
                  }}>
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Public Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => {
                    toast.info('Settings page coming soon!');
                  }}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden sm:block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  {userName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground mr-2 hidden sm:block">
                {selectedLanguage === 'en' && '🇬🇧 EN'}
                {selectedLanguage === 'fa' && '🇮🇷 FA'}
                {selectedLanguage === 'ar' && '🇸🇦 AR'}
                {selectedLanguage === 'tr' && '🇹🇷 TR'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecognition}
                className="gap-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <Mic className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">Voice</span>
              </Button>

              {/* دکمه‌ی اصلی: بسته به حالت Feature Flag */}
              {isMagicLinkOnly ? (
                <Button
                  size="sm"
                  onClick={generateMagicLink}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Magic Link
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => { setEditingLink(null); setIsDialogOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleAvatarUpload(e);
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Actions - فقط در نسخه‌ی کامل نمایش داده شود */}
        {!isMagicLinkOnly && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">⚡ Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {links
                .filter(link => link.isQuickAction)
                .slice(0, 6)
                .map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleCopy(link.url, link.platform)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200 dark:border-blue-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:shadow-md transition-all hover:scale-105"
                  >
                    {link.icon || '🔗'} {link.title}
                  </button>
                ))}
            </div>
            {links.filter(link => link.isQuickAction).length === 0 && (
              <p className="text-sm text-muted-foreground">No quick actions yet. Enable "Show in Quick Actions" when adding a link.</p>
            )}
          </div>
        )}

        {/* بخش آمار و جستجو - فقط در نسخه‌ی کامل */}
        {!isMagicLinkOnly && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Your Links
              </h2>
              <p className="text-sm text-muted-foreground">
                {links.length} {links.length === 1 ? 'link' : 'links'} saved
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* لیست لینک‌ها - فقط در نسخه‌ی کامل */}
        {!isMagicLinkOnly && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Link2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  No links yet
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first link to get started
                </p>
                <Button
                  onClick={() => { setEditingLink(null); setIsDialogOpen(true); }}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Link
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLinks.map((link) => (
                  <Card
                    key={link.id}
                    className="group border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            {getPlatformIcon(link.platform)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">
                              {link.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.platform}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* دکمه‌ی ارسال دوگانه (جدید) - فقط در نسخه‌ی کامل */}
                          {!isMagicLinkOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                              onClick={() => sendDualLink(link)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={() => handleCopy(link.url, link.platform)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => { setEditingLink(link); setIsDialogOpen(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog افزودن لینک - فقط در نسخه‌ی کامل */}
      {!isMagicLinkOnly && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const data = {
                  platform: formData.get('platform') as string,
                  title: formData.get('title') as string,
                  url: formData.get('url') as string,
                  icon: formData.get('icon') as string || '🔗',
                  is_active: true,
                  sort_order: 0,
                  keywords: formData.get('keywords') as string || '',
                  message: formData.get('message') as string || '',
                  isQuickAction: formData.get('isQuickAction') === 'on',
                };

                if (editingLink) {
                  updateLink(editingLink.id, data);
                } else {
                  addLink(data);
                }
                setIsDialogOpen(false);
              }}
            >
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
                <select
                  name="platform"
                  defaultValue={editingLink?.platform || ''}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select a platform...</option>
                  <optgroup label="Messaging">
                    <option value="telegram">💬 Telegram</option>
                    <option value="whatsapp">📱 WhatsApp</option>
                  </optgroup>
                  <optgroup label="Social Media">
                    <option value="instagram">📸 Instagram</option>
                    <option value="linkedin">💼 LinkedIn</option>
                    <option value="twitter">🐦 Twitter / X</option>
                    <option value="facebook">👍 Facebook</option>
                    <option value="youtube">▶️ YouTube</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="snapchat">👻 Snapchat</option>
                    <option value="reddit">🤖 Reddit</option>
                    <option value="pinterest">📌 Pinterest</option>
                  </optgroup>
                  <optgroup label="Developer">
                    <option value="github">🐙 GitHub</option>
                    <option value="discord">🎮 Discord</option>
                  </optgroup>
                  <optgroup label="Email">
                    <option value="gmail">📧 Gmail</option>
                    <option value="outlook">📨 Outlook</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="website">🌐 Website</option>
                    <option value="email">📧 Email</option>
                    <option value="phone">📞 Phone</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <Input
                  name="title"
                  placeholder="Display name"
                  defaultValue={editingLink?.title || ''}
                  className="mt-1 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                <Input
                  name="url"
                  placeholder="https://t.me/username"
                  defaultValue={editingLink?.url || ''}
                  className="mt-1 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Icon (emoji)</label>
                <Input
                  name="icon"
                  placeholder="🔗"
                  defaultValue={editingLink?.icon || ''}
                  className="mt-1 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice Keywords (comma separated)</label>
                <Input
                  name="keywords"
                  placeholder="telegram, tg, t.me, تلگرام"
                  defaultValue={editingLink?.keywords || ''}
                  className="mt-1 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keywords in multiple languages for voice recognition. Auto-filled based on platform &amp; language.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message (optional)</label>
                <textarea
                  name="message"
                  placeholder="Your message here..."
                  defaultValue={editingLink?.message || ''}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">Optional message to send with the link</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isQuickAction"
                  id="isQuickAction"
                  defaultChecked={editingLink?.isQuickAction || false}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isQuickAction" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Show in Quick Actions
                </label>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
                {editingLink ? 'Update Link' : 'Create Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Result Card - بعد از تشخیص صدا (در هر دو حالت) */}
      {showResult && resultLink && (
        <ResultCard
          title={resultLink.title}
          platform={resultLink.platform}
          url={resultLink.url}
          message={resultLink.message}
          onCopyLink={() => copyLinkOnly(resultLink)}
          onCopyMessage={() => copyMessageWithLink(resultLink)}
          onShare={() => shareLink(resultLink)}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}