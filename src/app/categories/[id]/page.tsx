import { createServerSupabaseClient } from '@/lib/supabase'
import { Category, BookmarkWithCategory } from '@/types/database'
import Link from 'next/link'
import { ArrowLeft, Plus, ExternalLink, Edit, Bookmark } from 'lucide-react'
import { notFound } from 'next/navigation'
import DeleteBookmarkButton from '@/components/DeleteBookmarkButton'

interface CategoryDetailPageProps {
  params: {
    id: string
  }
}

// 获取分类详情的服务端函数
async function getCategoryWithBookmarks(id: string): Promise<{
  category: Category | null
  bookmarks: BookmarkWithCategory[]
}> {
  const supabase = createServerSupabaseClient()
  
  // 获取分类信息
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (categoryError || !category) {
    return { category: null, bookmarks: [] }
  }
  
  // 获取该分类下的收藏
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('category_id', id)
    .order('created_at', { ascending: false })
  
  if (bookmarksError) {
    console.error('Error fetching bookmarks:', bookmarksError)
    return { category, bookmarks: [] }
  }
  
  return { category, bookmarks: bookmarks || [] }
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { category, bookmarks } = await getCategoryWithBookmarks(params.id)
  
  if (!category) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link 
            href="/categories"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center mb-2">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              ></div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
            </div>
            {category.description && (
              <p className="text-gray-600">
                {category.description}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              共 {bookmarks.length} 个收藏
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link 
            href={`/categories/${category.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑分类
          </Link>
          <Link 
            href={`/bookmarks/new?category=${category.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加收藏
          </Link>
        </div>
      </div>

      {/* 收藏列表 */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无收藏
          </h3>
          <p className="text-gray-500 mb-6">
            在此分类下添加您的第一个收藏
          </p>
          <Link 
            href={`/bookmarks/new?category=${category.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加收藏
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              {/* 收藏标题和链接 */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {bookmark.title}
                </h3>
                <a 
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                  {bookmark.url}
                </a>
              </div>
              
              {/* 收藏描述 */}
              {bookmark.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {bookmark.description}
                </p>
              )}
              
              {/* 标签 */}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{bookmark.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* 创建时间和操作 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  {new Date(bookmark.created_at).toLocaleDateString('zh-CN')}
                </span>
                <div className="flex space-x-2">
                  <Link 
                    href={`/bookmarks/${bookmark.id}/edit`}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="编辑收藏"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteBookmarkButton
                    bookmarkId={bookmark.id}
                    categoryId={category.id}
                    bookmarkTitle={bookmark.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}