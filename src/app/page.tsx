'use client'

import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Database } from '@/types/database'
import Link from 'next/link'
import HomeSearch from '@/components/HomeSearch'
import { ExternalLink, Clock, Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  color?: string
  created_at: string
}

interface Bookmark {
  id: string
  title: string
  url: string
  description: string | null
  favicon?: string
  category_id: string
  tags?: string[]
  is_favorite?: boolean
  created_at: string
  category?: {
    id: string
    name: string
    color?: string
  }
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      const supabase = createClientSupabaseClient()
      
      // 获取分类数据
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
      
      // 获取书签数据
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false })
      
      setCategories(categoriesData || [])
       setBookmarks(bookmarksData || [])
       setLoading(false)
     }
     
     fetchData()
   }, [])

  // 处理分类数据，添加书签数量
  const processedCategories = categories?.map(category => ({
    ...category,
    bookmark_count: bookmarks.filter(bookmark => bookmark.category_id === category.id).length
  })) || []

  // 处理书签数据，添加分类信息
  const processedBookmarks = bookmarks?.map(bookmark => ({
    ...bookmark,
    category: bookmark.categories
  })) || []

  // 按分类组织书签
  const bookmarksByCategory = processedCategories.map(category => ({
    ...category,
    bookmarks: processedBookmarks.filter(bookmark => bookmark.category_id === category.id)
  }))
  
  // 未分类的书签
  const uncategorizedBookmarks = processedBookmarks.filter(bookmark => !bookmark.category_id)
  
  // 如果有未分类书签，添加到列表中
  if (uncategorizedBookmarks.length > 0) {
    bookmarksByCategory.push({
      id: 'uncategorized',
      name: '未分类',
      description: '暂未归类的书签',
      color: '#6B7280',
      created_at: '',
      bookmark_count: uncategorizedBookmarks.length,
      bookmarks: uncategorizedBookmarks
    })
  }

  // 准备搜索建议数据
  const searchSuggestions = [
    // 书签建议
    ...processedBookmarks.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      type: 'bookmark' as const,
      category: bookmark.category?.name
    })),
    // 分类建议
    ...processedCategories.map(category => ({
      id: category.id,
      title: category.name,
      url: `/categories/${category.id}`,
      type: 'category' as const,
      category: category.name
    }))
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部搜索栏区域 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">我的书签导航</h1>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <HomeSearch 
                suggestions={searchSuggestions}
                recentSearches={['React 教程', '设计工具', 'AI 工具']}
                popularSearches={['开发工具', '设计资源', '学习资料', '娱乐']}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href="/bookmarks/new" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加书签
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookmarksByCategory.length > 0 ? (
          <div className="space-y-12">
            {bookmarksByCategory.map((category) => (
              <section key={category.id} className="">
                {/* 分类标题 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    ></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {category.bookmark_count}
                    </span>
                  </div>
                  {category.id !== 'uncategorized' && (
                    <Link 
                      href={`/categories/${category.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      查看全部 →
                    </Link>
                  )}
                </div>
                
                {/* 分类描述 */}
                {category.description && (
                  <p className="text-gray-600 mb-6">{category.description}</p>
                )}
                
                {/* 书签卡片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <div className="flex items-start space-x-3">
                        {/* 网站图标 */}
                        <div className="flex-shrink-0">
                          {bookmark.favicon ? (
                            <img 
                              src={bookmark.favicon} 
                              alt="" 
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-6 h-6 bg-gray-100 rounded flex items-center justify-center ${bookmark.favicon ? 'hidden' : ''}`}>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* 书签内容 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {bookmark.title}
                          </h3>
                          {bookmark.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {bookmark.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              访问
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(bookmark.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ExternalLink className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">开始您的收藏之旅</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              创建您的第一个分类，开始整理和管理您的珍贵书签
            </p>
            <Link 
              href="/categories/new" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建第一个分类
            </Link>
                  </div>
         )}
       </main>
    </div>
  )
}