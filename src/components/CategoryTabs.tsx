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
      // Keep '开源自荐' right after '全部'
      if (a[0] === '开源自荐') return -1;
      if (b[0] === '开源自荐') return 1;
      // Keep '工具自荐' right after '开源自荐'
      if (a[0] === '工具自荐') return -1;
      if (b[0] === '工具自荐') return 1;
      // Keep '网站自荐' right after '工具自荐'
      if (a[0] === '网站自荐') return -1;
      if (b[0] === '网站自荐') return 1;
      // Keep '文章自荐' right after '网站自荐'
      if (a[0] === '文章自荐') return -1;
      if (b[0] === '文章自荐') return 1;
      return b[1] - a[1];
    });

  return (
    <div className="w-full md:w-auto">
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
                'bg-blue-100 text-blue-800 hover:bg-blue-200': category === '开源自荐' && activeCategory !== category,
                'bg-green-100 text-green-800 hover:bg-green-200': category === '工具自荐' && activeCategory !== category,
                'bg-purple-100 text-purple-800 hover:bg-purple-200': category === '网站自荐' && activeCategory !== category,
                'bg-amber-100 text-amber-800 hover:bg-amber-200': category === '文章自荐' && activeCategory !== category,
                'bg-gray-200 text-gray-800 hover:bg-gray-300': activeCategory !== category && 
                  category !== '开源自荐' && 
                  category !== '工具自荐' && 
                  category !== '网站自荐' &&
                  category !== '文章自荐',
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