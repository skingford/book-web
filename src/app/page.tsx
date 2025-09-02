import { createServerSupabaseClient } from '@/lib/supabase'
import { CategoryWithBookmarks } from '@/types/database'
import Link from 'next/link'
import { ExternalLink, Folder, Plus, Settings, Search } from 'lucide-react'

// 获取分类和收藏数据的服务端函数
async function getCategoriesWithBookmarks(): Promise<CategoryWithBookmarks[]> {
  const supabase = createServerSupabaseClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      bookmarks (
        id,
        title,
        url,
        description,
        favicon_url,
        created_at
      )
    `)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return categories as CategoryWithBookmarks[]
}

export default async function HomePage() {
  const categories = await getCategoriesWithBookmarks()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            我的收藏导航
          </h1>
          <p className="text-gray-600">
            管理和浏览您收藏的网站和资源
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Link 
            href="/search"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            搜索收藏
          </Link>
          <Link 
            href="/categories"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            管理分类
          </Link>
          <Link 
            href="/bookmarks/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加收藏
          </Link>
        </div>
      </div>

      {/* 分类和收藏展示 */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有任何分类
          </h3>
          <p className="text-gray-600 mb-4">
            创建您的第一个分类来开始整理收藏
          </p>
          <Link 
            href="/categories"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建分类
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              {/* 分类标题 */}
              <div className="flex items-center mb-4">
                <div 
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                ></div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {category.name}
                </h2>
                <span className="ml-auto text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  {category.bookmarks?.length || 0} 个
                </span>
              </div>
              
              {/* 分类描述 */}
              {category.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              {/* 收藏列表预览 */}
              {category.bookmarks && category.bookmarks.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {category.bookmarks.slice(0, 3).map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-blue-600 hover:text-blue-800 truncate"
                        title={bookmark.title}
                      >
                        {bookmark.title}
                      </a>
                      <ExternalLink className="w-3 h-3 ml-2 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                  {category.bookmarks.length > 3 && (
                    <p className="text-xs text-gray-500">
                      还有 {category.bookmarks.length - 3} 个收藏...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  暂无收藏
                </p>
              )}
              
              {/* 操作按钮 */}
              <div className="flex justify-between gap-2">
                <Link
                  href={`/categories/${category.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  查看全部
                </Link>
                <Link
                  href={`/bookmarks/new?category=${category.id}`}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  添加收藏
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}