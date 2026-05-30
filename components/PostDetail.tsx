'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Star, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { formatDetailTimestamp } from '@/lib/utils';
import { Post } from '@/types';

import PostAction from './PostAction';

interface PostDetailProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostDetail({ post, onUpdate }: PostDetailProps) {
  const router = useRouter();

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on('select', updateCurrent);

    return () => {
      api.off('select', updateCurrent);
    };
  }, [api]);

  const images = post.media.map((m) => m.url);
  const imagesCount = images.length;

  const getGridClass = (index: number) => {
    if (imagesCount === 1) {
      return 'col-span-2 row-span-2';
    }

    if (imagesCount === 2) {
      return 'col-span-1 row-span-2';
    }

    if (imagesCount === 3) {
      if (index === 0) return 'col-span-1 row-span-2';

      return 'col-span-1 row-span-1';
    }

    if (imagesCount === 4) {
      return 'col-span-1 row-span-1';
    }

    return '';
  };

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openModalAndStopPropagation = (
    e: React.MouseEvent<HTMLButtonElement>,
    i: number
  ) => {
    e.stopPropagation();
    setSelectedIndex(i);
    setCurrent(i + 1);
    setOpen(true);
  };

  const closeModalAndStopPropagation = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <article
      className="has-[button:focus-visible]:bg-accent/40 has-[a:focus-visible]:bg-accent/40 hover:bg-accent/40 focus-visible:bg-accent/40 focus:inset-ring-ring/50 flex w-full cursor-pointer flex-col gap-4 px-4 py-6 transition-colors focus:outline-none focus-visible:inset-ring-2"
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/profile/${post.user.username}`}
          onClick={stopPropagation}
          className="transition-[filter] select-none hover:brightness-80 focus:brightness-80 focus:outline-none"
        >
          <Avatar className="size-9">
            <AvatarImage asChild src={post.user.profile_picture_url || undefined}>
              <Image
                src={post.user.profile_picture_url || ''}
                alt={`Foto profil ${post.user.username}`}
                width={36}
                height={36}
                unoptimized
              />
            </AvatarImage>
            <AvatarFallback>
              {post.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex w-full max-w-[calc(100%-48px)] flex-col gap-1">
          <div className="flex w-full gap-1">
            <div className="flex w-full min-w-0 flex-1 gap-1">
              <Link
                href={`/profile/${post.user.username}`}
                onClick={stopPropagation}
                className="truncate text-sm font-semibold hover:underline focus:underline focus:outline-none"
              >
                {post.user.name}
              </Link>
              <span className="text-muted-foreground flex-1 truncate text-sm">
                @{post.user.username}
              </span>
            </div>
          </div>

          {post.location && (
            <Link
              href={`/place/${post.location.id}`}
              onClick={stopPropagation}
              className="w-fit text-sm hover:underline focus:underline focus:outline-none"
            >
              {post.location.name}
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: post.rating ?? 0 }).map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-300 text-yellow-300" />
        ))}
      </div>

      <span className="text-sm">{post.content}</span>

      {imagesCount > 0 && (
        <div className="has-[button:focus-visible]:ring-ring/50 grid aspect-[16/9] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl transition-colors select-none has-[button:focus-visible]:ring-3">
          {images.map((src, i) => (
            <button
              key={i}
              className={`cursor-pointer transition-[filter] hover:brightness-80 focus-visible:brightness-80 focus:outline-none ${getGridClass(i)}`}
              onClick={(e) =>
                openModalAndStopPropagation(
                  e as React.MouseEvent<HTMLButtonElement>,
                  i
                )
              }
            >
              <Image
                src={src}
                alt={`Gambar ${i + 1}`}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-black/90"
          onClick={stopPropagation}
        >
          <button
            className="text-primary-foreground absolute top-4 right-4"
            onClick={closeModalAndStopPropagation}
          >
            <X size={24} />
          </button>

          <Carousel
            setApi={setApi}
            className="max-w-xl"
            opts={{ startIndex: selectedIndex }}
          >
            <CarouselContent className="items-center">
              {images.map((src, i) => (
                <CarouselItem key={i}>
                  <Image
                    src={src}
                    alt={`Gambar ${i}`}
                    width={800}
                    height={800}
                    className="object-contain select-none"
                    unoptimized
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="text-primary-foreground pointer-events-none fixed top-4 left-0 flex w-dvw justify-center text-sm">
            Gambar {current} dari {imagesCount}
          </div>
        </div>
      )}

      <span className="text-muted-foreground text-sm">
        {formatDetailTimestamp(post.created_at)}
      </span>

      <div className="border-t-border border-t border-solid pt-4">
        <PostAction
          postId={post.id}
          authorId={post.user.id}
          authorUsername={post.user.username}
          isMine={post.is_mine}
          initialLikes={post.total_likes}
          initialIsLiked={post.is_liked}
          initialIsFollowed={post.user.is_followed}
          repliesCount={post.total_comments}
          onUpdate={onUpdate}
          stopPropagation={stopPropagation}
        />
      </div>
    </article>
  );
}
