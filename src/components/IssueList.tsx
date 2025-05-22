import React from 'react';
import { Issue } from '../types';
import IssueCard from './IssueCard';

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">没有找到符合条件的 Issue</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="sr-only">Issue 列表</h2>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        共找到 <span className="font-semibold">{issues.length}</span> 个符合条件的 Issue
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default IssueList;