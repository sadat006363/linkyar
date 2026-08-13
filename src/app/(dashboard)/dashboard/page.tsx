'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mic, Copy, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
export const dynamic = 'force-dynamic';

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
    userId = crypto.randomUUID(); // شناسه یکتا
    localStorage.setItem('linkyar_user_id', userId);
  }
  return userId;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [userId, setUserId] = useState<string>('');

  // بارگذاری شناسه کاربر و لینک‌ها
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
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
      console.error('Error fetching links:', error);
      alert('Failed to load links. Please try again.');
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const handleCopy = async (url: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert(`${platform} link copied!`);
    } catch {
      alert('Failed to copy. Please copy manually.');
    }
  };

  // تشخیص صدا (مشابه قبل)
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
      } else {
        alert('No link found for: ' + command);
      }
    };
    recognition.start();
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
      alert('Failed to add link: ' + error.message);
      return;
    }
    setLinks([...links, inserted]);
  };

  const updateLink = async (id: string, data: Partial<LinkType>) => {
    const { error } = await supabase
      .from('links')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId); // اطمینان از امنیت

    if (error) {
      alert('Failed to update link: ' + error.message);
      return;
    }
    const updated = links.map(link =>
      link.id === id ? { ...link, ...data } : link
    );
    setLinks(updated);
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      alert('Failed to delete link: ' + error.message);
      return;
    }
    setLinks(links.filter(link => link.id !== id));
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(search.toLowerCase()) ||
    link.platform.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your social links</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your data is stored securely in the cloud. No sign-up required.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={startVoiceRecognition}
            className="relative group"
          >
            <Mic className="h-5 w-5 text-blue-600" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Voice
            </span>
          </Button>
          <Button
            onClick={() => { setEditingLink(null); setIsDialogOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
        />
      </div>

      {/* Links Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No links yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <Card
              key={link.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{link.icon || '🔗'}</span>
                      <div>
                        <h3 className="font-semibold text-sm truncate">
                          {link.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.url}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(link.url, link.platform)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditingLink(link); setIsDialogOpen(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
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
              <label className="text-sm font-medium">Platform</label>
              <Input
                name="platform"
                placeholder="e.g. Telegram, WhatsApp..."
                defaultValue={editingLink?.platform || ''}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                placeholder="Display name"
                defaultValue={editingLink?.title || ''}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                name="url"
                placeholder="https://t.me/username"
                defaultValue={editingLink?.url || ''}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Icon (emoji)</label>
              <Input
                name="icon"
                placeholder="🔗"
                defaultValue={editingLink?.icon || ''}
              />
            </div>
            <Button type="submit" className="w-full">
              {editingLink ? 'Update' : 'Add'} Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}