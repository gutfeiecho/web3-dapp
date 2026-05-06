import { Outlet } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Layout() {
  return (
    <div
      className={cn('w-screen', 'text-[#c6c6c6] min-h-screen p-4 font-sans')}
    >
      <div className="flex">
        {/* 左侧导航 */}
        <AppSidebar />

        {/* 右侧主体 */}
        <main className="flex flex-col gap-2 w-full">
          <header
            className={cn('flex gap-4 items-start justify-between', 'h-16')}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  'py-2 px-3',
                  'text-sm text-black',
                  'bg-white rounded'
                )}
              >
                <span>Market Cap:</span>
                <span>+1.42%</span>
              </div>
              <div
                className={cn(
                  'py-2 px-3',
                  'text-sm text-black',
                  'bg-white rounded'
                )}
              >
                <span>24h Vol:</span>
                <span>+1.42%</span>
              </div>
              <div
                className={cn(
                  'py-2 px-3',
                  'text-sm text-black',
                  'bg-white rounded'
                )}
              >
                <span>ETH Gas:</span>
                <span>+1.42%</span>
              </div>
              <div
                className={cn(
                  'py-2 px-3',
                  'text-sm text-black',
                  'bg-white rounded'
                )}
              >
                <span>Account:</span>
                <span>Binance</span>
              </div>
            </div>
            {/* 个人信息 */}
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6 rounded-3xl overflow-hidden">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="text-black">Evan</span>
              <ConnectButton />
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
