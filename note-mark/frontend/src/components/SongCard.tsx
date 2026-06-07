import Link from 'next/link';
import type { My903ListItem } from '@/types/my903';

interface SongCardProps {
  song: My903ListItem;
}

function fixImageUrl(url: string): string {
  return url.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
}

export function SongCard({ song }: SongCardProps) {
  const coverUrl = song.cover ? fixImageUrl(song.cover) : '';

  return (
    <Link href={`/song/${song.article_id}`}>
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="aspect-square relative overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {song.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-purple-600 transition-colors">
            {song.title}
          </h3>
          
          <p className="text-sm text-gray-500 mt-2">
            {song.create_date}
          </p>
        </div>
      </article>
    </Link>
  );
}
