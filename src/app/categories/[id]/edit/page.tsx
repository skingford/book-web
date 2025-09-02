'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Category } from '@/types/database'

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
]

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // 加载分类数据
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (error) {
          throw error
        }
        
        if (data) {
          setCategory(data)
          setFormData({
            name: data.name,
            description: data.description || '',
            color: data.color
          })
        } else {
          router.push('/categories')
        }
      } catch (err) {
        console.error('Error loading category:', err)
        setError('加载分类信息失败')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCategory()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('分类名称不能为空')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const supabase = createClientSupabaseClient()
      
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        })
        .eq('id', params.id)
      
      if (updateError) {
        throw updateError
      }
      
      router.push('/categories')
    } catch (err) {
      console.error('Error updating category:', err)
      setError('更新分类失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return
    
    const confirmed = confirm(
      `确定要删除分类 "${category.name}" 吗？\n\n此操作将同时删除该分类下的所有收藏，且无法恢复。`
    )
    
    if (!confirmed) return
    
    setIsDeleting(true)
    setError('')
    
    try {
      const supabase = createClientSupabaseClient()
      
      // 先删除该分类下的所有收藏
      const { error: bookmarksError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('category_id', params.id)
      
      if (bookmarksError) {
        throw bookmarksError
      }
      
      // 再删除分类
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', params.id)
      
      if (categoryError) {
        throw categoryError
      }
      
      router.push('/categories')
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('删除分类失败，请重试')
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

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <p className="text-gray-600">分类不存在</p>
          <Link href="/categories" className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
            返回分类列表
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
          href={`/categories/${params.id}`}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            编辑分类
          </h1>
          <p className="text-gray-600 mt-1">
            修改分类信息
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
        
        {/* 分类名称 */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            分类名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入分类名称"
            maxLength={50}
            required
          />
        </div>
        
        {/* 分类描述 */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            分类描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入分类描述（可选）"
            rows={3}
            maxLength={200}
          />
        </div>
        
        {/* 分类颜色 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            分类颜色
          </label>
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  formData.color === color
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            选择的颜色：
            <span 
              className="inline-block w-4 h-4 rounded ml-2 align-middle"
              style={{ backgroundColor: formData.color }}
            ></span>
            <span className="ml-1">{formData.color}</span>
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
            {isDeleting ? '删除中...' : '删除分类'}
          </button>
          
          {/* 保存和取消按钮 */}
          <div className="flex space-x-4">
            <Link 
              href={`/categories/${params.id}`}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || !formData.name.trim()}
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