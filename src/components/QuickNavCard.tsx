'use client';

import React, { memo, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickNavCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  iconColor?: string;
  iconBgColor?: string;
}

const QuickNavCard = memo(function QuickNavCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  iconColor = '#3B82F6',
  iconBgColor = '#EFF6FF'
}: QuickNavCardProps) {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.open(href, '_blank');
    }
  }, [onClick, href]);

  return (
    <div
      className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1 border border-gray-200/60 shadow-sm"
      onClick={handleClick}
    >
      {/* 卡片内容 */}
      <div className="flex items-center space-x-3">
        {/* 图标容器 */}
        <div 
          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon 
            size={16} 
            style={{ color: iconColor }}
            className="transition-all duration-200 sm:w-5 sm:h-5"
          />
        </div>
        
        {/* 文字内容 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 leading-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});

export default QuickNavCard;