import { Outlet } from 'react-router';
import { Bell } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Layout() {
  return (
    <div className={cn('w-screen', 'text-white min-h-screen p-4 font-sans')}>
      <div className="max-w-6xl mx-auto grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr] gap-6">
        {/* 左侧导航 */}
        <AppSidebar />

        {/* 右侧主体 */}
        <main className="flex flex-col gap-2">
          <header
            className={cn('flex gap-4 items-center justify-between', 'h-16')}
          >
            {/* 欢迎语 */}
            <ConnectButton />
            {/* 搜索栏 */}
            <div className="flex gap-3 items-center">
              <Input />
              <Bell className="w-5 h-5" />
            </div>
            {/* 个人信息 */}
            <div className="flex gap-2">
              <span>Evan</span>
              <Avatar className="w-6 h-6 rounded-3xl overflow-hidden">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
