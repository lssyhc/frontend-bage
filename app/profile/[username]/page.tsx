'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { use } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Copy, Ellipsis, Settings, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import NavigationBar from '@/components/NavigationBar';
import PostItem from '@/components/PostItem';
import TopBar from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import { Post, User } from '@/types';

interface ExtendedUser extends User {
  bio: string | null;
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
  };
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const username = decodeURIComponent(resolvedParams.username);

  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followPending, setFollowPending] = useState(false);
  const scrollRestored = useRef(false);

  const isMine = currentUser?.username === getCleanUsername(username);

  function getCleanUsername(u: string) {
    return u.startsWith('%40') ? u.slice(3) : u.replace('@', '');
  }

  const cleanUsername = getCleanUsername(username);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, currentUserRes] = await Promise.all([
        api.get(`/users/${cleanUsername}`),
        api.get('/user'),
      ]);

      setUser(userRes.data.data);
      setCurrentUser(currentUserRes.data.data);

      const postsRes = await api.get(`/users/${userRes.data.data.id}/posts`);
      setPosts(postsRes.data.data);
    } catch (error) {
      toast.error('Gagal memuat profil. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [cleanUsername]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && posts.length > 0 && !scrollRestored.current) {
      const savedPosition = sessionStorage.getItem(
        `scroll_position_profile_${cleanUsername}`
      );
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }
      scrollRestored.current = true;
    }
  }, [loading, posts, cleanUsername]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(
        `scroll_position_profile_${cleanUsername}`,
        window.scrollY.toString()
      );
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cleanUsername]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Tautan profil berhasil disalin');
    } catch (error) {
      toast.error('Gagal menyalin tautan.');
    }
  };

  const handleFollow = async () => {
    if (!user || followPending) return;

    const previousUser = user;

    setFollowPending(true);
    try {
      const response = await api.post(`/users/${user.id}/follow`);
      const responseData = response.data.data;
      const isFollowing = Boolean(
        responseData?.is_following ?? !previousUser.is_followed
      );
      const totalFollowers = Number(
        responseData?.total_followers ?? previousUser.stats.followers_count
      );

      setUser((prev) =>
        prev
          ? {
            ...prev,
            is_followed: isFollowing,
            stats: {
              ...prev.stats,
              followers_count: totalFollowers,
            },
          }
          : null
      );
      toast.success(
        isFollowing ? 'Mulai mengikuti' : 'Berhenti mengikuti'
      );
    } catch (error) {
      setUser(previousUser);
      toast.error('Gagal memproses follow.');
    } finally {
      setFollowPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center">
        Pengguna tidak ditemukan
      </div>
    );
  }

  return (
    <>
      <TopBar className="text-md flex w-full items-center gap-3 truncate px-4 py-3 font-semibold tracking-tight">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Kembali"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-col">
          <span>{user.name}</span>
          <span className="text-muted-foreground block text-sm font-normal">
            {user.stats.posts_count} unggahan
          </span>
        </div>
      </TopBar>

      <main className="xs:pb-[78px] flex items-center justify-center pb-[81px]">
        <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-solid">
          <div className="flex flex-col gap-4 px-4 py-6">
            <div className="flex items-start justify-between">
              <Avatar className="size-20">
                <AvatarImage
                  asChild
                  src={user.profile_picture_url || undefined}
                >
                  <Image
                    src={user.profile_picture_url || ''}
                    alt={`Foto profil ${user.username}'`}
                    width={80}
                    height={80}
                    loading="eager"
                    unoptimized
                  />
                </AvatarImage>
                <AvatarFallback className="text-xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Ellipsis size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-3 py-2 font-bold"
                    >
                      <Copy size={16} />
                      Salin tautan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isMine ? (
                  <Button
                    variant="outline"
                    className="w-fit min-w-0 shrink rounded-full"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings />
                    Pengaturan
                  </Button>
                ) : (
                  <Button
                    variant={user.is_followed ? 'outline' : 'default'}
                    className="w-fit min-w-0 shrink rounded-full"
                    onClick={handleFollow}
                    disabled={followPending}
                  >
                    {user.is_followed ? 'Mengikuti' : 'Ikuti'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold">{user.name}</span>
              <span className="text-muted-foreground text-sm">
                @{user.username}
              </span>
            </div>

            {user.bio && (
              <p className="text-sm whitespace-pre-wrap">{user.bio}</p>
            )}

            <div className="flex gap-4 text-sm">
              <Link
                href={`/profile/${user.username}/following`}
                className="hover:underline"
              >
                <span className="font-bold">{user.stats.following_count}</span>{' '}
                <span className="text-muted-foreground">Mengikuti</span>
              </Link>
              <Link
                href={`/profile/${user.username}/followers`}
                className="hover:underline"
              >
                <span className="font-bold">{user.stats.followers_count}</span>{' '}
                <span className="text-muted-foreground">Pengikut</span>
              </Link>
            </div>
          </div>

          <div className="divide-border divide-y divide-solid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostItem key={post.id} post={post} onUpdate={fetchData} />
              ))
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                Belum ada unggahan
              </div>
            )}
          </div>
        </div>
      </main>
      <NavigationBar />
    </>
  );
}
