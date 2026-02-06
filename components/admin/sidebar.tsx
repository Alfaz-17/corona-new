"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Grid3X3, 
  Award, 
  FileText, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/contexts/auth-context';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
    // Redirect handled by layout or protected route wrapper ideally, 
    // but the layout will redirect when user becomes null.
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full bg-[#0B1120] text-white transition-all duration-300 ease-in-out border-r border-white/10 shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          "w-72" // Mobile width always full
        )}
      >
        {/* Header / Logo */}
        <div className={cn(
          "flex items-center h-20 px-6 border-b border-white/10 relative",
          collapsed ? "lg:justify-center lg:px-2" : "justify-between"
        )}>
           {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
               <Logo variant="white" size="sm" />
            </Link>
           ) : (
            <Link href="/" className="flex items-center justify-center w-full">
               <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-primary">
                 C
               </div>
            </Link>
           )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-accent text-primary shadow-md hover:bg-white transition-colors border border-white/10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100%-5rem)] justify-between py-6">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                    active 
                      ? "bg-accent/10 text-accent font-medium shadow-sm" 
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                    collapsed && "justify-center px-2"
                  )}
                >
                  {/* Active Indicator Line (Left) */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-accent rounded-r-full" />
                  )}

                  <Icon className={cn(
                    "flex-shrink-0 transition-colors",
                    active ? "text-accent" : "text-gray-400 group-hover:text-white",
                    collapsed ? "w-6 h-6" : "w-5 h-5 mr-3"
                  )} />

                  {!collapsed && (
                    <span className="truncate text-sm tracking-wide">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Hover Tooltip for Collapsed State */}
                  {collapsed && (
                    <div className="absolute left-full active:hidden ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="px-3">
            <div className={cn(
              "rounded-2xl bg-white/5 border border-white/5 p-4 transition-all duration-300",
              collapsed ? "p-2 bg-transparent border-0" : ""
            )}>
              {!collapsed ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white transition-all group"
                  >
                    <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 items-center">
                   <div 
                    title={user?.name || 'Admin'}
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-help"
                   >
                      {user?.name?.charAt(0) || 'A'}
                   </div>
                   <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
