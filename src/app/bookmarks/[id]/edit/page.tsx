'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Edit3, Link as LinkIcon, FileText, Tag, Folder } from 'lucide-react'
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card glass p-8 text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">加载收藏信息中...</p>
        </div>
      </div>
    )
  }

  if (!bookmark) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card glass p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">收藏不存在</h2>
          <p className="text-muted-foreground mb-6">您要编辑的收藏可能已被删除或不存在</p>
          <Link href="/" className="btn-primary inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 页面标题 */}
        <div className="flex items-center mb-8 animate-slide-in">
          <Link 
            href={`/categories/${bookmark.category_id}`}
            className="mr-4 p-3 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              编辑收藏
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              修改 "{bookmark.title}" 的信息
            </p>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="card glass p-8 animate-fade-in">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-scale-in">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}
          
          {/* 收藏标题 */}
          <div className="mb-6">
            <label htmlFor="title" className="flex items-center text-sm font-semibold text-foreground mb-3">
              <Edit3 className="w-4 h-4 mr-2 text-primary" />
              收藏标题 <span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="请输入收藏标题"
              maxLength={100}
              required
            />
          </div>
          
          {/* 收藏链接 */}
          <div className="mb-6">
            <label htmlFor="url" className="flex items-center text-sm font-semibold text-foreground mb-3">
              <LinkIcon className="w-4 h-4 mr-2 text-primary" />
              收藏链接 <span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="https://example.com"
              required
            />
          </div>
          
          {/* 收藏描述 */}
          <div className="mb-6">
            <label htmlFor="description" className="flex items-center text-sm font-semibold text-foreground mb-3">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              收藏描述
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              placeholder="请输入收藏描述（可选）"
              rows={3}
              maxLength={500}
            />
          </div>
          
          {/* 选择分类 */}
          <div className="mb-6">
            <label htmlFor="category" className="flex items-center text-sm font-semibold text-foreground mb-3">
              <Folder className="w-4 h-4 mr-2 text-primary" />
              选择分类 <span className="text-destructive ml-1">*</span>
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
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
            <label htmlFor="tags" className="flex items-center text-sm font-semibold text-foreground mb-3">
              <Tag className="w-4 h-4 mr-2 text-primary" />
              标签
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="输入标签，用逗号分隔（如：工具,设计,前端）"
            />
            <p className="text-sm text-muted-foreground mt-2">
              用逗号分隔多个标签，方便后续搜索和筛选
            </p>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center justify-center px-6 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? '删除中...' : '删除收藏'}
            </button>
            
            {/* 保存和取消按钮 */}
            <div className="flex gap-4">
              <Link 
                href={`/categories/${bookmark.category_id}`}
                className="btn-ghost px-6 py-3 font-medium"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting || !formData.title.trim() || !formData.url.trim() || !formData.category_id}
                className="btn-primary px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}