import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '个人收藏导航',
  description: '个人收藏书签导航网站',
  keywords: '书签,导航,收藏,个人网站',
  openGraph: {
    title: '个人收藏导航',
    description: '个人收藏书签导航网站',
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
      <body className={`${inter.className} gradient-bg`}>
        <header className="glass sticky top-0 z-50 backdrop-blur-md border-b border-white/20">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    个人收藏导航
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a href="/" className="nav-link group relative px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-white/50">
                  <span className="relative z-10">首页</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </a>
                <a href="/categories" className="nav-link group relative px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-white/50">
                  <span className="relative z-10">分类管理</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </a>
                <a href="/search" className="nav-link group relative px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-white/50">
                  <span className="relative z-10">搜索</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </a>
              </div>
            </div>
          </nav>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}