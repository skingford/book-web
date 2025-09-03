'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchSuggestion {
  id: string;
  title: string;
  url: string;
  type: 'bookmark' | 'category';
  category?: string;
}

interface HomeSearchProps {
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  onSearch?: (query: string) => void;
  className?: string;
}

const HomeSearch: React.FC<HomeSearchProps> = ({
  suggestions = [],
  recentSearches = [],
  popularSearches = ['开发工具', '设计资源', '学习资料', '娱乐'],
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 处理搜索建议
  const filteredSuggestions = useMemo(() => {
    if (query.trim()) {
      return suggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.url.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
    }
    return [];
  }, [query, suggestions]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理搜索
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsOpen(false);
      setQuery('');
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'bookmark') {
      window.open(suggestion.url, '_blank');
    } else {
      handleSearch(suggestion.title);
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* 搜索框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索书签、分类或网站..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 搜索下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 z-50 max-h-80 sm:max-h-96 overflow-hidden">
          {/* 搜索建议 */}
          {filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                搜索建议
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-2 sm:px-3 py-2 sm:py-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                      {suggestion.type === 'bookmark' ? suggestion.url : `分类: ${suggestion.category}`}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {suggestion.type === 'bookmark' ? '访问' : '搜索'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 最近搜索 */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                最近搜索
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center px-2 sm:px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 sm:mr-3" />
                  <span className="text-xs sm:text-sm truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* 热门搜索 */}
          {!query && popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                热门搜索
              </div>
              <div className="px-2 sm:px-3 py-2">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {query && filteredSuggestions.length === 0 && (
            <div className="p-6 sm:p-8 text-center">
              <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <div className="text-sm sm:text-base text-gray-500 mb-2">未找到相关结果</div>
              <button
                onClick={() => handleSearch(query)}
                className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
              >
                搜索 "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;