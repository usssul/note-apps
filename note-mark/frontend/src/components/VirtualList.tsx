import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { My903ListItem } from '@/types/my903';

function fixImageUrl(url: string): string {
  return url.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
}

interface VirtualSongCardProps {
  song: My903ListItem;
}

function VirtualSongCard({ song }: VirtualSongCardProps) {
  const coverUrl = song.cover ? fixImageUrl(song.cover) : '';

  return (
    <Link href={`/song/${song.article_id}`}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full">
        <div className="relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song.title}
              loading="lazy"
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {song.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
            {song.title}
          </h3>
          
          <p className="text-sm text-gray-500 mt-1 truncate">
            {song.create_date}
          </p>
        </div>
      </article>
    </Link>
  );
}

interface VirtualListProps {
  songs: My903ListItem[];
}

export function VirtualList({ songs }: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const getColumnConfig = () => {
    if (typeof window === 'undefined') return { cols: 4, gap: 24 };
    const width = window.innerWidth;
    if (width < 768) return { cols: 1, gap: 24 };
    if (width < 1024) return { cols: 2, gap: 24 };
    if (width < 1280) return { cols: 3, gap: 24 };
    return { cols: 4, gap: 24 };
  };

  const [columnConfig, setColumnConfig] = useState(getColumnConfig);

  useEffect(() => {
    const handleResize = () => setColumnConfig(getColumnConfig());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { cols, gap } = columnConfig;
  const itemHeight = 380;
  const rowHeight = itemHeight;
  const totalRows = Math.ceil(songs.length / cols);
  const totalHeight = totalRows * rowHeight + (totalRows - 1) * gap;

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const buffer = 5;
    const startRow = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - buffer);
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + clientHeight) / (rowHeight + gap) + buffer));
    setVisibleRange({
      start: startRow * cols,
      end: endRow * cols
    });
  }, [cols, rowHeight, gap, totalRows]);

  useEffect(() => {
    updateVisibleRange();
  }, [updateVisibleRange]);

  const visibleSongs = useMemo(() => {
    return songs.slice(visibleRange.start, Math.min(visibleRange.end + cols * 10, songs.length));
  }, [songs, visibleRange, cols]);

  const renderRow = (song: My903ListItem, index: number) => {
    const actualIndex = visibleRange.start + index;
    const row = Math.floor(actualIndex / cols);
    const col = actualIndex % cols;
    const top = row * (rowHeight + gap);
    const left = col * (100 / cols) + '%';
    const width = 100 / cols + '%';

    return (
      <div
        key={song.article_id}
        style={{
          position: 'absolute',
          top,
          left,
          width,
          height: rowHeight,
          padding: `0 ${gap / 2}px`
        }}
        className="box-border"
      >
        <VirtualSongCard song={song} />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onScroll={updateVisibleRange}
      className="w-full h-[calc(100vh-280px)] overflow-y-auto"
      style={{ position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleSongs.map((song, index) => renderRow(song, index))}
      </div>
    </div>
  );
}
