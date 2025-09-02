'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Category, Bookmark } from '@/types/database'

interface EditBookmarkPageProps {
  params: {
    id: string
  }
}

export default function EditBookmarkPage({ params }: EditBookmarkPageProps) {
  const router = useRouter()
  const [bookmark, setBookmark] = useState<Bookmark | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: '',
    tags: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // 加载收藏和分类数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // 并行加载收藏和分类数据
        const [bookmarkResult, categoriesResult] = await Promise.all([
          supabase
            .from('bookmarks')
            .select('*')
            .eq('id', params.id)
            .single(),
          supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })
        ])
        
        if (bookmarkResult.error) {
          throw bookmarkResult.error
        }
        
        if (categoriesResult.error) {
          throw categoriesResult.error
        }
        
        const bookmarkData = bookmarkResult.data
        const categoriesData = categoriesResult.data || []
        
        if (bookmarkData) {
          setBookmark(bookmarkData)
          setFormData({
            title: bookmarkData.title,
            url: bookmarkData.url,
            description: bookmarkData.description || '',
            category_id: bookmarkData.category_id,
            tags: bookmarkData.tags ? bookmarkData.tags.join(', ') : ''
          })
        } else {
          router.push('/')
          return
        }
        
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('收藏标题不能为空')
      return
    }
    
    if (!formData.url.trim()) {
      setError('收藏链接不能为空')
      return
    }
    
    if (!formData.category_id) {
      setError('请选择一个分类')
      return
    }
    
    // 验证URL格式
    try {
      new URL(formData.url.trim())
    } catch {
      setError('请输入有效的URL地址')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const supabase = createClientSupabaseClient()
      
      // 处理标签
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      const { error: updateError } = await supabase
        .from('bookmarks')
        .update({
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id,
          tags: tags.length > 0 ? tags : null
        })
        .eq('id', params.id)
      
      if (updateError) {
        throw updateError
      }
      
      router.push(`/categories/${formData.category_id}`)
    } catch (err) {
      console.error('Error updating bookmark:', err)
      setError('更新收藏失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!bookmark) return
    
    const confirmed = confirm(
      `确定要删除收藏 "${bookmark.title}" 吗？\n\n此操作无法恢复。`
    )
    
    if (!confirmed) return
    
    setIsDeleting(true)
    setError('')
    
    try {
      const supabase = createClientSupabaseClient()
      
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', params.id)
      
      if (deleteError) {
        throw deleteError
      }
      
      router.push(`/categories/${bookmark.category_id}`)
    } catch (err) {
      console.error('Error deleting bookmark:', err)
      setError('删除收藏失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  if (!bookmark) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <p className="text-gray-600">收藏不存在</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 页面标题 */}
      <div className="flex items-center mb-8">
        <Link 
          href={`/categories/${bookmark.category_id}`}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            编辑收藏
          </h1>
          <p className="text-gray-600 mt-1">
            修改收藏信息
          </p>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* 收藏标题 */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            收藏标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入收藏标题"
            maxLength={100}
            required
          />
        </div>
        
        {/* 收藏链接 */}
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            收藏链接 <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
            required
          />
        </div>
        
        {/* 收藏描述 */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            收藏描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入收藏描述（可选）"
            rows={3}
            maxLength={500}
          />
        </div>
        
        {/* 选择分类 */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            选择分类 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">请选择分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* 标签 */}
        <div className="mb-8">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="输入标签，用逗号分隔（如：工具,设计,前端）"
          />
          <p className="text-sm text-gray-500 mt-1">
            用逗号分隔多个标签，方便后续搜索和筛选
          </p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex justify-between">
          {/* 删除按钮 */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? '删除中...' : '删除收藏'}
          </button>
          
          {/* 保存和取消按钮 */}
          <div className="flex space-x-4">
            <Link 
              href={`/categories/${bookmark.category_id}`}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || !formData.title.trim() || !formData.url.trim() || !formData.category_id}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? '保存中...' : '保存更改'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}