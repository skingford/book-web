'use client'

import DeleteButton from './DeleteButton'
import { deleteBookmark } from '@/app/actions/bookmark-actions'

interface DeleteBookmarkButtonProps {
  bookmarkId: string
  categoryId: string
  bookmarkTitle: string
  className?: string
}

export default function DeleteBookmarkButton({
  bookmarkId,
  categoryId,
  bookmarkTitle,
  className
}: DeleteBookmarkButtonProps) {
  const handleDelete = async () => {
    await deleteBookmark(bookmarkId, categoryId)
  }

  return (
    <DeleteButton
      action={handleDelete}
      title="删除收藏"
      confirmMessage={`确定要删除收藏 "${bookmarkTitle}" 吗？`}
      className={className}
    />
  )
}