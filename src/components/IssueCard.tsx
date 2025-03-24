import React from 'react';
import { Issue } from '../types';

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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
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
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {issue.user.login}
          </a>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(issue.created_at)}
          </span>
        </div>
        
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {issue.labels.map(label => (
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
            ))}
          </div>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {getBodyPreview(issue.body)}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
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