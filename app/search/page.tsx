'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Search } from 'lucide-react';
import { toast } from 'sonner';

import AccountItem from '@/components/AccountItem';
import NavigationBar from '@/components/NavigationBar';
import PlaceItem from '@/components/PlaceItem';
import PostItem from '@/components/PostItem';
import TopBar from '@/components/TopBar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/lib/axios';

const searchCache: Record<
  string,
  { results: any[]; page: number; hasMore: boolean }
> = {};

export default function SearchPage() {
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const f = searchParams.get('f') || 'top';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRestored, setIsRestored] = useState(false);

  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.5 });
  const loadedFromCache = useRef(false);
  const currentQueryRef = useRef(initialQuery);
  const currentFilterRef = useRef(f);

  const getCacheKey = (q: string, filter: string) => `${q}_${filter}`;

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (
      debouncedQuery !== currentQueryRef.current ||
      f !== currentFilterRef.current
    ) {
      setIsRestored(false);
      setResults([]);
      setPage(1);
      setHasMore(true);

      currentQueryRef.current = debouncedQuery;
      currentFilterRef.current = f;
    }
  }, [debouncedQuery, f]);

  useEffect(() => {
    setIsRestored(false);
  }, [debouncedQuery, f]);

  useEffect(() => {
    if (!loading && results.length > 0 && !isRestored) {
      if (loadedFromCache.current) {
        const cacheKey = getCacheKey(debouncedQuery, f);
        const savedPosition = sessionStorage.getItem(
          `scroll_position_search_${cacheKey}`
        );
        if (savedPosition) {
          window.scrollTo(0, parseInt(savedPosition, 10));
        }
      }
      setIsRestored(true);
    }
  }, [loading, results, debouncedQuery, f, isRestored]);

  useEffect(() => {
    const handleScroll = () => {
      const cacheKey = getCacheKey(debouncedQuery, f);
      sessionStorage.setItem(
        `scroll_position_search_${cacheKey}`,
        window.scrollY.toString()
      );
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedQuery, f]);

  const fetchData = async (
    currentPage: number,
    isLoadMore: boolean = false
  ) => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const cacheKey = getCacheKey(debouncedQuery, f);

    if (!isLoadMore) {
      if (searchCache[cacheKey]) {
        setResults(searchCache[cacheKey].results);
        setPage(searchCache[cacheKey].page);
        setHasMore(searchCache[cacheKey].hasMore);
        setLoading(false);
        loadedFromCache.current = true;
        return;
      }
    }

    loadedFromCache.current = false;
    setLoading(true);

    try {
      const encodedQ = encodeURIComponent(debouncedQuery);
      const pageParam = `&page=${currentPage}`;
      let res;

      if (f === 'top') {
        res = await api.get(
          `/posts/search?search=${encodedQ}&sort=top${pageParam}`
        );
      } else if (f === 'latest') {
        res = await api.get(
          `/posts/search?search=${encodedQ}&sort=latest${pageParam}`
        );
      } else if (f === 'media') {
        res = await api.get(
          `/posts/search?search=${encodedQ}&type=media${pageParam}`
        );
      } else if (f === 'people') {
        res = await api.get(`/users?search=${encodedQ}${pageParam}`);
      } else if (f === 'places') {
        res = await api.get(`/locations?search=${encodedQ}${pageParam}`);
      }

      let newData: any[] = [];
      let meta: { current_page: number; last_page: number } | null = null;

      if (res && res.data) {
        newData = res.data.data;
        meta = res.data.meta;
      }

      setResults((prev) => {
        const uniqueIncomingData = Array.from(
          new Map(newData.map((item: any) => [item.id, item])).values()
        );

        let updatedResults: any[];
        if (isLoadMore) {
          const existingIds = new Set(prev.map((item: any) => item.id));
          const uniqueNew = uniqueIncomingData.filter(
            (item: any) => !existingIds.has(item.id)
          );
          updatedResults = [...prev, ...uniqueNew];
        } else {
          updatedResults = uniqueIncomingData;
        }

        searchCache[cacheKey] = {
          results: updatedResults,
          page: currentPage,
          hasMore: meta ? meta.current_page < meta.last_page : false,
        };

        return updatedResults;
      });

      setHasMore(meta ? meta.current_page < meta.last_page : false);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat hasil pencarian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, false);
  }, [debouncedQuery, f]);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, true);
    }
  }, [page]);

  const handleFollow = async (
    e: React.MouseEvent<HTMLButtonElement>,
    targetUser: any
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const previousResults = [...results];
    const isFollowing = targetUser.is_followed;

    setResults((prev) =>
      prev.map((item) =>
        item.id === targetUser.id ? { ...item, is_followed: !isFollowing } : item
      )
    );

    try {
      await api.post(`/users/${targetUser.id}/follow`);
    } catch (error) {
      setResults(previousResults);
      toast.error('Gagal memproses permintaan follow.');
    }
  };

  const tabs = [
    { name: 'Populer', value: 'top' },
    { name: 'Terbaru', value: 'latest' },
    { name: 'Media', value: 'media' },
    { name: 'Orang', value: 'people' },
    { name: 'Tempat', value: 'places' },
  ];

  return (
    <>
      <TopBar className="flex w-full flex-col items-center px-4 pt-4">
        <label htmlFor="search" className="sr-only hidden">
          Cari
        </label>
        <div className="mb-4 w-full max-w-sm">
          <InputGroup className="shadow-none">
            <InputGroupAddon>
              <Search size={16} />
            </InputGroupAddon>
            <InputGroupInput
              id="search"
              placeholder="Cari"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </InputGroup>
        </div>

        <div className="no-scrollbar relative flex w-full overflow-x-scroll text-center">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`?q=${encodeURIComponent(query)}&f=${tab.value}`}
              replace
              scroll={false}
              className="hover:bg-accent focus-visible:bg-accent focus:inset-ring-ring/50 relative flex-1 py-4 text-center transition-colors focus:outline-none focus-visible:inset-ring-2"
            >
              <span
                className={`px-4 transition-colors ${f === tab.value ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
              >
                {tab.name}
              </span>
              {f === tab.value && (
                <div className="bg-primary absolute bottom-0 h-1 w-full rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </TopBar>

      {debouncedQuery === '' && (
        <div className="flex h-[calc(100dvh-200px)] w-lvw items-center justify-center">
          <div className="flex max-w-sm flex-col items-center gap-2 p-8 text-center">
            <div className="bg-muted text-foreground mb-2 flex size-10 items-center justify-center rounded-lg">
              <Search size={24} />
            </div>
            <span className="text-lg font-medium tracking-tight">
              Mulai Mencari
            </span>
            <span className="text-muted-foreground">
              Masukkan kata kunci di kolom pencarian di atas untuk menemukan
              hasil
            </span>
          </div>
        </div>
      )}

      {debouncedQuery !== '' && (
        <main className="xs:pb-[78px] flex items-center justify-center pb-[81px]">
          <div className="flex w-full max-w-xl flex-col">
            {(loading && results.length === 0) || f !== currentFilterRef.current ? (
              <div className="flex h-[calc(100dvh-200px)] w-full items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : (
              <>
                {results.length === 0 ? (
                  <span className="text-muted-foreground flex h-[calc(100dvh-200px)] w-full items-center justify-center">
                    Tidak ada hasil ditemukan
                  </span>
                ) : (
                  <div className="divide-border divide-y divide-solid">
                    {results.map((item: any) => {
                      if (f === 'people') {
                        return (
                          <AccountItem
                            key={item.id}
                            user={item}
                            onFollow={(e) => handleFollow(e, item)}
                          />
                        );
                      } else if (f === 'places') {
                        return <PlaceItem key={item.id} location={item} />;
                      } else {
                        return <PostItem key={item.id} post={item} />;
                      }
                    })}

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
      )}
      <NavigationBar />
    </>
  );
}
