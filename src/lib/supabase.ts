import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 客户端 Supabase 实例（用于前端）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 创建客户端 Supabase 实例的函数（用于客户端组件）
export const createClientSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// 服务端 Supabase 实例（用于 SSR）
export const createServerSupabaseClient = () => {
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}