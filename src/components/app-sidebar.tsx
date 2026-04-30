import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Folder,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import LogoIcon from '../assets/images/ic_logo.png';
import { cn } from '@/lib/utils';

const items = [
  {
    title: 'Dashboard',
    url: 'dashboard',
    icon: Home,
  },
  {
    title: 'Trade',
    url: 'trade',
    icon: Inbox,
  },
  {
    title: 'Deposits',
    url: 'deposits',
    icon: Calendar,
  },
  {
    title: 'Protocols',
    url: 'protocols',
    icon: Search,
  },
  {
    title: 'Profile',
    url: 'profile',
    icon: Folder,
  },
  {
    title: 'Settings',
    url: 'settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  return (
    <div className="space-y-4">
      <div className={cn('flex items-center justify-center')}>
        <img src={LogoIcon} width="32px" />
      </div>
      <nav className="rounded-xl p-8">
        <ul className="space-y-8">
          {items.map((item) => {
            return (
              <li>
                <span
                  className="flex items-center gap-2 p-2 text-black cursor-pointer border border-[#e6e1e1] rounded-[6px]"
                  onClick={() => navigate(item.url)}
                >
                  <item.icon className="text-[#c6c6c6] w-5 h-5" />
                  {/* <span>{item.title}</span> */}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col items-center gap-3">
        {/* {isDark ? (
          <span
            className="flex items-center gap-2 p-2 text-black cursor-pointer border border-[#e6e1e1] rounded-[6px]"
            onClick={() => toggleTheme('light')}
          >
            <Sun className="text-[#c6c6c6] w-5 h-5" />
          </span>
        ) : (
          <span
            className="flex items-center gap-2 p-2 text-black cursor-pointer border border-[#e6e1e1] rounded-[6px]"
            onClick={() => toggleTheme('dark')}
          >
            <Moon className="text-[#c6c6c6] w-5 h-5" />
          </span>
        )} */}
        <div className="relative p-2 border border-[#e6e1e1] rounded-[6px]">
          {/* 太阳图标：仅在暗色模式显示，亮色时旋转并隐藏 */}
          <Sun
            className={`w-5 h-5 text-[#c6c6c6] transition-all duration-300 cursor-pointer ${
              isDark
                ? 'rotate-90 opacity-0 scale-50'
                : 'rotate-0 opacity-100 scale-100'
            }`}
            onClick={toggleTheme}
          />

          {/* 月亮图标：仅在亮色模式显示，暗色色时反向旋转并隐藏 */}
          <Moon
            className={`w-5 h-5 text-[#c6c6c6] transition-all duration-300 cursor-pointer ${
              isDark
                ? 'rotate-0 opacity-100 scale-100'
                : '-rotate-90 opacity-0 scale-50'
            }`}
            onClick={toggleTheme}
          />
        </div>
      </div>
    </div>
  );
}
