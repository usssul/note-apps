'use client';

import { useCallback, useEffect, useState } from 'react';

type LayoutType = 'grid' | 'masonry';

interface LayoutToggleProps {
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(layout);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('my903-layout');
      if (saved === 'grid' || saved === 'masonry') {
        setSelectedLayout(saved);
        onLayoutChange(saved);
      }
    } catch {
      // ignore
    }
  }, [onLayoutChange]);

  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setSelectedLayout(newLayout);
    onLayoutChange(newLayout);
    try {
      localStorage.setItem('my903-layout', newLayout);
    } catch {
      // ignore
    }
  }, [onLayoutChange]);

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleLayoutChange('grid')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          selectedLayout === 'grid'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        网格
      </button>
      <button
        onClick={() => handleLayoutChange('masonry')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          selectedLayout === 'masonry'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="10" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="15" width="7" height="6" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
        </svg>
        瀑布流
      </button>
    </div>
  );
}
