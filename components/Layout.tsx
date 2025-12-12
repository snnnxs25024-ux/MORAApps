import React from 'react';
import { Role, User } from '../types';
import { LogOut, LayoutDashboard, Truck, Settings, Package, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title }) => {
  if (!user) return <>{children}</>;

  const isCourier = user.role === Role.COURIER;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-orange-600 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <h1 className="font-bold text-lg">{title || 'MORA Apps'}</h1>
        <div className="flex items-center gap-2">
           <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
           <button onClick={onLogout}><LogOut size={20} /></button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-orange-500 tracking-wider">MORA<span className="text-white">APPS</span></h1>
          <p className="text-xs text-slate-400 mt-1">SPX XPRESS Integration</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          {!isCourier && <SidebarItem icon={<Truck size={20} />} label="Kurir Monitoring" />}
          <SidebarItem icon={<Package size={20} />} label="Data Paket" />
          {!isCourier && <SidebarItem icon={<Settings size={20} />} label="Pengaturan" />}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav (Courier Only) */}
      {isCourier && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-30 pb-safe">
          <NavItem icon={<LayoutDashboard size={24} />} label="Beranda" active />
          <NavItem icon={<Package size={24} />} label="Paket" />
          <NavItem icon={<UserCircle size={24} />} label="Akun" />
        </nav>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

const NavItem = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex flex-col items-center gap-1 ${active ? 'text-orange-600' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </div>
);
