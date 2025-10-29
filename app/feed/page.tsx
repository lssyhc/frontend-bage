'use client';

import { useEffect, useRef, useState } from 'react';

// import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { toast } from 'sonner';

// import { useSearchParams } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Feed',
// };

import NavigationBar from '@/components/NavigationBar';
import PostItem from '@/components/PostItem';
import TopBar from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/lib/axios';
import { Post, User } from '@/types';

const feedCache: Record<
  string,
  { posts: Post[]; page: number; hasMore: boolean }
> = {};

export default function FeedPage() {
  const [selectedOption, setSelectedOption] = useState('Saran');
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isRestored, setIsRestored] = useState(false);

  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
  });

  const loadedFromCache = useRef(false);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  useEffect(() => {
    setIsRestored(false);
  }, [selectedOption]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        if (response.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        toast.error('Gagal memuat profil pengguna. Silahkan coba lagi nanti.');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('feed_tab');
    if (savedTab && savedTab !== selectedOption) {
      setSelectedOption(savedTab);
    }
  }, []);

  useEffect(() => {
    if (selectedOption) {
      sessionStorage.setItem('feed_tab', selectedOption);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (!loading && posts.length > 0 && !isRestored) {
      if (loadedFromCache.current) {
        const savedPosition = sessionStorage.getItem(
          `scroll_position_${selectedOption}`
        );
        if (savedPosition) {
          window.scrollTo(0, parseInt(savedPosition, 10));
        }
      }
      setIsRestored(true);
    }
  }, [loading, posts, selectedOption, isRestored]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(
        `scroll_position_${selectedOption}`,
        window.scrollY.toString()
      );
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedOption]);

  const fetchPosts = async (
    currentPage: number,
    isLoadMore: boolean = false
  ) => {
    const type = selectedOption === 'Saran' ? 'fyp' : 'following';

    if (!isLoadMore) {
      if (feedCache[type]) {
        setPosts(feedCache[type].posts);
        setPage(feedCache[type].page);
        setHasMore(feedCache[type].hasMore);
        setLoading(false);
        loadedFromCache.current = true;
        return;
      }
    }

    loadedFromCache.current = false;
    setLoading(true);

    try {
      const response = await api.get(`/feed?type=${type}&page=${currentPage}`);
      const newPosts = response.data.data;
      const meta = response.data.meta;

      setPosts((prev) => {
        const uniqueIncomingPosts = Array.from(
          new Map(newPosts.map((p: Post) => [p.id, p])).values()
        ) as Post[];

        let updatedPosts: Post[];
        if (isLoadMore) {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = uniqueIncomingPosts.filter(
            (p: Post) => !existingIds.has(p.id)
          );
          updatedPosts = [...prev, ...uniqueNewPosts];
        } else {
          updatedPosts = uniqueIncomingPosts;
        }

        feedCache[type] = {
          posts: updatedPosts,
          page: currentPage,
          hasMore: meta.current_page < meta.last_page,
        };

        return updatedPosts;
      });

      setHasMore(meta.current_page < meta.last_page);
    } catch (error) {
      toast.error('Gagal memuat unggahan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [selectedOption]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page]);

  return (
    <>
      <TopBar className="flex w-full items-center gap-4 p-4">
        <div className="flex flex-1">
          <Select
            value={selectedOption}
            onValueChange={(value) => {
              setSelectedOption(value);
            }}
          >
            <SelectTrigger className="hover:bg-accent w-29 cursor-pointer shadow-none transition-[box-shadow]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <SelectItem value="Saran">Saran</SelectItem>
              <SelectItem value="Mengikuti">Mengikuti</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Image
          src="/icon.svg"
          alt="Ikon aplikasi Bage"
          width={16}
          height={24}
          className="select-none"
        />

        <div className="flex flex-1 justify-end">
          {user && (
            <Link
              href={`/profile/${user.username}`}
              className="transition-[filter] select-none hover:brightness-80 focus:brightness-80 focus:outline-none"
            >
              <Avatar className="size-9">
                <AvatarImage
                  asChild
                  src={user.profile_picture_url || undefined}
                >
                  <Image
                    src={user.profile_picture_url || ''}
                    alt="Kunjungi halaman profil"
                    width={36}
                    height={36}
                    unoptimized
                  />
                </AvatarImage>
                <AvatarFallback>
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </TopBar>

      <main className="xs:pb-[78px] flex items-center justify-center pb-[81px]">
        <div className="flex w-full max-w-xl flex-col">
          {loading && posts.length === 0 ? (
            <div className="flex h-[calc(100dvh-150px)] w-full items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : (
            <>
              {!loading && posts.length === 0 ? (
                <div className="text-muted-foreground flex h-[calc(100vh-150px)] items-center justify-center p-8 text-center">
                  Belum ada unggahan
                </div>
              ) : (
                <div className="divide-border divide-y divide-solid">
                  {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}

                  {loading && (
                    <div className="flex w-full items-center justify-center p-8">
                      <Spinner className="size-8" />
                    </div>
                  )}
                </div>
              )}

              {hasMore && <div ref={ref} className="h-24 w-full" />}
            </>
          )}
        </div>
      </main>

      <NavigationBar />
    </>
  );
}
