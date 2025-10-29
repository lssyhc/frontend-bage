'use client';

import Image from 'next/image';
import Link from 'next/link';

import CommentAction from '@/components/CommentAction';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTimestamp } from '@/lib/utils';
import { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: number) => void;
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <article
      className="has-[button:focus-visible]:bg-accent/40 has-[a:focus-visible]:bg-accent/40 hover:bg-accent/40 focus-visible:bg-accent/40 focus:inset-ring-ring/50 flex w-full cursor-pointer flex-col gap-4 px-4 py-6 transition-colors focus:outline-none focus-visible:inset-ring-2"
      tabIndex={0}
    >
      <div className="flex gap-3">
        <Link
          href={`/profile/${comment.user.username}`}
          className="transition-[filter] select-none hover:brightness-80 focus:brightness-80 focus:outline-none"
          onClick={stopPropagation}
        >
          <Avatar className="size-9">
            <AvatarImage
              asChild
              src={comment.user.profile_picture_url || undefined}
            >
              <Image
                src={comment.user.profile_picture_url || ''}
                alt={`Foto profil ${comment.user.username}`}
                width={36}
                height={36}
                unoptimized
              />
            </AvatarImage>
            <AvatarFallback>
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-grow flex-col gap-1">
          <div className="flex gap-1">
            <Link
              href={`/profile/${comment.user.username}`}
              className="flex hover:underline focus:underline focus:outline-none"
              onClick={stopPropagation}
            >
              <span className="text-sm leading-tight font-semibold">
                {comment.user.name}
              </span>
            </Link>
            <span className="text-muted-foreground text-sm leading-tight">
              @{comment.user.username}
            </span>
          </div>

          <span className="text-left text-sm">{comment.content}</span>
        </div>

        <span className="text-muted-foreground text-sm">
          {formatTimestamp(comment.created_at)}
        </span>
      </div>

      <CommentAction
        commentId={comment.id}
        isMine={comment.is_owner}
        onDelete={() => onDelete(comment.id)}
        stopPropagation={stopPropagation}
      />
    </article>
  );
}
