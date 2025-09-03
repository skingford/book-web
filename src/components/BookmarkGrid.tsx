'use client';

import React, { useState, useMemo } from 'react';
import BookmarkCard from './BookmarkCard';
import { Grid3X3, List, Filter, Search } from 'lucide-react';

interface Bookmark {
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
  created_at: string;
  is_favorite?: boolean;
}

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'title' | 'category';

const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  title = '我的书签',
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  onFavoriteToggle,
  onEdit,
  onDelete,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 获取所有分类
  const categories = useMemo(() => {
    const categoryMap = new Map();
    bookmarks.forEach(bookmark => {
      if (bookmark.category) {
        categoryMap.set(bookmark.category.id, bookmark.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [bookmarks]);

  // 过滤和排序书签
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        bookmark.category?.name.toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (selectedCategory) {
      filtered = filtered.filter(bookmark => bookmark.category?.id === selectedCategory);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [bookmarks, searchQuery, selectedCategory, sortBy]);

  return (
    <div className={`w-full ${className}`}>
      {/* 标题和控制栏 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">
              共 {filteredAndSortedBookmarks.length} 个书签
            </p>
          </div>
          
          {/* 视图切换 */}
          {showViewToggle && (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 搜索和过滤器 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索书签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          )}

          {/* 过滤器 */}
          {showFilters && (
            <div className="flex items-center space-x-3">
              {/* 分类过滤 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">所有分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* 排序 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="recent">最近添加</option>
                <option value="title">按标题</option>
                <option value="category">按分类</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 书签网格/列表 */}
      {filteredAndSortedBookmarks.length > 0 ? (
        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }`}>
          {filteredAndSortedBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              description={bookmark.description}
              favicon={bookmark.favicon}
              category={bookmark.category}
              tags={bookmark.tags}
              createdAt={bookmark.created_at}
              isFavorite={bookmark.is_favorite}
              onFavoriteToggle={onFavoriteToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory ? '未找到匹配的书签' : '暂无书签'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory 
              ? '尝试调整搜索条件或过滤器'
              : '开始添加您的第一个书签吧'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;