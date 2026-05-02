import React from 'react';

export interface FolderCardProps {
  children: React.ReactNode;
  tabTitle?: string;
  tabIcon?: React.ReactNode;
  variant?: 'dark' | 'light';
  className?: string;
  tabClassName?: string;
  bodyClassName?: string;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  children,
  tabTitle,
  tabIcon,
  variant = 'dark',
  className = '',
  tabClassName = '',
  bodyClassName = '',
}) => {
  const isDark = variant === 'dark';
  
  // Colors based on the variant
  const bodyBg = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const backTab1Bg = isDark ? 'bg-indigo-500/20' : 'bg-indigo-50/80';
  const backTab2Bg = isDark ? 'bg-indigo-400/30' : 'bg-indigo-100/80';
  
  return (
    <div className={`relative group ${className}`}>
      {/* Decorative back tabs for the "stack" effect */}
      <div 
        className={`absolute top-[-12px] left-4 right-12 h-10 ${backTab1Bg} rounded-t-xl rotate-[-3deg] origin-bottom-left transition-all duration-300 group-hover:rotate-[-5deg] group-hover:-translate-y-1 shadow-sm`} 
      />
      <div 
        className={`absolute top-[-6px] left-2 right-6 h-10 ${backTab2Bg} rounded-t-xl rotate-[-1.5deg] origin-bottom-left transition-all duration-300 group-hover:rotate-[-2.5deg] group-hover:-translate-y-0.5 shadow-sm`} 
      />
      
      {/* Main Folder Container */}
      <div className="relative">
        {/* Tab */}
        <div className={`inline-flex items-center px-6 h-12 ${bodyBg} rounded-t-xl relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${tabClassName}`}>
          {tabIcon && <span className="mr-2.5 flex-shrink-0">{tabIcon}</span>}
          {tabTitle && <span className={`font-semibold text-sm ${textColor} whitespace-nowrap`}>{tabTitle}</span>}
          
          {/* SVG for the smooth inner curve between tab and body */}
          <svg 
            className={`absolute bottom-0 -right-5 w-5 h-5 ${isDark ? 'text-slate-900' : 'text-white'} fill-current`}
            viewBox="0 0 20 20"
          >
            <path d="M0 0 Q0 20 20 20 L0 20 Z" />
          </svg>
        </div>
        
        {/* Body */}
        <div className={`${bodyBg} rounded-3xl rounded-tl-none p-6 shadow-xl relative z-10 ${textColor} border ${isDark ? 'border-white/5' : 'border-gray-100'} ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
