'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell, Home, Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/axios';

export default function NavigationBar() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUsername(response.data.data.username);
      } catch {
        toast.error('Gagal memuat data pengguna. Silakan coba lagi nanti.');
      }
    };
    fetchUser();
  }, []);

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <div className="xs:bottom-6 pointer-events-none fixed bottom-0 left-0 z-60 flex w-dvw justify-center">
      <nav className="bg-background border-border xs:max-w-xs xs:border-b xs:p-2 xs:gap-0 xs:rounded-xl pointer-events-auto relative flex w-full justify-between rounded-t-xl border-x border-t px-3 pt-3 pb-6 shadow-xs">
        <Link
          href="/feed"
          aria-label="Kunjungi halaman beranda"
          className={`hover:bg-accent focus:bg-accent xs:px-3 xs:py-2 focus:inset-ring-ring/50 w-fit cursor-pointer rounded-lg px-4 py-3 transition-colors focus:outline-none focus-visible:inset-ring-2 ${
            isActive('/feed')
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <Home size={20} />
        </Link>

        <Link
          href="/search"
          aria-label="Kunjungi halaman pencarian"
          className={`hover:bg-accent focus:bg-accent xs:px-3 xs:py-2 focus:inset-ring-ring/50 w-fit cursor-pointer rounded-lg px-4 py-3 transition-colors focus:outline-none focus-visible:inset-ring-2 ${
            isActive('/search')
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <Search size={20} />
        </Link>

        <Link
          href="/notifications"
          aria-label="Kunjungi halaman notifikasi"
          className={`hover:bg-accent focus:bg-accent xs:px-3 xs:py-2 focus:inset-ring-ring/50 w-fit cursor-pointer rounded-lg px-4 py-3 transition-colors focus:outline-none focus-visible:inset-ring-2 ${
            isActive('/notifications')
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <Bell size={20} />
        </Link>

        <Link
          href={username ? `/profile/${username}` : '/profile'}
          aria-label="Kunjungi halaman profil"
          className={`hover:bg-accent focus:bg-accent xs:px-3 xs:py-2 focus:inset-ring-ring/50 w-fit cursor-pointer rounded-lg px-4 py-3 transition-colors focus:outline-none focus-visible:inset-ring-2 ${
            isActive('/profile')
              ? 'bg-accent text-foreground font-bold'
              : 'text-muted-foreground'
          }`}
        >
          <User size={20} />
        </Link>

        <Link
          href="/create/post"
          aria-label="Buat unggahan baru"
          className={`hover:bg-primary/70 focus-visible:bg-primary/70 text-primary-foreground focus-visible:ring-ring/50 focus-visible:border-ring xs:px-3 xs:py-2 w-fit cursor-pointer rounded-lg px-4 py-3 transition focus:outline-none focus-visible:ring-2 ${
            isActive('/create/post')
              ? 'bg-primary/70 text-foreground'
              : 'text-muted-foreground bg-primary'
          }`}
        >
          <Plus size={20} />
        </Link>
      </nav>
    </div>
  );
}
