'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface TagFilterProps {
  tags: string[];
  activeTag?: string;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = activeTag || '';

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    if (tag === selectedTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-gray-600 font-medium">筛选：</span>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            selectedTag === tag
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
      {selectedTag && (
        <button
          onClick={clearFilter}
          className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
