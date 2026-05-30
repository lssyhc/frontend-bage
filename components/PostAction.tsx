'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Ellipsis, Heart, MessageCircle } from 'lucide-react';
import { Copy, Trash, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';
import { useMediaQuery } from '@/hooks/use-media-query';
import api from '@/lib/axios';

interface PostActionProps {
  postId: number;
  authorId: number;
  authorUsername: string;
  isMine: boolean;
  initialLikes: number;
  initialIsLiked: boolean;
  initialIsFollowed: boolean;
  repliesCount: number;
  onUpdate?: () => void;
  stopPropagation: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function PostAction({
  postId,
  authorId,
  authorUsername,
  isMine,
  initialLikes,
  initialIsLiked,
  initialIsFollowed,
  repliesCount,
  onUpdate,
  stopPropagation,
}: PostActionProps) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [likePending, setLikePending] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setLikeCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  const handleCommentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/post/${postId}?focus=comment`);
  };

  const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (likePending) return;

    const previousLiked = liked;
    const previousLikeCount = likeCount;

    setLikePending(true);
    setLiked((prevLiked) => !prevLiked);
    setLikeCount((prevCount) => prevCount + (previousLiked ? -1 : 1));

    try {
      const response = await api.post(`/posts/${postId}/like`);
      const responseData = response.data.data;

      setLiked(Boolean(responseData?.liked ?? !previousLiked));
      setLikeCount(Number(responseData?.total_likes ?? previousLikeCount));
      if (onUpdate) onUpdate();
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      toast.error('Gagal menyukai unggahan. Silakan coba lagi nanti.');
    } finally {
      setLikePending(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if (followPending) return;

    setIsDrawerOpen(false);
    const prevFollowed = isFollowed;

    setFollowPending(true);
    setIsFollowed(!prevFollowed);
    try {
      const response = await api.post(`/users/${authorId}/follow`);
      const nextIsFollowing = Boolean(
        response.data.data?.is_following ?? !prevFollowed
      );

      setIsFollowed(nextIsFollowing);
      toast.success(
        nextIsFollowing
          ? `Mulai mengikuti @${authorUsername}`
          : `Berhenti mengikuti @${authorUsername}`
      );
      if (onUpdate) onUpdate();
    } catch {
      setIsFollowed(prevFollowed);
      toast.error('Gagal mengikuti akun. Silakan coba lagi nanti.');
    } finally {
      setFollowPending(false);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsDrawerOpen(false);
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Tautan berhasil disalin');
    } catch {
      toast.error('Gagal menyalin tautan. Silakan coba lagi nanti.');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsDrawerOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Unggahan berhasil dihapus');
      if (onUpdate) {
        onUpdate();
      } else {
        // todo: benerin kalo misal dihapusnya pas lagi di halaman /post/[id]
        window.location.reload();
      }
    } catch {
      toast.error('Gagal menghapus unggahan. Silakan coba lagi nanti.');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const isXs = useMediaQuery('(max-width: 30rem)');
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formattedReplies =
    repliesCount > 1000 ? `${(repliesCount / 1000).toFixed(1)}k` : repliesCount;

  return (
    <>
      <div className="flex px-3 pt-2">
        <div className="flex flex-1 items-center gap-1">
          <button
            aria-label="Sukai unggahan"
            onClick={handleLikeClick}
            disabled={likePending}
            className={`peer text-muted-foreground cursor-pointer rounded-sm p-1 transition hover:bg-red-500/10 hover:text-red-500 focus-visible:bg-red-500/10 focus-visible:text-red-500 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none ${
              liked ? 'text-red-500 *:[svg]:fill-red-500' : ''
            }`}
          >
            <Heart size={16} />
          </button>
          <Link
            href={`/post/${postId}/likes`}
            className={`text-sm peer-hover:text-red-500 hover:underline focus:underline focus:outline-none ${
              liked ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={stopPropagation}
          >
            {likeCount}
          </Link>
        </div>

        <div className="flex flex-1 items-center gap-1">
          <button
            aria-label="Komentari unggahan"
            onClick={handleCommentClick}
            className="peer text-muted-foreground cursor-pointer rounded-sm p-1 transition hover:bg-blue-500/10 hover:text-blue-500 focus-visible:bg-blue-500/10 focus-visible:text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          >
            <MessageCircle size={16} />
          </button>
          <span className="text-muted-foreground text-sm peer-hover:text-blue-500">
            {formattedReplies}
          </span>
        </div>

        <div className="flex flex-1 justify-end">
          {isXs ? (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  aria-label="Opsi lainnya"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDrawerOpen(true);
                  }}
                  className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
                >
                  <Ellipsis size={16} />
                </button>
              </DrawerTrigger>

              <DrawerContent className="px-6">
                <DrawerHeader className="hidden">
                  <DrawerTitle>
                    <VisuallyHidden>More options</VisuallyHidden>
                  </DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col gap-6 py-6">
                  {!isMine && (
                    <button
                      className="flex items-center gap-4 text-left font-bold"
                      onClick={handleFollow}
                      disabled={followPending}
                    >
                      <UserPlus size={16} />
                      {isFollowed ? 'Berhenti mengikuti' : 'Ikuti user'}
                    </button>
                  )}
                  <button
                    className="flex items-center gap-4 text-left font-bold"
                    onClick={handleCopyLink}
                  >
                    <Copy size={16} />
                    Salin tautan
                  </button>
                  {isMine && (
                    <button
                      className="flex items-center gap-4 text-left font-bold text-red-600"
                      onClick={handleDeleteClick}
                    >
                      <Trash size={16} />
                      Hapus unggahan
                    </button>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                asChild
                onClick={stopPropagation}
                className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
              >
                <button aria-label="More options">
                  <Ellipsis size={16} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="top"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {!isMine && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 font-bold"
                    onClick={handleFollow}
                    disabled={followPending}
                  >
                    <UserPlus size={16} />
                    {isFollowed ? 'Berhenti mengikuti' : 'Ikuti user'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 font-bold"
                  onClick={handleCopyLink}
                >
                  <Copy size={16} />
                  Salin tautan
                </DropdownMenuItem>
                {isMine && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 font-bold"
                    variant="destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash size={16} />
                    Hapus unggahan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Hapus Unggahan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus unggahan ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete();
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
