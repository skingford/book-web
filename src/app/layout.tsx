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
        {children}
      </body>
    </html>
  )
}