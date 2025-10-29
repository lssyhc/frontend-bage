'use client';

import { use, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowLeft, SendHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';

import CommentAction from '@/components/CommentAction';
import CommentItem from '@/components/CommentItem';
import NavigationBar from '@/components/NavigationBar';
import PostDetail from '@/components/PostDetail';
import TopBar from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { InputGroupText } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/lib/axios';
import { Comment, Post, User } from '@/types';

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [post, setPost] = useState<Post | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5 });

  useEffect(() => {
    if (loading) return;

    const focus = searchParams.get('focus');
    const commentId = searchParams.get('commentId');

    if (focus === 'comment') {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }

    if (commentId) {
      setTimeout(() => {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-accent/40');
          setTimeout(() => element.classList.remove('bg-accent/40'), 2000);
        }
      }, 100);
    }
  }, [loading, searchParams]);

  const fetchComments = async (
    currentPage: number,
    isLoadMore: boolean = false
  ) => {
    if (!isLoadMore) setCommentsLoading(true);

    try {
      const response = await api.get(
        `/posts/${resolvedParams.id}/comments?page=${currentPage}`
      );
      const newComments = response.data.data;
      const meta = response.data.meta;

      setComments((prev) => {
        if (isLoadMore) {
          const uniqueIncoming = newComments.filter(
            (nc: Comment) => !prev.some((pc) => pc.id === nc.id)
          );
          return [...prev, ...uniqueIncoming];
        }
        return newComments;
      });

      setHasMore(meta ? meta.current_page < meta.last_page : false);
    } catch (error) {
      toast.error('Gagal memuat komentar.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [postRes, userRes] = await Promise.all([
        api.get(`/posts/${resolvedParams.id}`),
        api.get('/user'),
      ]);
      setPost(postRes.data.data);
      setCurrentUser(userRes.data.data);
    } catch (error) {
      toast.error('Gagal memuat unggahan. Silakan coba lagi nanti.');
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchComments(page, true);
    }
  }, [page]);

  useEffect(() => {
    if (isIntersecting && hasMore && !commentsLoading) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, commentsLoading]);

  useEffect(() => {
    fetchData();
    fetchComments(1, false);
  }, [resolvedParams.id, router]);

  const MAX_COMMENT_LENGTH = 150;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/posts/${resolvedParams.id}/comments`, {
        content: commentText,
      });
      setComments([response.data.data, ...comments]);
      setCommentText('');
      toast.success('Komentar berhasil dikirim!');
    } catch (error) {
      toast.error('Gagal mengirim komentar. Silakan coba lagi nanti.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <TopBar className="flex w-full items-center gap-3 p-4 text-xl font-semibold">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Kembali"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
        Unggahan
      </TopBar>

      <main className="xs:pb-[78px] flex flex-col items-center justify-center pb-[81px]">
        <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-solid">
          <PostDetail post={post} onUpdate={fetchData} />

          <div className="flex w-full gap-3 px-4 py-6">
            {currentUser && (
              <Avatar className="size-9">
                <AvatarImage
                  asChild
                  src={currentUser.profile_picture_url || undefined}
                >
                  <Image
                    src={currentUser.profile_picture_url || ''}
                    alt={`Foto profil ${currentUser.username}`}
                    width={36}
                    height={36}
                    unoptimized
                  />
                </AvatarImage>
                <AvatarFallback>
                  {currentUser.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <form
              onSubmit={handleCommentSubmit}
              className="flex flex-1 flex-col"
            >
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Kirim komentar anda"
                  value={commentText}
                  onChange={(e) =>
                    e.target.value.length <= MAX_COMMENT_LENGTH &&
                    setCommentText(e.target.value)
                  }
                  className="min-h-[60px] pr-28"
                  disabled={submittingComment}
                />
                <div className="absolute right-0 bottom-0 mr-2 mb-1 flex items-center gap-3">
                  <InputGroupText className="text-muted-foreground text-xs">
                    {commentText.length}/{MAX_COMMENT_LENGTH}
                  </InputGroupText>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 rounded-lg"
                    type="submit"
                    disabled={
                      !commentText.trim() ||
                      commentText.length > MAX_COMMENT_LENGTH ||
                      submittingComment
                    }
                  >
                    {submittingComment ? (
                      <Spinner className="size-4" />
                    ) : (
                      <SendHorizontalIcon size={20} />
                    )}
                    <span className="sr-only">Kirim balasan</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {comments.map((comment) => (
            <div
              key={comment.id}
              id={`comment-${comment.id}`}
              className="transition-colors duration-500"
            >
              <CommentItem comment={comment} onDelete={handleDeleteComment} />
            </div>
          ))}

          {commentsLoading && (
            <div className="flex w-full items-center justify-center p-8">
              <Spinner className="size-8" />
            </div>
          )}
        </div>
        {hasMore && <div ref={ref} className="h-24 w-full" />}
      </main>
      <NavigationBar />
    </>
  );
}
