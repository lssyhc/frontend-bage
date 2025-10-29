'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { formatRelativeTimestamp, truncateByLetter } from '@/lib/utils';
import { Notification } from '@/types';

interface NotificationItemProps {
    notification: Notification;
    onUpdate?: () => void;
}

export default function NotificationItem({
    notification,
    onUpdate,
}: NotificationItemProps) {
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(false);

    const { type, data, created_at } = notification;

    const stopPropagation = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    };

    const handleNotificationClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (type === 'follow' && data.follower_username) {
            router.push(`/profile/${data.follower_username}`);
        } else if (type === 'comment' && data.post_id) {
            router.push(`/post/${data.post_id}?commentId=${data.comment_id}`);
        } else if (type === 'like' && data.post_id) {
            router.push(`/post/${data.post_id}`);
        }
    };

    const handleFollowClick = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();
        if (!data.follower_id) return;

        setIsFollowing((prev) => !prev);

        try {
            await api.post(`/users/${data.follower_id}/follow`);
            if (onUpdate) onUpdate();
        } catch (error) {
            setIsFollowing((prev) => !prev);
            toast.error('Gagal mengikuti akun. Silakan coba lagi nanti.');
        }
    };

    const getDisplayData = () => {
        switch (type) {
            case 'like':
                return {
                    username: data.liker_username,
                    avatar: data.liker_profile_picture_url,
                    action: 'liker_username',
                    message: 'menyukai unggahan anda',
                    content: data.message,
                };
            case 'comment':
                return {
                    username: data.commenter_username,
                    avatar: data.commenter_profile_picture_url,
                    action: 'commenter_username',
                    message: 'mengomentari unggahan anda',
                    content: data.comment_content,
                };
            case 'follow':
                return {
                    username: data.follower_username,
                    avatar: data.follower_profile_picture_url,
                    action: 'follower_username',
                    message: 'mulai mengikuti anda',
                    content: '',
                };
            default:
                return { username: 'Unknown', avatar: null, message: '', content: '' };
        }
    };

    const display = getDisplayData();
    const username = display.username || 'User';

    return (
        <div
            className={`hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:ring-ring/50 flex w-full cursor-pointer flex-col gap-6 px-4 py-6 transition-colors focus:outline-none focus-visible:ring-2 ${notification.read_at ? '' : 'bg-primary/5'}`}
            tabIndex={0}
            onClick={handleNotificationClick}
        >
            <div className="flex items-center gap-3">
                <Link
                    href={`/profile/${username}`}
                    onClick={stopPropagation}
                    className="transition-[filter] select-none hover:brightness-80 focus:brightness-80 focus:outline-none"
                >
                    <Avatar className="size-9">
                        <AvatarImage asChild src={display.avatar || undefined}>
                            <Image
                                src={display.avatar || ''}
                                alt={`Go to ${username}'s profile`}
                                width={36}
                                height={36}
                                unoptimized
                            />
                        </AvatarImage>
                        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex flex-1 flex-col gap-2">
                    <span className="text-sm">
                        <Link
                            href={`/profile/${username}`}
                            onClick={stopPropagation}
                            className="mr-1 font-semibold hover:underline focus:underline focus:outline-none"
                        >
                            {truncateByLetter(username, 14)}
                        </Link>
                        {data.message
                            ? data.message.replace(username, '').trim().replace(/\.$/, '')
                            : display.message}
                        <span className="text-muted-foreground ml-1">
                            {formatRelativeTimestamp(created_at)}
                        </span>
                    </span>

                    {type === 'comment' && data.comment_content && (
                        <span className="text-foreground line-clamp-2 text-sm italic">
                            {data.comment_content}
                        </span>
                    )}
                </div>

                {type === 'follow' && (
                    <Button
                        onClick={handleFollowClick}
                        variant={isFollowing ? 'outline' : 'default'}
                        className="w-fit flex-shrink-0 cursor-pointer rounded-full text-sm font-semibold"
                    >
                        {isFollowing ? 'Mengikuti' : 'Ikuti balik'}
                    </Button>
                )}
            </div>
            {(type === 'like' || type === 'comment') &&
                data.location_name &&
                data.location_id && (
                    <div className="flex flex-1 justify-end">
                        <Link
                            href={`/place/${data.location_id}`}
                            onClick={stopPropagation}
                            className="text-muted-foreground text-right text-sm font-semibold hover:underline focus:underline focus:outline-none"
                        >
                            {data.location_name}
                        </Link>
                    </div>
                )}
        </div>
    );
}
