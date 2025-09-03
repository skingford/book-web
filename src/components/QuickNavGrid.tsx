'use client';

import React, { memo, useMemo } from 'react';
import QuickNavCard from './QuickNavCard';
import { 
  Bookmark, 
  Search, 
  Tag, 
  Star, 
  Clock, 
  TrendingUp,
  Users,
  Settings,
  FileText,
  Globe,
  Zap,
  Heart
} from 'lucide-react';

interface NavItem {
  id: string;
  icon: any;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  iconColor: string;
  iconBgColor: string;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'bookmarks',
    icon: Bookmark,
    title: '我的书签',
    description: '管理和浏览收藏的书签',
    href: '/bookmarks',
    iconColor: '#10B981',
    iconBgColor: '#ECFDF5'
  },
  {
    id: 'search',
    icon: Search,
    title: '智能搜索',
    description: '快速查找相关内容',
    href: '/search',
    iconColor: '#3B82F6',
    iconBgColor: '#EFF6FF'
  },
  {
    id: 'categories',
    icon: Tag,
    title: '分类管理',
    description: '组织和管理内容分类',
    href: '/categories',
    iconColor: '#8B5CF6',
    iconBgColor: '#F3E8FF'
  },
  {
    id: 'favorites',
    icon: Star,
    title: '收藏夹',
    description: '查看收藏的精选内容',
    iconColor: '#F59E0B',
    iconBgColor: '#FEF3C7'
  },
  {
    id: 'recent',
    icon: Clock,
    title: '最近访问',
    description: '查看最近浏览的内容',
    iconColor: '#6B7280',
    iconBgColor: '#F9FAFB'
  },
  {
    id: 'trending',
    icon: TrendingUp,
    title: '热门推荐',
    description: '发现热门和推荐内容',
    iconColor: '#EF4444',
    iconBgColor: '#FEF2F2'
  },
  {
    id: 'community',
    icon: Users,
    title: '社区',
    description: '与其他用户交流分享',
    iconColor: '#06B6D4',
    iconBgColor: '#ECFEFF'
  },
  {
    id: 'settings',
    icon: Settings,
    title: '设置',
    description: '个性化配置和偏好',
    iconColor: '#64748B',
    iconBgColor: '#F1F5F9'
  },
  {
    id: 'docs',
    icon: FileText,
    title: '文档',
    description: '查看使用指南和帮助',
    iconColor: '#7C3AED',
    iconBgColor: '#EDE9FE'
  },
  {
    id: 'explore',
    icon: Globe,
    title: '探索',
    description: '发现新的有趣内容',
    iconColor: '#059669',
    iconBgColor: '#D1FAE5'
  },
  {
    id: 'tools',
    icon: Zap,
    title: '工具箱',
    description: '实用工具和功能',
    iconColor: '#DC2626',
    iconBgColor: '#FEE2E2'
  },
  {
    id: 'liked',
    icon: Heart,
    title: '点赞内容',
    description: '查看点赞和喜欢的内容',
    iconColor: '#EC4899',
    iconBgColor: '#FCE7F3'
  }
];

interface QuickNavGridProps {
  items?: NavItem[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

const QuickNavGrid = memo(function QuickNavGrid({ 
  items = defaultNavItems, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className = ''
}: QuickNavGridProps) {
  const memoizedItems = useMemo(() => items, [items]);
  return (
    <div className={`w-full ${className}`}>
      {/* 标题区域 */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">快速导航</h2>
        <p className="text-sm text-gray-600">选择下方工具快速访问相关功能</p>
      </div>
      
      {/* 网格布局 - 响应式设计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
        {memoizedItems.map((item) => (
          <QuickNavCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            href={item.href}
            onClick={item.onClick}
            iconColor={item.iconColor}
            iconBgColor={item.iconBgColor}
          />
        ))}
      </div>
    </div>
  );
});

export default QuickNavGrid;