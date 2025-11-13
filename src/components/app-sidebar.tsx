import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
// Menu items.
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
    title: 'Settings',
    url: 'settings',
    icon: Settings,
  },
  {
    title: 'Profile',
    url: 'profile',
    icon: Settings,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <nav className="rounded-xl p-4">
        <ul className="space-y-8">
          {items.map((item) => {
            return (
              <li>
                <span
                  className="flex items-center gap-2 text-white"
                  onClick={() => navigate(item.url)}
                >
                  <item.icon className="text-white" />
                  <span className="text-white">{item.title}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
