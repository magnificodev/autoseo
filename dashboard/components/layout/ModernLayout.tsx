'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Globe, 
  Target, 
  FileText, 
  Users, 
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import MobileMenu from './MobileMenu';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export default function ModernLayout({ children }: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const pathname = usePathname();

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Sites', href: '/sites', icon: Globe },
    { name: 'Keywords', href: '/keywords', icon: Target },
    { name: 'Content Queue', href: '/content-queue', icon: FileText },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="modern-dashboard">
      {/* Mobile Menu */}
      <MobileMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`modern-nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="modern-nav-icon" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </MobileMenu>

      {/* Sidebar */}
      <aside className={`modern-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="modern-sidebar-header">
          <Link href="/dashboard" className="modern-sidebar-logo">
            AutoSEO
          </Link>
        </div>

        {/* Navigation */}
        <nav className="modern-sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`modern-nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="modern-nav-icon" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">admin@autoseo.com</p>
            </div>
            <button className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="modern-header">
          <div className="modern-header-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden modern-action-btn"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="modern-breadcrumb">
              Dashboard / Overview
            </div>
          </div>

          <div className="modern-header-right">
            {/* Search */}
            <div className="modern-search">
              <Search className="modern-search-icon" />
              <input
                type="text"
                placeholder="Search for anything..."
                className="modern-search-input"
              />
            </div>

            {/* Header Actions */}
            <div className="modern-header-actions">
              <button className="modern-action-btn">
                <Bell className="w-5 h-5" />
              </button>
              
              <button onClick={toggleTheme} className="modern-action-btn">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <div className="relative">
                <button className="modern-user-avatar">
                  J
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="modern-main">
          {children}
        </main>
      </div>
    </div>
  );
}
