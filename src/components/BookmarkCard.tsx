'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, Tag, Star, MoreHorizontal } from 'lucide-react';

interface BookmarkCardProps {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  favicon?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  tags?: string[];
  createdAt: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  id,
  title,
  url,
  description,
  favicon,
  category,
  tags = [],
  createdAt,
  isFavorite = false,
  onFavoriteToggle,
  onEdit,
  onDelete,
  className = ''
}) => {
  // 获取网站图标
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '/default-favicon.png';
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 截取描述文本
  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 relative ${className}`}>
      {/* 收藏按钮 */}
      {onFavoriteToggle && (
        <button
          onClick={() => onFavoriteToggle(id)}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
            isFavorite 
              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* 网站图标和标题 */}
      <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          <img
            src={favicon || getFaviconUrl(url)}
            alt={`${title} favicon`}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg border border-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-favicon.png';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2">
              {truncateDescription(description, 60)}
            </p>
          )}
        </div>
      </div>

      {/* 分类和标签 */}
      <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
        {category && (
          <span 
            className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: category.color ? `${category.color}20` : '#F3F4F6',
              color: category.color || '#6B7280'
            }}
          >
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            <span className="truncate max-w-20 sm:max-w-none">{category.name}</span>
          </span>
        )}
        {tags.slice(0, 1).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 truncate max-w-16 sm:max-w-none"
          >
            {tag}
          </span>
        ))}
        {tags.length > 1 && (
          <span className="text-xs text-gray-500">+{tags.length - 1}</span>
        )}
      </div>

      {/* 底部操作区 */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded-md sm:rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            访问
          </a>
          <div className="flex items-center text-xs text-gray-500 truncate">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(createdAt)}</span>
          </div>
        </div>
        
        {/* 更多操作 */}
        {(onEdit || onDelete) && (
          <div className="relative group/menu">
            <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
              {onEdit && (
                <button
                  onClick={() => onEdit(id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  编辑
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkCard;