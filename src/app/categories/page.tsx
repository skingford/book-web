import { createServerSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import DeleteCategoryButton from '@/components/DeleteCategoryButton'

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

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  // 获取每个分类的书签数量
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, category_id')

  const bookmarkCounts = bookmarks?.reduce((acc, bookmark) => {
    acc[bookmark.category_id] = (acc[bookmark.category_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
           <div>
             <div className="relative">
               <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 relative z-10">
                 分类管理
               </h1>
               {/* Title glow effect */}
               <div className="absolute inset-0 text-3xl sm:text-4xl font-bold text-blue-500/20 blur-sm -z-10">
                 分类管理
               </div>
             </div>
             <p className="text-base sm:text-lg text-gray-600 flex items-center">
               <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               管理您的书签分类，让收藏更有条理
             </p>
           </div>
           <Link 
             href="/categories/new"
             className="group inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto relative overflow-hidden"
           >
             {/* Button background animation */}
             <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <svg className="w-5 h-5 mr-2 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
             <span className="relative z-10">新建分类</span>
           </Link>
         </div>

        {/* Categories Grid */}
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const bookmarkCount = bookmarkCounts[category.id] || 0
              return (
                <div 
                  key={category.id} 
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-purple-200/50 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* 分类图标和标题 */}
                    <div className="flex items-center mb-4">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {/* Icon glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                          {category.description || '暂无描述'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Category Description */}
                    <div className="mb-6">
                      {category.description ? (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          暂无描述
                        </p>
                      )}
                    </div>
                    
                    {/* 书签统计 */}
                    <div className="mb-6">
                      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80 rounded-2xl p-4 border border-blue-100/30 group-hover:border-purple-200/50 transition-all duration-300">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-2 right-2 w-8 h-8 bg-blue-400 rounded-full"></div>
                          <div className="absolute bottom-2 left-2 w-6 h-6 bg-purple-400 rounded-full"></div>
                        </div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              {/* Pulse indicator */}
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">收藏书签</p>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {bookmarkCount}
                                </span>
                                <span className="text-sm text-gray-500 font-medium">个</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress visualization */}
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-3 bg-gray-200/80 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out group-hover:animate-pulse"
                                  style={{ width: `${Math.min(100, Math.max(10, (bookmarkCount / 20) * 100))}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 font-medium">活跃度</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {bookmarkCount > 10 ? '收藏丰富' : bookmarkCount > 5 ? '持续收藏' : '刚刚开始'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gradient-to-r from-transparent via-gray-200/50 to-transparent space-y-3 sm:space-y-0">
                       <Link 
                         href={`/categories/${category.id}`}
                         className="group/view flex items-center justify-center sm:justify-start px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden w-full sm:w-auto"
                       >
                         {/* Button shine effect */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/view:translate-x-full transition-transform duration-700"></div>
                         <svg className="w-5 h-5 mr-2 group-hover/view:scale-110 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                         <span className="relative z-10">查看书签</span>
                       </Link>
                       
                       <div className="flex items-center justify-center sm:justify-end space-x-3 w-full sm:w-auto">
                         <Link 
                           href={`/categories/${category.id}/edit`}
                           className="group/edit p-3 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 text-gray-600 hover:text-blue-600 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 flex-1 sm:flex-none flex items-center justify-center"
                           title="编辑分类"
                         >
                           <svg className="w-5 h-5 group-hover/edit:scale-110 group-hover/edit:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                         </Link>
                         
                         <div className="group/delete p-3 bg-gradient-to-br from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 hover:text-red-700 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer flex-1 sm:flex-none flex items-center justify-center">
                           <DeleteCategoryButton categoryId={category.id} />
                         </div>
                       </div>
                     </div>
                  </div>
                  
                  {/* 底部装饰性光效 */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 relative overflow-hidden">
            {/* Empty state decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg relative group">
                {/* Icon glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <svg className="w-12 h-12 text-blue-500 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                还没有分类
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                创建您的第一个分类，开始整理您的书签收藏
              </p>
              
              <Link 
                href="/categories/create"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <svg className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative z-10">创建第一个分类</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}