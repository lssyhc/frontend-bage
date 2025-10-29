'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import NavigationBar from '@/components/NavigationBar';
import PlaceDetail from '@/components/PlaceDetail';
import PostItem from '@/components/PostItem';
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import { LocationDetail, Post } from '@/types';

export default function PlaceProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [locationRes, postsRes] = await Promise.all([
          api.get(`/locations/${id}`),
          api.get(`/locations/${id}/posts`),
        ]);

        setLocation(locationRes.data.data);
        setPosts(postsRes.data.data);
      } catch (error) {
        toast.error('Gagal memuat tempat. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!id) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center p-8 text-center">
        Tempat tidak ditemukan
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center p-8 text-center">
        Tempat tidak ditemukan
      </div>
    );
  }

  return (
    <>
      <TopBar className="text-md flex w-full items-center justify-between gap-3 truncate px-4 py-3 font-semibold tracking-tight">
        <div className="flex items-center gap-3 truncate">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Kembali"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="truncate">
            {location.name}
            <span className="text-muted-foreground block text-sm font-normal">
              {posts.length} posts
            </span>
          </div>
        </div>
      </TopBar>

      <main className="xs:pb-[78px] flex flex-col items-center justify-center pb-[81px]">
        <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-solid">
          <PlaceDetail
            location={location}
            postCount={posts.length}
            averageRating={
              posts.length > 0
                ? posts.reduce((acc, post) => acc + (post.rating || 0), 0) /
                  posts.length
                : 0
            }
            totalRatings={posts.length}
          />

          <div className="divide-border divide-y divide-solid">
            {posts.length > 0 ? (
              posts.map((post) => <PostItem key={post.id} post={post} />)
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                Belum ada unggahan di tempat ini.
              </div>
            )}
          </div>
        </div>
      </main>
      <NavigationBar />
    </>
  );
}
