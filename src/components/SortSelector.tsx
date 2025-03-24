import React from 'react';
import { SortOption } from '../types';

interface SortSelectorProps {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({ sortOption, setSortOption }) => {
  const options: { value: SortOption; label: string }[] = [
    { value: 'newest', label: '最新创建' },
    { value: 'oldest', label: '最早创建' },
    { value: 'most-commented', label: '评论最多' },
    { value: 'recently-updated', label: '最近更新' },
  ];

  return (
    <div className="w-full md:w-auto">
      <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        排序方式
      </label>
      <select
        id="sort-select"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
        style={{ borderWidth: '1px' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelector; 