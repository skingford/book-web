'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

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

export default function NewCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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
      
      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        })
      
      if (insertError) {
        throw insertError
      }
      
      router.push('/categories')
    } catch (err) {
      console.error('Error creating category:', err)
      setError('创建分类失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 页面标题 */}
      <div className="flex items-center mb-8">
        <Link 
          href="/categories"
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            新建分类
          </h1>
          <p className="text-gray-600 mt-1">
            创建一个新的收藏分类
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
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
        <div className="flex justify-end space-x-4">
          <Link 
            href="/categories"
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? '创建中...' : '创建分类'}
          </button>
        </div>
      </form>
    </div>
  )
}