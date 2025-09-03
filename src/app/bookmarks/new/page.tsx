'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, Bookmark, Tag, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function NewBookmarkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCategoryId = searchParams.get('category')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: preselectedCategoryId || '',
    tags: ''
  })

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
      
        
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

  // 处理URL变化，尝试提取网站信息
  const handleUrlChange = async (url: string) => {
    setFormData({ ...formData, url })
    
    // 如果URL有效且标题为空，尝试提取网站标题
    if (url && !formData.title && isValidUrl(url)) {
      try {
        // 这里可以添加提取网站标题的逻辑
        // 由于浏览器安全限制，这里只是一个占位符
        const domain = new URL(url).hostname
        if (domain) {
          setFormData(prev => ({ 
            ...prev, 
            url,
            title: prev.title || domain.replace('www.', '')
          }))
        }
      } catch (err) {
        // URL 格式错误，忽略
      }
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
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
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Globe className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              需要先创建分类
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              请先创建一个分类，然后再添加收藏
            </p>
            <Link 
              href="/categories/new"
              className="btn-primary group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              创建分类
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-6 relative">
              <Link 
                href={preselectedCategoryId ? `/categories/${preselectedCategoryId}` : '/'}
                className="absolute left-0 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <Bookmark className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                添加收藏
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              保存您喜欢的网站，让收藏更有条理
            </p>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="card animate-slide-in">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {/* 收藏标题 */}
          <div className="mb-6">
            <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Bookmark className="w-4 h-4 mr-2 text-blue-500" />
              收藏标题 <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="请输入收藏标题"
              maxLength={100}
              required
            />
          </div>
          
          {/* 收藏链接 */}
          <div className="mb-6">
            <label htmlFor="url" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <LinkIcon className="w-4 h-4 mr-2 text-blue-500" />
              收藏链接 <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="https://example.com"
              required
            />
          </div>
          
          {/* 收藏描述 */}
          <div className="mb-6">
            <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              收藏描述
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
              placeholder="请输入收藏描述（可选）"
              rows={4}
              maxLength={500}
            />
          </div>
          
          {/* 选择分类 */}
          <div className="mb-6">
            <label htmlFor="category" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              选择分类 <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white"
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
            <label htmlFor="tags" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4 mr-2 text-blue-500" />
              标签
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="输入标签，用逗号分隔（如：工具,设计,前端）"
            />
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              用逗号分隔多个标签，方便后续搜索和筛选
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
            <Link 
              href={preselectedCategoryId ? `/categories/${preselectedCategoryId}` : '/'}
              className="btn-ghost order-2 sm:order-1"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.url.trim() || !formData.category_id}
              className="btn-primary group order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {isSubmitting ? '添加中...' : '添加收藏'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}