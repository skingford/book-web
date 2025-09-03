'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteButtonProps {
  onDelete: () => Promise<void>
  className?: string
  title?: string
}

export default function DeleteButton({ onDelete, className = "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors", title = "删除" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return
    
    // 添加震动动画提示用户注意
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
    
    const confirmed = confirm('确定要删除吗？此操作无法撤销。')
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await onDelete()
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`${className} btn-bounce ${
        isDeleting ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
      } ${
        isShaking ? 'animate-shake' : ''
      }`}
      title={title}
    >
      <Trash2 className={`w-4 h-4 transition-transform ${
        isDeleting ? 'animate-bounce' : ''
      } ${
        isShaking ? 'scale-110' : ''
      }`} />
    </button>
  )
}