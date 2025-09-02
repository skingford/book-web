import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '个人收藏导航 - 快速访问您的收藏网站',
  description: '高效管理和快速访问个人收藏链接的导航网站',
  keywords: '收藏夹, 书签, 导航, 个人收藏, 快速访问',
  authors: [{ name: 'Book Web' }],
  openGraph: {
    title: '个人收藏导航',
    description: '高效管理和快速访问个人收藏链接的导航网站',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  个人收藏导航
                </h1>
              </div>
              <nav className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  首页
                </a>
                <a href="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  分类管理
                </a>
                <a href="/search" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  搜索
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}