'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Globe } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Category } from '@/types/database'

export default function NewBookmarkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCategoryId = searchParams.get('category')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: preselectedCategoryId || '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState('')

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
        
        if (error) {
          throw error
        }
        
        setCategories(data || [])
        
        // 如果没有预选分类且有分类可选，选择第一个
        if (!preselectedCategoryId && data && data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }))
        }
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('加载分类列表失败')
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [preselectedCategoryId])

  // 从URL提取网站信息
  const extractSiteInfo = async (url: string) => {
    try {
      // 简单的URL验证
      const urlObj = new URL(url)
      
      // 如果标题为空，使用域名作为默认标题
      if (!formData.title.trim()) {
        const domain = urlObj.hostname.replace('www.', '')
        setFormData(prev => ({ 
          ...prev, 
          title: domain.charAt(0).toUpperCase() + domain.slice(1)
        }))
      }
    } catch (err) {
      // URL格式错误，不做处理
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, url }))
    
    // 当URL改变时，尝试提取网站信息
    if (url.trim()) {
      extractSiteInfo(url.trim())
    }
  }

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
      
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
          category_id: formData.category_id,
          tags: tags.length > 0 ? tags : null
        })
      
      if (insertError) {
        throw insertError
      }
      
      router.push(`/categories/${formData.category_id}`)
    } catch (err) {
      console.error('Error creating bookmark:', err)
      setError('创建收藏失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无分类
          </h3>
          <p className="text-gray-500 mb-6">
            请先创建一个分类，然后再添加收藏
          </p>
          <Link 
            href="/categories/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建分类
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
          href={preselectedCategoryId ? `/categories/${preselectedCategoryId}` : '/'}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            添加收藏
          </h1>
          <p className="text-gray-600 mt-1">
            添加一个新的网站收藏
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
            placeholder="请输入网站链接（如：https://example.com）"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
            placeholder="输入标签，用逗号分隔（如：工具,设计,前端）"
          />
          <p className="text-sm text-gray-500 mt-1">
            用逗号分隔多个标签，方便后续搜索和筛选
          </p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4">
          <Link 
            href={preselectedCategoryId ? `/categories/${preselectedCategoryId}` : '/'}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.url.trim() || !formData.category_id}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? '添加中...' : '添加收藏'}
          </button>
        </div>
      </form>
    </div>
  )
}