'use client';

import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface AccountItemProps {
  user: {
    id: number;
    name: string;
    username: string;
    profile_picture_url: string | null;
    is_followed: boolean;
    is_mine?: boolean;
    bio?: string | null;
  };
  onFollow?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function AccountItem({ user, onFollow }: AccountItemProps) {
  const router = useRouter();

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    router.push(`/profile/${user.username}`);
  };

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="hover:bg-accent/40 has-[a:focus-visible]:bg-accent/40 has-[button:focus-visible]:bg-accent/40 focus-visible:bg-accent/40 focus:inset-ring-ring/50 flex w-full cursor-pointer gap-3 px-4 py-6 transition-colors focus:outline-none focus-visible:inset-ring-2"
      onClick={handleProfileClick}
      tabIndex={0}
    >
      <Link
        href={`/profile/${user.username}`}
        onClick={stopPropagation}
        className="transition-[filter] select-none hover:brightness-80 focus:brightness-80 focus:outline-none"
      >
        <Avatar className="size-9">
          <AvatarImage asChild src={user.profile_picture_url || undefined}>
            <Image
              src={user.profile_picture_url || ''}
              alt={`Foto profil ${user.username}`}
              width={36}
              height={36}
              unoptimized
            />
          </AvatarImage>
          <AvatarFallback>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex min-w-0 flex-1 flex-grow flex-col justify-center gap-1">
        <div className="flex gap-1">
          <Link
            href={`/profile/${user.username}`}
            onClick={stopPropagation}
            className="flex min-w-0 hover:underline focus:underline focus:outline-none"
          >
            <span className="truncate text-sm leading-tight font-semibold">
              {user.name}
            </span>
          </Link>
          <span className="text-muted-foreground flex-1 truncate text-sm leading-tight">
            @{user.username}
          </span>
        </div>
        {user.bio && <span className="text-sm">{user.bio}</span>}
      </div>

      {!user.is_mine && (
        <Button
          onClick={onFollow}
          variant={user.is_followed ? 'outline' : 'default'}
          className="w-fit flex-shrink-0 cursor-pointer rounded-full text-sm font-semibold shadow-none"
        >
          {user.is_followed ? 'Mengikuti' : 'Ikuti'}
        </Button>
      )}
    </div>
  );
}
