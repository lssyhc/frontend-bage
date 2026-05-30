'use client';

import { use, useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import AccountItem from '@/components/AccountItem';
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/lib/axios';
import { User } from '@/types';

export default function FollowersPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const username = decodeURIComponent(resolvedParams.username);
    const cleanUsername = username.startsWith('%40')
        ? username.slice(3)
        : username.replace('@', '');

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [ref, isIntersecting] = useIntersectionObserver({
        threshold: 0.5,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await api.get(`/users/${cleanUsername}`);
                setUserId(userRes.data.data.id);
            } catch {
                toast.error('Gagal memuat profil pengguna.');
                setLoading(false);
            }
        };
        fetchUser();
    }, [cleanUsername]);

    const fetchData = useCallback(async (currentPage: number, isLoadMore: boolean = false) => {
        if (!userId) return;

        if (!isLoadMore) {
            setLoading(true);
        }

        try {
            const response = await api.get(
                `/users/${userId}/followers?page=${currentPage}`
            );
            const newUsers = response.data.data;
            const meta = response.data.meta;

            setUsers((prev) => {
                const uniqueIncoming = Array.from(
                    new Map(newUsers.map((u: User) => [u.id, u])).values()
                ) as User[];

                if (isLoadMore) {
                    const existingIds = new Set(prev.map((u) => u.id));
                    const uniqueNew = uniqueIncoming.filter((u) => !existingIds.has(u.id));
                    return [...prev, ...uniqueNew];
                }
                return uniqueIncoming;
            });

            setHasMore(meta ? meta.current_page < meta.last_page : false);
        } catch {
            toast.error('Gagal memuat daftar pengikut.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchData(1);
        }
    }, [userId, fetchData]);

    useEffect(() => {
        if (isIntersecting && hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    }, [isIntersecting, hasMore, loading]);

    useEffect(() => {
        if (page > 1) {
            fetchData(page, true);
        }
    }, [page, fetchData]);

    const handleFollowClick = async (
        e: React.MouseEvent<HTMLButtonElement>,
        targetUser: User
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const previousUsers = [...users];
        const isFollowing = targetUser.is_followed;

        setUsers((prev) =>
            prev.map((u) =>
                u.id === targetUser.id ? { ...u, is_followed: !isFollowing } : u
            )
        );

        try {
            const response = await api.post(`/users/${targetUser.id}/follow`);
            const isFollowing = Boolean(response.data.data.is_following);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === targetUser.id ? { ...u, is_followed: isFollowing } : u
                )
            );
        } catch {
            setUsers(previousUsers);
            toast.error('Gagal memproses permintaan follow.');
        }
    };

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
                Pengikut
            </TopBar>

            <main className="flex items-center justify-center">
                <div className="flex w-full max-w-xl flex-col">
                    {loading && users.length === 0 ? (
                        <div className="flex h-[calc(100dvh-150px)] w-full items-center justify-center">
                            <Spinner className="size-8" />
                        </div>
                    ) : (
                        <>
                            {users.length === 0 && !loading ? (
                                <div className="text-muted-foreground flex h-[calc(100dvh-150px)] w-full items-center justify-center">
                                    Daftar pengguna kosong
                                </div>
                            ) : (
                                <div className="divide-border divide-y divide-solid">
                                    {users.map((user) => (
                                        <AccountItem
                                            key={user.id}
                                            user={user}
                                            onFollow={(e) => handleFollowClick(e, user)}
                                        />
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
        </>
    );
}
