import React from 'react';
import { Issue } from '../types';
import classNames from 'classnames';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  // Format date to locale string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Truncate body to a preview
  const getBodyPreview = (body: string) => {
    if (!body) return '';

    // Remove markdown and limit to ~120 characters
    const plainText = body
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Replace links with just text
      .replace(/#+\s(.*)/g, '$1') // Remove headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return plainText.length > 120
      ? plainText.substring(0, 120) + '...'
      : plainText;
  };

  // Determine the appropriate tool badge text
  const getToolBadgeText = () => {
    if (issue.title.includes('工具自荐')) {
      return '工具自荐';
    } else if (issue.title.includes('工具推荐')) {
      return '工具推荐';
    }
    return '工具自荐'; // Default fallback
  };

  // Determine the appropriate article badge text
  const getArticleBadgeText = () => {
    if (issue.title.includes('文章自荐')) {
      return '文章自荐';
    } else if (issue.title.includes('文章推荐')) {
      return '文章推荐';
    }
    return '文章自荐'; // Default fallback
  };

  return (
    <div className={classNames(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border",
      {
        "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20": issue.is_open_source_recommendation,
        "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20": issue.is_tool_recommendation && !issue.is_open_source_recommendation,
        "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20": issue.is_website_recommendation && !issue.is_open_source_recommendation && !issue.is_tool_recommendation,
        "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20": issue.is_article_recommendation && !issue.is_open_source_recommendation && !issue.is_tool_recommendation && !issue.is_website_recommendation,
        "border-gray-200 dark:border-gray-700": !issue.is_open_source_recommendation && !issue.is_tool_recommendation && !issue.is_website_recommendation && !issue.is_article_recommendation
      }
    )}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              #{issue.number} {issue.title}
            </a>
          </h3>
        </div>

        <div className="flex items-center mb-3">
          <img
            src={issue.user.avatar_url}
            alt={issue.user.login}
            className="w-6 h-6 rounded-full mr-2"
          />
          <a
            href={issue.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {issue.user.login}
          </a>
          <span className="mx-2 text-gray-400 dark:text-gray-500">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(issue.created_at)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {issue.is_open_source_recommendation && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              开源自荐
            </span>
          )}
          {issue.is_tool_recommendation && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
            >
              {getToolBadgeText()}
            </span>
          )}
          {issue.is_website_recommendation && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
            >
              网站自荐
            </span>
          )}
          {issue.is_article_recommendation && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            >
              {getArticleBadgeText()}
            </span>
          )}
          {issue.labels.length > 0 &&
            issue.labels.map(label => (
              <span
                key={label.id}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}40`
                }}
              >
                {label.name}
              </span>
            ))
          }
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
          {getBodyPreview(issue.body)}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>{issue.comments} 评论</span>
          </div>
          <div>
            更新于 {formatDate(issue.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;