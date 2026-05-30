'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import NavigationBar from '@/components/NavigationBar';
import NotificationItem from '@/components/NotificationItem';
import TopBar from '@/components/TopBar';
import { Spinner } from '@/components/ui/spinner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/lib/axios';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
  });

  const fetchNotifications = async (
    currentPage: number,
    isLoadMore: boolean = false
  ) => {
    if (!isLoadMore) {
      setLoading(true);
    }

    try {
      const response = await api.get(`/notifications?page=${currentPage}`);
      const newNotifications = response.data.data;
      const meta = response.data.meta;

      setNotifications((prev) => {
        const uniqueIncoming = Array.from(
          new Map(
            newNotifications.map((n: Notification) => [n.id, n])
          ).values()
        ) as Notification[];

        if (isLoadMore) {
          const existingIds = new Set(prev.map((n) => n.id));
          const uniqueNew = uniqueIncoming.filter((n) => !existingIds.has(n.id));
          return [...prev, ...uniqueNew];
        }
        return uniqueIncoming;
      });

      setHasMore(meta ? meta.current_page < meta.last_page : false);
    } catch {
      toast.error('Gagal memuat notifikasi. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchNotifications(page, true);
    }
  }, [page]);

  return (
    <>
      <TopBar className="w-full p-4 py-5 text-xl font-semibold tracking-tight">
        Notifikasi
      </TopBar>
      <main className="xs:pb-[78px] flex flex-col items-center pb-[81px]">
        <div className="flex w-full max-w-xl flex-col">
          {loading && notifications.length === 0 ? (
            <div className="flex h-[calc(100vh-150px)] w-full items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : (
            <>
              {notifications.length === 0 && !loading ? (
                <div className="text-muted-foreground flex h-[calc(100vh-150px)] items-center justify-center p-8 text-center">
                  Belum ada notifikasi
                </div>
              ) : (
                <div className="divide-border divide-y divide-solid">
                  {notifications
                    .filter((notification, index, self) => {
                      if (
                        notification.type === 'follow' &&
                        notification.data.follower_id
                      ) {
                        return (
                          index ===
                          self.findIndex(
                            (t) =>
                              t.type === 'follow' &&
                              t.data.follower_id === notification.data.follower_id
                          )
                        );
                      }
                      return true;
                    })
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onUpdate={() => fetchNotifications(1, false)}
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
      <NavigationBar />
    </>
  );
}
