import React from 'react';
import classNames from 'classnames';
import { CategoryMap } from '../types';

interface CategoryTabsProps {
  categories: CategoryMap;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  // Sort categories by count (descending)
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => {
      // Keep '全部' at the beginning
      if (a[0] === '全部') return -1;
      if (b[0] === '全部') return 1;
      return b[1] - a[1];
    });

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">分类筛选</h2>
      <div className="flex flex-wrap gap-2">
        {sortedCategories.map(([category, count]) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={classNames(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              {
                'bg-blue-600 text-white': activeCategory === category,
                'bg-gray-200 text-gray-800 hover:bg-gray-300': activeCategory !== category,
              }
            )}
          >
            {category} ({count})
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs; 