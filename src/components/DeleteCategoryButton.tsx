'use client'

import DeleteButton from './DeleteButton'
import { deleteCategory } from '@/app/actions/bookmark-actions'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
  className?: string
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  className
}: DeleteCategoryButtonProps) {
  const handleDelete = async () => {
    await deleteCategory(categoryId)
  }

  return (
    <DeleteButton
      action={handleDelete}
      title="删除分类"
      confirmMessage={`确定要删除分类 "${categoryName}" 吗？此操作将同时删除该分类下的所有收藏。`}
      className={className}
    />
  )
}
