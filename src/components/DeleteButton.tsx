'use client'

import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

interface DeleteButtonProps {
  action: () => Promise<void>
  title: string
  confirmMessage: string
  className?: string
  iconClassName?: string
}

export default function DeleteButton({
  action,
  title,
  confirmMessage,
  className = "p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors",
  iconClassName = "w-4 h-4"
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (isPending) return
    
    if (confirm(confirmMessage)) {
      startTransition(async () => {
        try {
          await action()
        } catch (error) {
          console.error('Delete failed:', error)
          alert('删除失败，请重试')
        }
      })
    }
  }

  return (
    <button
      className={className}
      title={title}
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className={iconClassName} />
    </button>
  )
}