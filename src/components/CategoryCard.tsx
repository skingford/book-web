'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, ExternalLink, MoreHorizontal } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  bookmark_count?: number;
  created_at?: string;
}

interface CategoryCardProps {
  category: Category;
  showBookmarkCount?: boolean;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  showBookmarkCount = true,
  showActions = false,
  onEdit,
  onDelete,
  className = ''
}) => {
  const { id, name, description, color = '#3B82F6', bookmark_count = 0 } = category;

  // 获取颜色样式
  const getColorStyles = (colorValue: string) => {
    return {
      backgroundColor: `${colorValue}15`,
      borderColor: `${colorValue}30`,
      iconColor: colorValue
    };
  };

  const colorStyles = getColorStyles(color);

  return (
    <div className={`group relative ${className}`}>
      <Link href={`/categories/${id}`} className="block">
        <div 
          className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          style={{
            backgroundColor: colorStyles.backgroundColor,
            borderColor: colorStyles.borderColor
          }}
        >
          {/* 分类图标和标题 */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Folder 
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" 
                  style={{ color: colorStyles.iconColor }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {name}
                </h3>
                {showBookmarkCount && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {bookmark_count} 个书签
                  </p>
                )}
              </div>
            </div>

            {/* 外部链接图标 */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>
          </div>

          {/* 描述 */}
          {description && (
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
              {description}
            </p>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* 颜色指示器 */}
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-500 truncate">
                {new Date(category.created_at || '').toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* 进度条（基于书签数量） */}
            {showBookmarkCount && bookmark_count > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: color,
                      width: `${Math.min((bookmark_count / 20) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {bookmark_count > 20 ? '20+' : bookmark_count}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* 操作菜单 */}
      {showActions && (onEdit || onDelete) && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button 
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 这里可以添加下拉菜单逻辑
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* 下拉菜单 - 可以后续扩展 */}
            {/* <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  编辑
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  删除
                </button>
              )}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;