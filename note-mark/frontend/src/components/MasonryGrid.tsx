import Link from 'next/link';
import React from 'react';
import type { My903ListItem } from '@/types/my903';

interface MasonryCardProps {
  song: My903ListItem;
  index: number;
  isOffset: boolean;
}

function fixImageUrl(url: string): string {
  return url.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
}

export function MasonryCard({ song, index, isOffset }: MasonryCardProps) {
  const coverUrl = song.cover ? fixImageUrl(song.cover) : '';

  return (
    <Link href={`/song/${song.article_id}`} style={{ marginTop: isOffset ? '200px' : '0' }}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song.title}
              loading="lazy"
              className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
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

interface MasonryGridProps {
  songs: My903ListItem[];
}

export function MasonryGrid({ songs }: MasonryGridProps) {
  const distributeToColumns = (cols: number) => {
    const columnsData: { song: My903ListItem; index: number; isOffset: boolean; }[][] = Array.from({ length: cols }, () => []);
    songs.forEach((song, index) => {
      const columnIndex = index % cols;
      const isOffset = cols > 1 && index === 1;
      columnsData[columnIndex].push({ song, index, isOffset });
    });
    return columnsData;
  };

  return (
    <>
      <div className="md:hidden">
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {songs.map((song, index) => (
            <MasonryCard key={`song-${index}`} song={song} index={index} isOffset={false} />
          ))}
        </div>
      </div>

      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-6">
          {distributeToColumns(2).map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-6">
              {column.map(({ song, index, isOffset }) => (
                <MasonryCard key={`song-${index}`} song={song} index={index} isOffset={isOffset} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block xl:hidden">
        <div className="grid grid-cols-3 gap-6">
          {distributeToColumns(3).map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-6">
              {column.map(({ song, index, isOffset }) => (
                <MasonryCard key={`song-${index}`} song={song} index={index} isOffset={isOffset} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="grid grid-cols-4 gap-6">
          {distributeToColumns(4).map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-6">
              {column.map(({ song, index, isOffset }) => (
                <MasonryCard key={`song-${index}`} song={song} index={index} isOffset={isOffset} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
