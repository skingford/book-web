import { createServerSupabaseClient } from '@/lib/supabase'
import { Category } from '@/types/database'
import Link from 'next/link'
import { Plus, Edit, Folder } from 'lucide-react'
import DeleteCategoryButton from '@/components/DeleteCategoryButton'

// 获取所有分类的服务端函数
async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return categories || []
}

export default async function CategoriesPage() {
  const categories = await getCategories()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            分类管理
          </h1>
          <p className="text-gray-600">
            管理您的收藏分类，创建、编辑或删除分类
          </p>
        </div>
        <Link 
          href="/categories/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建分类
        </Link>
      </div>

      {/* 分类列表 */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无分类
          </h3>
          <p className="text-gray-500 mb-6">
            创建您的第一个分类来开始整理收藏
          </p>
          <Link 
            href="/categories/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建分类
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {/* 分类标题 */}
              <div className="flex items-center mb-4">
                <div 
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                ></div>
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {category.name}
                </h3>
              </div>
              
              {/* 分类描述 */}
              {category.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {category.description}
                </p>
              )}
              
              {/* 创建时间 */}
              <p className="text-sm text-gray-400 mb-4">
                创建于 {new Date(category.created_at).toLocaleDateString('zh-CN')}
              </p>
              
              {/* 操作按钮 */}
              <div className="flex justify-between items-center">
                <Link 
                  href={`/categories/${category.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看收藏
                </Link>
                <div className="flex space-x-2">
                  <Link 
                    href={`/categories/${category.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑分类"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <DeleteCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 返回首页链接 */}
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}