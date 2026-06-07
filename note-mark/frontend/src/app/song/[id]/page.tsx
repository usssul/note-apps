import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMy903Detail } from '@/lib/api';
import { BackButton } from '@/components/BackButton';

function fixImageUrl(url: string): string {
  return url.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const song = await getMy903Detail(parseInt(id, 10));
    if (song) {
      return {
        title: `${song.title} - ${song.singer_list.join(' / ')} | My903`,
        description: song.description,
      };
    }
  } catch {
  }
  return {
    title: '歌曲详情 - My903',
  };
}

export default async function SongDetailPage({ params }: PageProps) {
  const { id } = await params;
  const song = await getMy903Detail(parseInt(id, 10));

  if (!song) {
    notFound();
  }

  const coverUrl = song.cover ? fixImageUrl(song.cover) : '';
  const singers = song.singer_list.join(' / ');
  const composers = song.composer_list.join(' / ');
  const arrangers = song.arranger_list.join(' / ');
  const lyricists = song.lyricist_list.join(' / ');
  const producers = song.producer_list.join(' / ');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton href="/" />
            <h1 className="text-xl font-bold text-purple-600">
              歌曲详情
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={song.title}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">
                    {song.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="md:w-2/3 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {song.title}
              </h2>

              <div className="space-y-3">
                {singers && (
                  <div className="flex">
                    <span className="w-20 text-gray-500 shrink-0">歌手</span>
                    <span className="text-gray-900 font-medium">{singers}</span>
                  </div>
                )}
                {composers && (
                  <div className="flex">
                    <span className="w-20 text-gray-500 shrink-0">作曲</span>
                    <span className="text-gray-900">{composers}</span>
                  </div>
                )}
                {lyricists && (
                  <div className="flex">
                    <span className="w-20 text-gray-500 shrink-0">填词</span>
                    <span className="text-gray-900">{lyricists}</span>
                  </div>
                )}
                {arrangers && (
                  <div className="flex">
                    <span className="w-20 text-gray-500 shrink-0">编曲</span>
                    <span className="text-gray-900">{arrangers}</span>
                  </div>
                )}
                {producers && (
                  <div className="flex">
                    <span className="w-20 text-gray-500 shrink-0">监制</span>
                    <span className="text-gray-900">{producers}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {song.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  发布日期：{song.create_date}
                </p>
              </div>
            </div>
          </div>

          {song.description && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">歌曲简介</h3>
              <div
                className="prose max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: song.description }}
              />
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>数据来源：my903.com | 仅供学习交流使用</p>
        </div>
      </footer>
    </main>
  );
}
