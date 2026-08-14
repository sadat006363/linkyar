'use client';

import { useState, useEffect } from 'react';
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
  User,
  Settings,
  LogOut,
  UserCircle,
  Camera
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

type LinkType = {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
};

// تابع برای دریافت یا ایجاد user_id در localStorage
function getUserId(): string {
  let userId = localStorage.getItem('linkyar_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('linkyar_user_id', userId);
  }
  return userId;
}

// آیکون‌های پیش‌فرض برای پلتفرم‌ها
const platformIcons: { [key: string]: JSX.Element } = {
  telegram: <MessageCircle className="w-5 h-5 text-blue-500" />,
  whatsapp: <MessageCircle className="w-5 h-5 text-green-500" />,
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  linkedin: <Linkedin className="w-5 h-5 text-blue-600" />,
  github: <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  twitter: <Twitter className="w-5 h-5 text-blue-400" />,
  website: <Globe className="w-5 h-5 text-purple-500" />,
  email: <Mail className="w-5 h-5 text-red-400" />,
  phone: <Phone className="w-5 h-5 text-green-600" />,
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

  // بارگذاری شناسه کاربر و لینک‌ها
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // خواندن نام و آواتار از localStorage
    const savedName = localStorage.getItem('linkyar_user_name');
    const savedAvatar = localStorage.getItem('linkyar_user_avatar');
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    fetchLinks(id);
  }, []);

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

  const startVoiceRecognition = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      const found = links.find(link =>
        link.platform.toLowerCase().includes(command) ||
        link.title.toLowerCase().includes(command)
      );
      if (found) {
        handleCopy(found.url, found.platform);
        toast.success(`Voice command: ${found.platform}`);
      } else {
        toast.error('No link found for: ' + command);
      }
    };
    recognition.start();
    toast.info('Listening...');
  };

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

  // به‌روزرسانی نام کاربر
  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('linkyar_user_name', name);
    toast.success('Name updated!');
  };

  // آپلود عکس پروفایل با اعتبارسنجی
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // ۱. اعتبارسنجی نوع فایل (فقط تصاویر)
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      e.target.value = '';
      return;
    }

    // ۲. محدودیت حجم (حداکثر ۲ مگابایت)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(`Image size should be less than 2MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      e.target.value = '';
      return;
    }

    // ۳. خواندن فایل با FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataUrl = event.target?.result as string;
        setUserAvatar(dataUrl);
        localStorage.setItem('linkyar_user_avatar', dataUrl);
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to save image. Please try again.');
        console.error('Avatar save error:', error);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);

    // ۴. پاک کردن input برای امکان انتخاب مجدد
    e.target.value = '';
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(search.toLowerCase()) ||
    link.platform.toLowerCase().includes(search.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    const key = platform.toLowerCase();
    return platformIcons[key] || <Link2 className="w-5 h-5 text-gray-400" />;
  };

  // گرفتن حرف اول نام برای آواتار پیش‌فرض
  const getInitials = () => {
    return userName.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Section */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinkYar
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Smart Link Assistant
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4">
              {/* Voice & Add Link Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startVoiceRecognition}
                  className="gap-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <Mic className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Voice</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => { setEditingLink(null); setIsDialogOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-blue-400/50 transition-all outline-none">
                    <Avatar className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700">
                      {userAvatar ? (
                        <AvatarImage src={userAvatar} alt={userName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                      {userName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
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
                  
                  {/* Edit Name */}
                  <DropdownMenuItem onClick={() => {
                    const newName = prompt('Enter your name:', userName);
                    if (newName && newName.trim()) {
                      updateUserName(newName.trim());
                    }
                  }}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Edit Name</span>
                  </DropdownMenuItem>

                  {/* Change Photo */}
                  <DropdownMenuItem>
                    <Camera className="w-4 h-4 mr-2" />
                    <label className="cursor-pointer w-full">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => {
                    // باز کردن صفحه عمومی
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats & Search */}
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

        {/* Links Grid */}
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

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using <span className="font-semibold text-blue-600 dark:text-blue-400">Next.js</span> &{' '}
            <span className="font-semibold text-purple-600 dark:text-purple-400">Supabase</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            © 2026 LinkYar — All rights reserved
          </p>
        </div>
      </div>

      {/* Dialog for Add/Edit */}
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
              <Input
                name="platform"
                placeholder="e.g. Telegram, WhatsApp..."
                defaultValue={editingLink?.platform || ''}
                className="mt-1 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                required
              />
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
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
              {editingLink ? 'Update Link' : 'Create Link'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}