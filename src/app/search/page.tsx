'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowLeft, ExternalLink, Tag, Calendar, Folder } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { BookmarkWithCategory } from '@/types/database'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<BookmarkWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')

  // 搜索函数
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const supabase = createClientSupabaseClient()
      
      // 使用全文搜索和模糊匹配
      const { data, error: searchError } = await supabase
        .from('bookmarks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .or(`
          title.ilike.%${searchQuery.trim()}%,
          description.ilike.%${searchQuery.trim()}%,
          url.ilike.%${searchQuery.trim()}%
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (searchError) {
        throw searchError
      }
      
      // 处理标签搜索
      const tagFilteredResults = (data || []).filter(bookmark => {
        if (!bookmark.tags) return true
        return bookmark.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      })
      
      // 合并结果并去重
      const allResults = data || []
      const uniqueResults = allResults.filter((bookmark, index, self) => 
        index === self.findIndex(b => b.id === bookmark.id)
      )
      
      setResults(uniqueResults)
    } catch (err) {
      console.error('Search error:', err)
      setError('搜索失败，请重试')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 处理搜索输入
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    // 更新URL参数
    const params = new URLSearchParams()
    if (trimmedQuery) {
      params.set('q', trimmedQuery)
    }
    router.push(`/search?${params.toString()}`, { scroll: false })
    
    performSearch(trimmedQuery)
  }

  // 清空搜索
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError('')
    router.push('/search', { scroll: false })
  }

  // 初始化时执行搜索
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [searchParams, performSearch])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 高亮搜索关键词
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="flex items-center mb-8">
        <Link 
          href="/"
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            搜索收藏
          </h1>
          <p className="text-gray-600 mt-1">
            在您的收藏中查找内容
          </p>
        </div>
      </div>

      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="搜索标题、描述、链接或标签..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="mr-2 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                清空
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>
      </form>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 搜索结果 */}
      {hasSearched && (
        <div>
          {/* 结果统计 */}
          <div className="mb-6">
            <p className="text-gray-600">
              {isLoading ? (
                '搜索中...'
              ) : (
                `找到 ${results.length} 个结果${query ? ` "${query}"` : ''}`
              )}
            </p>
          </div>

          {/* 结果列表 */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">搜索中...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((bookmark) => (
                <div key={bookmark.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  {/* 收藏标题和链接 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {highlightText(bookmark.title, query)}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {highlightText(bookmark.url, query)}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* 收藏描述 */}
                  {bookmark.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {highlightText(bookmark.description, query)}
                    </p>
                  )}

                  {/* 元信息 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {/* 分类 */}
                    {bookmark.categories && (
                      <Link
                        href={`/categories/${bookmark.categories.id}`}
                        className="inline-flex items-center hover:text-gray-700 transition-colors"
                      >
                        <Folder className="w-4 h-4 mr-1" />
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: bookmark.categories.color }}
                        ></span>
                        {bookmark.categories.name}
                      </Link>
                    )}

                    {/* 创建时间 */}
                    <span className="inline-flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(bookmark.created_at)}
                    </span>

                    {/* 标签 */}
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="inline-flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        <div className="flex flex-wrap gap-1">
                          {bookmark.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {highlightText(tag, query)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/bookmarks/${bookmark.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      编辑
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                没有找到相关结果
              </h3>
              <p className="text-gray-600 mb-4">
                尝试使用不同的关键词或检查拼写
              </p>
              <Link
                href="/bookmarks/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加新收藏
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 搜索提示 */}
      {!hasSearched && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            开始搜索您的收藏
          </h3>
          <p className="text-gray-600 mb-6">
            输入关键词来查找您保存的网站和资源
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">搜索技巧：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 搜索标题、描述或网址中的关键词</li>
              <li>• 使用标签名称快速筛选</li>
              <li>• 支持中英文混合搜索</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}