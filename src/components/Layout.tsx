import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, PlusCircle, MapPin, HandMetal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, activeView, onViewChange }: LayoutProps) {
  const { user, signIn, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[24px] shadow-sm p-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HandMetal className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">HygieneLog</h1>
          <p className="text-gray-500 mb-8">Hospital Ward Handrub Usage Tracker</p>
          <button
            onClick={signIn}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Sign in with Hospital Account
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entry', label: 'Record Usage', icon: PlusCircle },
    { id: 'locations', label: 'Locations', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar / Top Nav */}
      <nav className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 mb-8 h-12">
          <HandMetal className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight">HygieneLog</span>
        </div>
        
        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                activeView === item.id 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 px-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img src={user.photoURL || ''} alt={user.displayName || 'User'} referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 truncate leading-none mt-0.5">Staff Account</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
