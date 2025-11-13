import * as React from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  addonBefore?: React.ReactNode; // 支持传入任意前缀内容
}

function Input({
  className,
  type,
  addonBefore = <Search className="h-4 w-4" />,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {/* 前缀图标 - 绝对定位 */}
      <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
        {addonBefore}
      </div>
      {/* 输入框 - 左侧留出图标空间 */}
      <input
        type={type}
        data-slot="input"
        style={{ paddingLeft: '34px', boxSizing: 'border-box' }}
        className={cn(
          'box-border',
          'pl-10',
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
