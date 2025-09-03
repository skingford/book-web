'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ExternalLink, 
  Tag, 
  Folder, 
  BookOpen, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Filter,
  X,
  Calendar,
  Star,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Bookmark, Category } from '@/types/database'

interface BookmarkWithCategory extends Bookmark {
  categories: Category
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BookmarkWithCategory[]>([])
  const [allBookmarks, setAllBookmarks] = useState<BookmarkWithCategory[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  
  // 热门搜索关键词
  const popularSearches = ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Tailwind', 'Supabase']

  // 加载所有收藏和分类
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // 立即显示页面，同时加载搜索历史
        const savedHistory = localStorage.getItem('searchHistory')
        if (savedHistory) {
          setSearchHistory(JSON.parse(savedHistory))
        }
        setIsLoading(false) // 立即显示页面
        
        // 并行加载收藏和分类数据以提高速度
        const [bookmarksResult, categoriesResult] = await Promise.all([
          supabase
            .from('bookmarks')
            .select(`
              *,
              categories (
                id,
                name,
                description
              )
            `)
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('*')
            .order('name')
        ])
        
        if (bookmarksResult.error) {
          console.error('Error loading bookmarks:', bookmarksResult.error)
        } else {
          setAllBookmarks(bookmarksResult.data || [])
        }
        
        if (categoriesResult.error) {
          console.error('Error loading categories:', categoriesResult.error)
        } else {
          setAllCategories(categoriesResult.data || [])
        }
        
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    
    loadData()
  }, [])

  // 搜索功能
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setShowSearchSuggestions(false)
      return
    }

    setIsSearching(true)
    setShowSearchSuggestions(false)
    
    const searchTimeout = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim()
      
      let results = allBookmarks.filter(bookmark => {
        // 分类过滤
        if (selectedCategory && bookmark.categories.id !== selectedCategory) {
          return false
        }
        
        // 搜索标题
        if (bookmark.title.toLowerCase().includes(query)) {
          return true
        }
        
        // 搜索描述
        if (bookmark.description && bookmark.description.toLowerCase().includes(query)) {
          return true
        }
        
        // 搜索URL
        if (bookmark.url.toLowerCase().includes(query)) {
          return true
        }
        
        // 搜索标签
        if (bookmark.tags && bookmark.tags.some(tag => 
          tag.toLowerCase().includes(query)
        )) {
          return true
        }
        
        // 搜索分类名称
        if (bookmark.categories && bookmark.categories.name.toLowerCase().includes(query)) {
          return true
        }
        
        return false
      })
      
      // 排序
      results = results.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case 'title':
            return a.title.localeCompare(b.title)
          case 'relevance':
          default:
            // 简单的相关性排序：标题匹配优先
            const aInTitle = a.title.toLowerCase().includes(query) ? 1 : 0
            const bInTitle = b.title.toLowerCase().includes(query) ? 1 : 0
            return bInTitle - aInTitle
        }
      })
      
      setSearchResults(results)
      setIsSearching(false)
      
      // 保存搜索历史
      if (query.length > 1) {
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
        setSearchHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      }
    }, 300) // 防抖延迟

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, allBookmarks, selectedCategory, sortBy, searchHistory])

  // 处理搜索建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSearchSuggestions(false)
  }
  
  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }
  
  // 处理搜索框焦点
  const handleSearchFocus = () => {
    if (!searchQuery.trim() && (searchHistory.length > 0 || popularSearches.length > 0)) {
      setShowSearchSuggestions(true)
    }
  }
  
  // 处理搜索框失焦
  const handleSearchBlur = () => {
    // 延迟隐藏，允许点击建议
    setTimeout(() => setShowSearchSuggestions(false), 200)
  }

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // 移除阻塞页面显示的加载状态检查，让页面立即显示

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-slide-in">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl mb-6 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-xl"></div>
            <Search className="relative w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 tracking-tight">
            智能搜索
          </h1>
          <div className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            在 <span className="font-semibold text-primary">
              {allBookmarks.length > 0 ? allBookmarks.length : (
                <span className="inline-flex items-center gap-1">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary inline-block"></span>
                  加载中
                </span>
              )}
            </span> 个精选收藏中发现您需要的内容
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>实时搜索</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span>智能过滤</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <span>历史记录</span>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-6 lg:mb-8 animate-fade-in">
          <div className="card glass p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* 主搜索框 */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none z-10">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full pl-12 sm:pl-16 pr-20 sm:pr-24 py-4 sm:py-6 bg-gradient-to-r from-background/80 to-background/60 border-2 border-border/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/60 transition-all duration-300 text-lg sm:text-xl placeholder:text-muted-foreground/60 shadow-inner"
                placeholder="搜索您的收藏库..."
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 sm:pr-6 flex items-center gap-2 sm:gap-3">
                {isSearching && (
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 sm:border-3 border-primary/30 border-t-primary"></div>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-muted/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${showFilters ? 'bg-primary/20 text-primary' : 'hover:bg-muted/20 text-muted-foreground'}`}
                >
                  <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            {/* 搜索建议下拉 */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                {searchHistory.length > 0 && (
                  <div className="p-4 border-b border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        搜索历史
                      </h4>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        清除
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 6).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-3 py-1.5 text-sm bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    热门搜索
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 高级过滤选项 */}
            {showFilters && (
              <div className="border-t border-border/30 pt-4 sm:pt-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  {/* 分类过滤 */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">分类筛选</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="">全部分类</option>
                      {allCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 排序方式 */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">排序方式</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'title')}
                      className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="relevance">相关性</option>
                      <option value="date">创建时间</option>
                      <option value="title">标题</option>
                    </select>
                  </div>
                  
                  {/* 视图模式 */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">视图模式</label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background/50 hover:bg-muted/30'}`}
                      >
                        <List className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background/50 hover:bg-muted/30'}`}
                      >
                        <Grid3X3 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 快速过滤标签 */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground hidden sm:inline">快速过滤：</span>
                  <button className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 sm:px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">标题匹配</span>
                    <span className="sm:hidden">标题</span>
                  </button>
                  <button className="inline-flex items-center text-xs bg-secondary/10 text-secondary px-2 sm:px-3 py-1.5 rounded-full hover:bg-secondary/20 transition-colors">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">链接匹配</span>
                    <span className="sm:hidden">链接</span>
                  </button>
                  <button className="inline-flex items-center text-xs bg-accent/10 text-accent px-2 sm:px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors">
                    <Tag className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">标签匹配</span>
                    <span className="sm:hidden">标签</span>
                  </button>
                  <button className="inline-flex items-center text-xs bg-muted/20 text-muted-foreground px-2 sm:px-3 py-1.5 rounded-full hover:bg-muted/30 transition-colors">
                    <Folder className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">分类匹配</span>
                    <span className="sm:hidden">分类</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 搜索结果 */}
        {searchQuery.trim() && (
          <div className="animate-fade-in">
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {/* 结果统计和操作栏 */}
                <div className="space-y-4">
                  {/* 主要统计信息 */}
                  <div className="card glass p-4 sm:p-6 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:gap-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                              找到 <span className="text-primary">{searchResults.length}</span> 个结果
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              搜索关键词: <span className="font-medium text-foreground">"{searchQuery}"</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* 快速统计 */}
                        <div className="flex sm:hidden lg:flex items-center gap-4 sm:gap-6">
                          <div className="text-center">
                            <div className="text-base sm:text-lg font-bold text-primary">
                              {searchResults.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).length}
                            </div>
                            <div className="text-xs text-muted-foreground">标题匹配</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base sm:text-lg font-bold text-secondary">
                              {searchResults.filter(b => b.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))).length}
                            </div>
                            <div className="text-xs text-muted-foreground">标签匹配</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base sm:text-lg font-bold text-accent">
                              {new Set(searchResults.map(b => b.categories.id)).size}
                            </div>
                            <div className="text-xs text-muted-foreground">涉及分类</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 视图切换和排序 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground hidden sm:inline">视图:</span>
                          <div className="flex bg-background/50 rounded-lg p-1 border border-border">
                            <button
                              onClick={() => setViewMode('list')}
                              className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                                viewMode === 'list'
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                              }`}
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setViewMode('grid')}
                              className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                                viewMode === 'grid'
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                              }`}
                            >
                              <Grid3X3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground hidden sm:inline">排序:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'title')}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-background/80 transition-colors"
                          >
                            <option value="relevance">相关性</option>
                            <option value="date">创建时间</option>
                            <option value="title">标题排序</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 详细统计卡片 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card glass p-4 text-center hover:shadow-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {searchResults.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).length}
                      </div>
                      <div className="text-xs text-muted-foreground">标题匹配</div>
                    </div>
                    
                    <div className="card glass p-4 text-center hover:shadow-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Tag className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {searchResults.filter(b => b.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))).length}
                      </div>
                      <div className="text-xs text-muted-foreground">标签匹配</div>
                    </div>
                    
                    <div className="card glass p-4 text-center hover:shadow-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Folder className="w-5 h-5 text-accent" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {new Set(searchResults.map(b => b.categories.id)).size}
                      </div>
                      <div className="text-xs text-muted-foreground">涉及分类</div>
                    </div>
                    
                    <div className="card glass p-4 text-center hover:shadow-lg transition-all duration-200">
                      <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {Math.round((searchResults.length / allBookmarks.length) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">匹配率</div>
                    </div>
                  </div>
                </div>
                
                {/* 搜索结果列表/网格 */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {searchResults.map((bookmark, index) => (
                    <div key={bookmark.id} className={`card glass backdrop-blur-sm hover:shadow-xl transition-all duration-300 group ${viewMode === 'grid' ? 'p-6' : 'p-6'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                      {viewMode === 'list' ? (
                        /* 列表视图 */
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  <Link
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {highlightText(bookmark.title, searchQuery)}
                                  </Link>
                                </h3>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className="hidden sm:inline">{new Date(bookmark.created_at).toLocaleDateString()}</span>
                                    <span className="sm:hidden">{new Date(bookmark.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Folder className="w-3 h-3" />
                                    <span className="truncate">{highlightText(bookmark.category?.name || '未分类', searchQuery)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {bookmark.description && (
                              <p className="text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-2">
                                {highlightText(bookmark.description, searchQuery)}
                              </p>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{highlightText(bookmark.url.replace(/^https?:\/\//, ''), searchQuery)}</span>
                              </div>
                              
                              {bookmark.tags && bookmark.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {bookmark.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex} 
                                      className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                    >
                                      <Tag className="w-2 h-2 mr-1" />
                                      <span className="truncate max-w-[80px]">{highlightText(tag, searchQuery)}</span>
                                    </span>
                                  ))}
                                  {bookmark.tags.length > 3 && (
                                    <span className="text-xs text-muted-foreground px-2 py-1">+{bookmark.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col items-center gap-1 sm:ml-4">
                            <button className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hover:text-primary" />
                            </button>
                            <button className="p-1.5 sm:p-2 hover:bg-secondary/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hover:text-secondary" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 网格视图 */
                        <div className="h-full flex flex-col p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                <Link
                                  href={bookmark.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {highlightText(bookmark.title, searchQuery)}
                                </Link>
                              </h3>
                            </div>
                          </div>
                          
                          {bookmark.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-3 flex-1">
                              {highlightText(bookmark.description, searchQuery)}
                            </p>
                          )}
                          
                          <div className="mt-auto space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="hidden sm:inline">{new Date(bookmark.created_at).toLocaleDateString()}</span>
                                <span className="sm:hidden">{new Date(bookmark.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                              </span>
                              <span className="flex items-center gap-1 truncate max-w-[50%]">
                                <Folder className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{highlightText(bookmark.category?.name || '未分类', searchQuery)}</span>
                              </span>
                            </div>
                            
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {bookmark.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <span 
                                    key={tagIndex} 
                                    className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                  >
                                    <Tag className="w-2 h-2 mr-1" />
                                    <span className="truncate max-w-[60px]">{highlightText(tag, searchQuery)}</span>
                                  </span>
                                ))}
                                {bookmark.tags.length > 2 && (
                                  <span className="text-xs text-muted-foreground px-2 py-1">+{bookmark.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 border-t border-border/30">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate flex-1">
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{highlightText(bookmark.url.replace(/^https?:\/\//, ''), searchQuery)}</span>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button className="p-1 sm:p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                                  <Star className="w-3 h-3 text-muted-foreground hover:text-primary" />
                                </button>
                                <button className="p-1 sm:p-1.5 hover:bg-secondary/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                                  <BookOpen className="w-3 h-3 text-muted-foreground hover:text-secondary" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-8">
                <div className="card glass p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-muted/20 to-muted/10 rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent animate-pulse"></div>
                    <Search className="w-12 h-12 text-muted-foreground relative z-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    未找到相关结果
                  </h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    没有找到包含 <span className="font-semibold text-primary">"{searchQuery}"</span> 的书签
                  </p>
                  
                  {/* 搜索建议 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">尝试不同关键词</div>
                        <div className="text-muted-foreground">使用同义词或相关词汇</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Tag className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">检查拼写</div>
                        <div className="text-muted-foreground">确保关键词拼写正确</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Filter className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">调整筛选条件</div>
                        <div className="text-muted-foreground">尝试不同的分类或排序</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground mb-1">简化搜索词</div>
                        <div className="text-muted-foreground">使用更简短的关键词</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 快速操作 */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                      清除搜索
                    </button>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <Filter className="w-4 h-4" />
                      调整筛选
                    </button>
                  </div>
                </div>
                
                {/* 推荐搜索 */}
                <div className="card glass p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    推荐搜索
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['技术文档', '开发工具', '学习资源', '设计灵感', '前端框架', 'React', 'Vue', 'JavaScript'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchQuery(suggestion)}
                        className="inline-flex items-center text-sm bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-4 py-2 rounded-full hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 border border-primary/20 hover:scale-105"
                      >
                        <Search className="w-3 h-3 mr-2" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 推荐内容 */}
                {allBookmarks.length > 0 && (
                  <div className="card glass p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      您可能感兴趣的内容
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allBookmarks
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 6)
                        .map((bookmark) => (
                          <div key={bookmark.id} className="flex items-center gap-3 p-3 bg-background/30 rounded-xl hover:bg-background/50 transition-colors group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-foreground truncate group-hover:text-primary transition-colors text-sm">
                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {bookmark.title}
                                </a>
                              </h5>
                              <p className="text-xs text-muted-foreground truncate">
                                {bookmark.category?.name}
                              </p>
                            </div>
                            <button
                              onClick={() => setSearchQuery(bookmark.title)}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Search className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 空状态 - 显示统计信息和快速操作 */}
        {!searchQuery.trim() && (
          <div className="animate-fade-in space-y-8">
            {/* 欢迎区域 */}
            <div className="text-center py-8 sm:py-12">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse"></div>
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-primary relative z-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
                探索您的知识宝库
              </h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
                在这里搜索您收藏的所有书签，支持标题、描述、链接、标签和分类的全文搜索
              </p>
              
              {/* 搜索提示 */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-background/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/50">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>标题搜索</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-background/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/50">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  <span>标签匹配</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-background/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/50">
                  <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                  <span>分类筛选</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-background/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/50">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span>链接查找</span>
                </div>
              </div>
            </div>
            
            {/* 统计信息卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
              <div className="card glass p-6 sm:p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {allBookmarks.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  总书签数量
                </div>
                <div className="text-xs text-muted-foreground/70">
                  您的知识收藏
                </div>
              </div>
              
              <div className="card glass p-6 sm:p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
                  {Array.from(new Set(allBookmarks.flatMap(b => b.tags || []))).length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  标签总数
                </div>
                <div className="text-xs text-muted-foreground/70">
                  内容标识
                </div>
              </div>
              
              <div className="card glass p-6 sm:p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  {allCategories.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  分类数量
                </div>
                <div className="text-xs text-muted-foreground/70">
                  组织结构
                </div>
              </div>
            </div>
            
            {/* 快速操作和热门标签 */}
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
              {/* 热门标签 */}
              {Array.from(new Set(allBookmarks.flatMap(b => b.tags || []))).length > 0 && (
                <div className="card glass p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    热门标签
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {Array.from(new Set(allBookmarks.flatMap(b => b.tags || [])))
                      .slice(0, 12)
                      .map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(tag)}
                          className="inline-flex items-center text-xs sm:text-sm bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 border border-primary/20 hover:scale-105"
                        >
                          <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1.5 sm:mr-2" />
                          {tag}
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* 最近添加 */}
              {allBookmarks.length > 0 && (
                <div className="card glass p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    最近添加
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {allBookmarks
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 4)
                      .map((bookmark) => (
                        <div key={bookmark.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-background/30 rounded-lg sm:rounded-xl hover:bg-background/50 transition-colors group">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {bookmark.title}
                              </a>
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                               {bookmark.category?.name} • {new Date(bookmark.created_at).toLocaleDateString()}
                             </p>
                          </div>
                          <button
                            onClick={() => setSearchQuery(bookmark.title)}
                            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-md sm:rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}