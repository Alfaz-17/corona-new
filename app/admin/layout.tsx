"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/auth-context';
import { 
  Menu, 
  X, 
  Package, 
  Grid3X3, 
  Award, 
  FileText, 
  LogOut,
  User,
  Home,
  Anchor,
  ShoppingCart
} from 'lucide-react';
import { MarineLoader } from '@/components/common/marine-loader';
import { Logo } from '@/components/common/logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) return <MarineLoader />;
  if (!user && pathname !== '/admin/login') return null;

  // Don't show layout on login page
  if (pathname === '/admin/login') return <>{children}</>;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Grid3X3 },
    { name: 'Brands', href: '/admin/brands', icon: Award },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-primary/75 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-24 px-6 border-b border-white/10">
          <Link href="/" className="flex items-center">
            <Logo variant="white" size="sm" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-none transition-all border-l-4 ${
                  active
                    ? 'bg-white/10 text-accent border-accent shadow-lg'
                    : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/20">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[120px]">
                {user?.name || user?.email || 'Admin'}
              </p>
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Fleet Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white bg-red-600/60 hover:bg-red-600 transition-all shadow-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            End Session
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <Link 
              href="/" 
              className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors"
            >
              View Public Site →
            </Link>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
