import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface Bookmark {
  id: string
  title: string
  url: string
  description: string | null
  category_id: string
  created_at: string
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  
  // 获取所有分类和书签
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })
  
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  // 将书签按分类分组
  const bookmarksByCategory = bookmarks?.reduce((acc, bookmark) => {
    if (!acc[bookmark.category_id]) {
      acc[bookmark.category_id] = []
    }
    acc[bookmark.category_id].push(bookmark)
    return acc
  }, {} as Record<string, Bookmark[]>) || {}

  // 统计信息
  const totalCategories = categories?.length || 0
  const totalBookmarks = bookmarks?.length || 0
  const recentBookmarks = bookmarks?.slice(0, 8) || []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        {/* 动态背景 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  智能收藏
                </span>
                <br />
                <span className="text-gray-800 text-4xl md:text-5xl">
                  个人导航中心
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                让您的收藏更有序，让访问更高效。
                <br className="hidden md:block" />
                一个现代化的个人书签管理平台。
              </p>
              
              {/* 统计信息卡片 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">{totalCategories}</div>
                  <div className="text-sm text-gray-600 font-medium">个分类</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">{totalBookmarks}</div>
                  <div className="text-sm text-gray-600 font-medium">个书签</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform">{recentBookmarks.length}</div>
                  <div className="text-sm text-gray-600 font-medium">最近添加</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-pink-600 mb-2 group-hover:scale-110 transition-transform">∞</div>
                  <div className="text-sm text-gray-600 font-medium">无限可能</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-in">
                <Link 
                  href="/search" 
                  className="btn-primary group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    搜索书签
                  </div>
                </Link>
                <Link 
                  href="/categories" 
                  className="btn-secondary group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  管理分类
                </Link>
                <Link 
                  href="/categories/new" 
                  className="btn-ghost group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  添加书签
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                精选分类
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              按主题精心整理的书签集合，助您高效管理和快速访问
            </p>
          </div>
          
          {categories && categories.length > 0 ? (
            <>
              {/* 分类网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {categories.map((category, index) => {
                  const categoryBookmarks = bookmarksByCategory[category.id] || []
                  return (
                    <div 
                      key={category.id} 
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:h-2"></div>
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <span className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                              {categoryBookmarks.length} 个
                            </span>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                            {category.description}
                          </p>
                        )}
                        <div className="space-y-3">
                          {categoryBookmarks.slice(0, 3).map((bookmark) => (
                            <div key={bookmark.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group/item">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 group-hover/item:scale-125 transition-transform"></div>
                              <a 
                                href={bookmark.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-blue-600 transition-colors truncate flex-1 font-medium group-hover/item:translate-x-1 transition-transform"
                              >
                                {bookmark.title}
                              </a>
                            </div>
                          ))}
                          {categoryBookmarks.length > 3 && (
                            <div className="text-gray-500 text-center pt-3 font-medium">
                              还有 {categoryBookmarks.length - 3} 个精彩书签...
                            </div>
                          )}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <Link 
                            href={`/categories/${category.id}`}
                            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 group/link"
                          >
                            探索更多
                            <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* 最近添加的书签 */}
              {recentBookmarks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        最近添加
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">最新收藏</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentBookmarks.slice(0, 6).map((bookmark, index) => (
                      <a
                        key={bookmark.id}
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group border border-gray-100 hover:border-blue-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {bookmark.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {bookmark.url}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">开始您的收藏之旅</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                创建您的第一个分类，开始整理和管理您的珍贵书签
              </p>
              <Link 
                href="/categories/new" 
                className="btn-primary text-lg px-8 py-4"
              >
                创建第一个分类
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}