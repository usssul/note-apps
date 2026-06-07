'use client';

import Link from 'next/link';
import { use, useEffect, useState, useCallback } from 'react';
import { getMy903List, getStatistics } from '@/lib/api';
import { TagFilter } from '@/components/TagFilter';
import { VirtualList } from '@/components/VirtualList';

const TAGS = ['派台歌', '新歌', '热播'];

interface PageProps {
  searchParams: Promise<{
    tag?: string;
  }>;
}

export default function HomePage({ searchParams }: PageProps) {
  const params = use(searchParams);
  const tag = params.tag;
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadAllData = useCallback(async () => {
    setAllSongs([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(true);
    try {
      const [stat, firstPage] = await Promise.all([
        getStatistics(),
        getMy903List({ page: 1, limit: 1000, tag }),
      ]);
      
      const seen = new Set<number>();
      const uniqueSongs: any[] = [];
      
      const processSongs = (songs: any[]) => {
        for (const song of songs) {
          if (!seen.has(song.article_id)) {
            seen.add(song.article_id);
            uniqueSongs.push(song);
          }
        }
      };
      
      processSongs(firstPage.list);
      setTotal(stat);
      
      const currentPageNum = 1;
      const totalPages = firstPage.totalPages;
      
      if (currentPageNum < totalPages) {
        const promises = [];
        for (let i = 2; i <= Math.min(totalPages, 100); i++) {
          promises.push(getMy903List({ page: i, limit: 1000, tag }));
        }
        
        const results = await Promise.all(promises);
        for (const result of results) {
          processSongs(result.list);
        }
      }
      
      setAllSongs(uniqueSongs);
      setHasMore(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tag]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-purple-600">
                My903 派台歌
              </h1>
            </Link>
            <div className="text-sm text-gray-500">
              共收录 <span className="font-bold text-purple-600">{total}</span> 首歌曲
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <TagFilter tags={TAGS} activeTag={tag} />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : allSongs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无数据</p>
          </div>
        ) : (
          <VirtualList songs={allSongs} />
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>数据来源：my903.com | 仅供学习交流使用</p>
        </div>
      </footer>
    </main>
  );
}
