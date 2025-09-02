'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteBookmark(bookmarkId: string, categoryId: string) {
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
  
  if (error) {
    console.error('Error deleting bookmark:', error)
    throw new Error('Failed to delete bookmark')
  }
  
  // Revalidate the category page to reflect the changes
  revalidatePath(`/categories/${categoryId}`)
}

export async function deleteCategory(categoryId: string) {
  const supabase = createServerSupabaseClient()
  
  // First delete all bookmarks in this category
  const { error: bookmarksError } = await supabase
    .from('bookmarks')
    .delete()
    .eq('category_id', categoryId)
  
  if (bookmarksError) {
    console.error('Error deleting bookmarks:', bookmarksError)
    throw new Error('Failed to delete bookmarks')
  }
  
  // Then delete the category
  const { error: categoryError } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
  
  if (categoryError) {
    console.error('Error deleting category:', categoryError)
    throw new Error('Failed to delete category')
  }
  
  // Revalidate and redirect to categories page
  revalidatePath('/categories')
  redirect('/categories')
}