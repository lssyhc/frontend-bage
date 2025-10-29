'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  ChevronRight,
  Lock,
  LogOut,
  Trash2,
  User,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/axios';

export default function SettingsPage() {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      toast.success('Akun berhasil dihapus');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal menghapus akun. Silakan coba lagi nanti.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Berhasil keluar');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal keluar. Silakan coba lagi nanti.');
    }
  };

  return (
    <>
      <TopBar className="flex w-full items-center gap-3 p-4 text-xl font-semibold">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        Pengaturan
      </TopBar>
      <main className="flex flex-col items-center">
        <div className="divide-border w-full max-w-xl divide-y divide-solid">
          <Link
            href="/settings/profile"
            className="hover:bg-accent/40 focus-visible:bg-accent/40 focus:inset-ring-ring/50 flex h-22 items-center justify-between px-4 py-5 transition-colors focus:outline-none focus-visible:inset-ring-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Profil</span>
                <span className="text-muted-foreground text-sm">
                  Ubah foto profil, username, nama lengkap, dan bio Anda
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Link>

          <Link
            href="/settings/account"
            className="hover:bg-accent/40 focus-visible:bg-accent/40 focus:inset-ring-ring/50 flex h-22 items-center justify-between px-4 py-5 transition-colors focus:outline-none focus-visible:inset-ring-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2">
                <Lock size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Akun</span>
                <span className="text-muted-foreground text-sm">
                  Ubah email dan kata sandi Anda
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex h-22 w-full cursor-pointer items-center gap-3 px-4 py-5 text-yellow-500 transition-colors hover:bg-yellow-300/10 focus:inset-ring-yellow-300/40 focus:outline-none focus-visible:bg-yellow-300/10 focus-visible:inset-ring-2">
                <div className="p-2">
                  <LogOut size={20} />
                </div>
                <span className="font-semibold">Keluar</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Keluar</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin keluar dari akun Anda?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleLogout}>
                  Keluar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex h-22 w-full cursor-pointer items-center gap-3 px-4 py-5 text-red-500 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none">
                <div className="p-2">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold">Hapus Akun</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Hapus Akun</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini
                  tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Toaster richColors position="top-right" style={{ top: '68px' }} />
    </>
  );
}
