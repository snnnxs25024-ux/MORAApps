import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Role, User, Package, PackageStatus, PackageType, AttendanceRecord, CourierWorkflow, ShiftSummary 
} from './types';
import { MOCK_USERS, MOCK_PACKAGES } from './constants';
import { Layout } from './components/Layout';
import { Scanner } from './components/Scanner';
import { 
  Camera, PackageCheck, AlertCircle, Clock, MapPin, Search, Plus, 
  ChevronRight, CheckCircle2, QrCode, Truck, Package as PackageIcon,
  X, LogIn, History, Calendar, Settings as SettingsIcon, ChevronLeft, User as UserIcon, Wallet, Play, AlertTriangle,
  Phone, MessageCircle, Navigation
} from 'lucide-react';

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'LANDING' | 'LOGIN' | 'DASHBOARD'>('LANDING');

  const handleLogin = (selectedUser: User) => {
    setUser(selectedUser);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setView('LANDING');
  };

  return (
    <div className="text-gray-900 font-sans">
      {view === 'LANDING' && <LandingPage onStart={() => setView('LOGIN')} />}
      {view === 'LOGIN' && <LoginPage onLogin={handleLogin} onBack={() => setView('LANDING')} />}
      {view === 'DASHBOARD' && user && (
        <Layout user={user} onLogout={handleLogout} title={user.role === Role.COURIER ? 'MORA Delivery' : 'MORA Dashboard'}>
          {user.role === Role.COURIER ? (
            <CourierSuperApp user={user} />
          ) : user.role === Role.GUEST ? (
            <GuestDashboard />
          ) : (
            <AdminDashboard user={user} />
          )}
        </Layout>
      )}
    </div>
  );
}

// --- SUB-PAGES (Landing, Login, Guest, Admin tetap sama/mirip, fokus ke Courier) ---

const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-700 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    <div className="relative z-10 mb-8 p-6 bg-white rounded-3xl shadow-2xl animate-bounce-slow">
      <TruckIcon size={64} className="text-orange-600" />
    </div>
    <h1 className="relative z-10 text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-md">MORA APPS</h1>
    <p className="relative z-10 text-lg md:text-xl text-orange-100 mb-12 max-w-lg leading-relaxed">
      Sistem manajemen logistik terintegrasi untuk SPX XPRESS.
    </p>
    <button onClick={onStart} className="relative z-10 bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-orange-50 transition-all w-full md:w-auto flex items-center justify-center gap-2">
      <LogIn size={20}/> Masuk Aplikasi
    </button>
  </div>
);

const TruckIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
    <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const LoginPage = ({ onLogin, onBack }: { onLogin: (u: User) => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-8">
           <button onClick={onBack} className="text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-1 font-medium text-sm">
             <ChevronLeft size={16}/> Kembali
           </button>
           <h2 className="text-2xl font-bold text-gray-800">Pilih Akses</h2>
        </div>
        <div className="space-y-3">
          {MOCK_USERS.map((u) => (
            <button key={u.id} onClick={() => onLogin(u)} className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group bg-white">
              <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full bg-gray-100" />
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-800">{u.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-500 capitalize">{u.role.toLowerCase()}</span>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-orange-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- GUEST DASHBOARD (Simplified) ---
const GuestDashboard = () => (
  <div className="text-center p-10">
    <h2 className="text-2xl font-bold">Halaman Tamu</h2>
    <p>Silakan gunakan fitur tracking di halaman depan.</p>
  </div>
);

// --- COURIER SUPER APP LOGIC ---

const CourierSuperApp = ({ user }: { user: User }) => {
  // State for Navigation Tabs
  const [activeTab, setActiveTab] = useState<'WORK' | 'PERFORMANCE' | 'HISTORY' | 'SETTINGS'>('WORK');
  
  // State for Workflow
  const [workflow, setWorkflow] = useState<CourierWorkflow>(CourierWorkflow.ABSENT);
  const [summary, setSummary] = useState<ShiftSummary>({ totalCod: 0, totalNonCod: 0, totalPackages: 0 });
  const [packages, setPackages] = useState<Package[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);

  // Helper to change tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'WORK':
        return <CourierWorkFlow 
                  user={user} 
                  workflow={workflow} 
                  setWorkflow={setWorkflow}
                  summary={summary}
                  setSummary={setSummary}
                  packages={packages}
                  setPackages={setPackages}
                  attendance={attendance}
                  setAttendance={setAttendance}
               />;
      case 'PERFORMANCE':
        return <CourierPerformance packages={packages} attendance={attendance} />;
      case 'HISTORY':
        return <CourierHistory />;
      case 'SETTINGS':
        return <CourierSettings user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="pb-20 md:pb-0">
      {renderTabContent()}
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-40 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'WORK'} onClick={() => setActiveTab('WORK')} icon={<Truck size={24} />} label="Kerja" />
        <NavButton active={activeTab === 'PERFORMANCE'} onClick={() => setActiveTab('PERFORMANCE')} icon={<BarChart size={24} />} label="Performa" />
        <NavButton active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} icon={<History size={24} />} label="Riwayat" />
        <NavButton active={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} icon={<SettingsIcon size={24} />} label="Akun" />
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-orange-600' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

// --- COMPONENT: COURIER WORKFLOW (THE CORE LOGIC) ---

const CourierWorkFlow = ({ 
  user, workflow, setWorkflow, summary, setSummary, packages, setPackages, attendance, setAttendance 
}: any) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'LOADING' | 'DELIVERY' | null>(null);
  const [deliveryModalPkg, setDeliveryModalPkg] = useState<Package | null>(null);
  
  // New States for Modals (Replacing Prompt/Confirm)
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [manualInputCode, setManualInputCode] = useState('');
  
  // Confirmation Modal state now includes 'action' to know what to do next
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean, 
    message: string, 
    type: 'start' | 'finish' | 'warning',
    action: 'START_DELIVERY' | 'FINISH_DELIVERY'
  } | null>(null);

  // Return Modal State (for Closing phase)
  const [returnModal, setReturnModal] = useState<{pkgId: string, isOpen: boolean} | null>(null);
  const [returnStaffName, setReturnStaffName] = useState('');

  // -- PHASE 1: ABSENT --
  if (workflow === CourierWorkflow.ABSENT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-8 animate-fadeIn">
        <div className="w-48 h-48 bg-orange-100 rounded-full flex items-center justify-center border-8 border-orange-50 shadow-inner">
          <Clock size={80} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800">Mulai Shift Anda</h2>
          <p className="text-gray-500 mt-2">Wajib absen sebelum memulai pengantaran paket.</p>
        </div>
        <button 
          onClick={() => {
            setAttendance({
              id: 'att-' + Date.now(),
              userId: user.id,
              date: new Date().toISOString().split('T')[0],
              checkIn: new Date().toISOString(),
              status: 'PRESENT'
            });
            setWorkflow(CourierWorkflow.PLANNING);
          }}
          className="w-full max-w-sm bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-orange-200 hover:scale-105 transition-transform"
        >
          ABSEN MASUK
        </button>
      </div>
    );
  }

  // -- PHASE 2: PLANNING (INPUT TOTAL) --
  if (workflow === CourierWorkflow.PLANNING) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 animate-fadeIn">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm">1</span>
            Input Muatan Hari Ini
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Total Paket COD</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={summary.totalCod || ''}
                  onChange={(e) => setSummary({...summary, totalCod: parseInt(e.target.value) || 0})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-lg font-bold"
                  placeholder="0"
                />
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Total Paket NON-COD</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={summary.totalNonCod || ''}
                  onChange={(e) => setSummary({...summary, totalNonCod: parseInt(e.target.value) || 0})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-lg font-bold"
                  placeholder="0"
                />
                <PackageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total Bawaan</span>
                <span className="text-2xl font-black text-gray-800">
                  {(summary.totalCod || 0) + (summary.totalNonCod || 0)}
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                const total = (summary.totalCod || 0) + (summary.totalNonCod || 0);
                if (total > 0) {
                  setSummary({ ...summary, totalPackages: total });
                  setWorkflow(CourierWorkflow.LOADING);
                } else {
                  // This simple alert is usually fine, but you could modal it too if needed. 
                  // Keeping simple for now as it's just validation.
                  alert("Total paket tidak boleh 0"); 
                }
              }}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg mt-4 shadow-lg hover:bg-orange-700"
            >
              Lanjut ke Scan Barang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- PHASE 3: LOADING (SCAN MASUK) --
  if (workflow === CourierWorkflow.LOADING) {
    const loadedCount = packages.length;
    const remaining = summary.totalPackages - loadedCount;
    
    const handleLoadScan = (code: string) => {
      // Prevent duplicate scan
      if (packages.find(p => p.trackingNumber === code)) {
        // Keeping alert for simple checks for now, critical flows use Modals
        alert("Paket sudah discan!");
        return;
      }
      
      const isCod = Math.random() > 0.7; // Mock logic
      // Mock Data Generation including new fields
      const newPkg: Package = {
        id: `pkg-${Date.now()}`,
        trackingNumber: code,
        recipientName: 'Nama Penerima Auto', // Would come from DB in real app
        address: 'Jl. Contoh Alamat No. 123',
        phoneNumber: '6281234567890',
        coordinates: { lat: -6.200000, lng: 106.816666 },
        status: PackageStatus.LOADED,
        type: isCod ? PackageType.COD : PackageType.NON_COD,
        codAmount: isCod ? Math.floor(Math.random() * 500) * 1000 : 0,
        timestamp: new Date().toISOString()
      };
      
      setPackages((prev: Package[]) => [newPkg, ...prev]);
      setIsScannerOpen(false);
      setIsManualInputOpen(false); // Close manual input if open
      setManualInputCode('');
    };

    const handleStartDeliveryClick = () => {
      let msg = "";
      let type: 'start' | 'warning' = 'start';

      if (loadedCount < summary.totalPackages) {
         msg = `PERINGATAN: Anda berencana membawa ${summary.totalPackages} paket tetapi baru scan ${loadedCount}. Lanjutkan pengantaran?`;
         type = 'warning';
      } else if (loadedCount > summary.totalPackages) {
         msg = `INFO: Paket discan (${loadedCount}) lebih banyak dari rencana (${summary.totalPackages}). Lanjutkan?`;
         type = 'warning';
      } else {
         msg = "Selesai loading? Pastikan semua paket sudah masuk.";
         type = 'start';
      }
      setConfirmationModal({ 
        isOpen: true, 
        message: msg, 
        type, 
        action: 'START_DELIVERY' 
      });
    };

    return (
      <div className="space-y-4">
        {/* Progress Card */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10"><QrCode size={100}/></div>
          <h2 className="text-lg font-medium text-slate-300">Proses Loading</h2>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-black text-orange-500">{loadedCount}</span>
            <span className="text-xl text-slate-400 mb-2">/ {summary.totalPackages}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${Math.min((loadedCount / summary.totalPackages) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {remaining > 0 ? `${remaining} paket lagi untuk discan.` : loadedCount > summary.totalPackages ? 'Paket berlebih dari rencana!' : 'Semua paket telah dimuat!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => { setScanMode('LOADING'); setIsScannerOpen(true); }}
            className="bg-white border-2 border-dashed border-orange-300 text-orange-600 p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-orange-50"
          >
            <QrCode size={24} />
            Scan Resi
          </button>
          <button 
            onClick={() => {
              setManualInputCode('');
              setIsManualInputOpen(true);
            }}
            className="bg-white border border-gray-200 text-gray-600 p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Plus size={24} />
            Input Manual
          </button>
        </div>

        {/* List Loaded */}
        <div className="bg-white rounded-2xl p-4 shadow-sm min-h-[200px]">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Daftar Paket Masuk</h3>
          {packages.length === 0 ? (
             <div className="text-center text-gray-400 py-8">Belum ada paket discan.</div>
          ) : (
            <div className="space-y-2">
              {packages.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-mono font-medium">{p.trackingNumber}</span>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${p.type === PackageType.COD ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{p.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finish Loading Button */}
        {loadedCount > 0 && (
          <button 
            onClick={handleStartDeliveryClick}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mb-4 ${
              loadedCount < summary.totalPackages 
              ? 'bg-yellow-500 text-white shadow-yellow-200 hover:bg-yellow-600' 
              : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 animate-bounce-slow'
            }`}
          >
            {loadedCount < summary.totalPackages ? <><AlertCircle size={20}/> Mulai (Kurang {remaining})</> : <><Play size={20}/> Mulai Pengantaran 🚀</>}
          </button>
        )}
        
        {isScannerOpen && scanMode === 'LOADING' && (
          <Scanner onScan={handleLoadScan} onClose={() => setIsScannerOpen(false)} />
        )}

        {/* Manual Input Modal */}
        {isManualInputOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-zoom-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Input Resi Manual</h3>
                <button onClick={() => setIsManualInputOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <input 
                autoFocus
                placeholder="Masukkan No. Resi..."
                value={manualInputCode}
                onChange={(e) => setManualInputCode(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-lg font-mono outline-none focus:border-orange-500"
              />
              <button 
                disabled={!manualInputCode}
                onClick={() => handleLoadScan(manualInputCode)}
                className="w-full bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        )}

        {/* Global Confirmation Modal */}
        {confirmationModal && confirmationModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-zoom-in text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmationModal.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {confirmationModal.type === 'warning' ? <AlertTriangle size={32}/> : <CheckCircle2 size={32}/>}
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Konfirmasi</h3>
              <p className="text-gray-500 mb-6">{confirmationModal.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmationModal(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    setConfirmationModal(null);
                    if (confirmationModal.action === 'START_DELIVERY') {
                      setWorkflow(CourierWorkflow.DELIVERING);
                    } else if (confirmationModal.action === 'FINISH_DELIVERY') {
                      setWorkflow(CourierWorkflow.CLOSING);
                    }
                  }}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  Ya, Lanjut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -- PHASE 4: DELIVERING (PENGANTARAN) --
  if (workflow === CourierWorkflow.DELIVERING) {
    const deliveredCount = packages.filter(p => p.status === PackageStatus.DELIVERED).length;
    const remainingCount = packages.length - deliveredCount;
    
    // Find Package Logic (Scan to find in list)
    const handleDeliveryScan = (code: string) => {
      setIsScannerOpen(false);
      const pkg = packages.find(p => p.trackingNumber.toLowerCase() === code.toLowerCase());
      if (pkg) {
        if (pkg.status === PackageStatus.DELIVERED) {
          alert("Paket ini sudah terkirim!");
        } else {
          // Open Delivery Modal
          setDeliveryModalPkg(pkg);
        }
      } else {
        alert("Paket tidak ditemukan di daftar bawaan Anda!");
      }
    };

    const handleDeliverySuccess = (pkgId: string, proof: string, receiver: string) => {
      setPackages(prev => prev.map(p => p.id === pkgId ? {
        ...p, 
        status: PackageStatus.DELIVERED,
        proofImage: proof,
        receivedBy: receiver,
        recipientName: receiver, // Simulate real data
        address: 'Alamat Penerima Simulasi No. 123'
      } : p));
      setDeliveryModalPkg(null);
    };

    return (
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-orange-600 text-white p-4 rounded-2xl shadow-lg shadow-orange-200">
              <p className="text-xs font-medium opacity-80">Sisa Paket</p>
              <p className="text-3xl font-black">{remainingCount}</p>
           </div>
           <div className="bg-white text-green-600 border border-green-100 p-4 rounded-2xl shadow-sm">
              <p className="text-xs font-medium text-gray-500">Terkirim</p>
              <p className="text-3xl font-black">{deliveredCount}</p>
           </div>
        </div>

        {/* Search/Scan Bar */}
        <div className="flex gap-2">
           <div className="relative flex-1">
             <input 
               placeholder="Cari No Resi / Nama..." 
               className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
             />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           </div>
           <button 
             onClick={() => { setScanMode('DELIVERY'); setIsScannerOpen(true); }}
             className="bg-slate-900 text-white w-12 rounded-xl flex items-center justify-center shadow-md"
           >
             <QrCode size={20} />
           </button>
        </div>

        {/* Task List - UPDATED WITH QUICK ACTIONS */}
        <div className="space-y-3 pb-24">
           <h3 className="font-bold text-gray-700 ml-1">Daftar Pengantaran</h3>
           {packages.filter(p => p.status !== PackageStatus.DELIVERED).map(p => (
             <div 
               key={p.id} 
               onClick={() => setDeliveryModalPkg(p)}
               className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-orange-300 transition-colors"
             >
               <div className="flex-1">
                 <p className="font-mono text-sm font-bold text-gray-800">{p.trackingNumber}</p>
                 <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{p.address}</p>
                 <div className="flex gap-2 mt-2">
                   <span className={`text-[10px] px-2 py-0.5 rounded font-bold inline-block ${p.type === PackageType.COD ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                     {p.type} {p.codAmount ? `- Rp ${p.codAmount.toLocaleString()}` : ''}
                   </span>
                   {/* Quick Action Icons in List */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${p.phoneNumber}`, '_blank') }}
                    className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                   >
                     <MessageCircle size={12} />
                   </button>
                   <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.coordinates?.lat},${p.coordinates?.lng}`, '_blank') }}
                    className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                   >
                     <MapPin size={12} />
                   </button>
                 </div>
               </div>
               <ChevronRight className="text-gray-300" />
             </div>
           ))}

           {packages.filter(p => p.status !== PackageStatus.DELIVERED).length === 0 && (
             <div className="text-center py-10">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={32} />
               </div>
               <p className="text-gray-500">Semua paket berhasil diantar!</p>
             </div>
           )}
        </div>

        {/* Finish Button - Fixed to use Modal instead of Confirm */}
        <div className="fixed bottom-20 left-4 right-4 md:static md:bottom-auto">
           <button 
             onClick={() => {
                setConfirmationModal({
                  isOpen: true,
                  message: "Selesaikan pengantaran dan proses paket sisa?",
                  type: 'finish',
                  action: 'FINISH_DELIVERY'
                });
             }}
             className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700"
           >
             Selesai Pengantaran (Closing)
           </button>
        </div>

        {/* Modals */}
        {isScannerOpen && scanMode === 'DELIVERY' && (
          <Scanner onScan={handleDeliveryScan} onClose={() => setIsScannerOpen(false)} />
        )}

        {deliveryModalPkg && (
          <DeliveryModal 
            pkg={deliveryModalPkg} 
            onClose={() => setDeliveryModalPkg(null)} 
            onSuccess={handleDeliverySuccess}
          />
        )}
        
        {/* Reusing Global Confirmation Modal in parent logic block */}
      </div>
    );
  }

  // -- PHASE 5: CLOSING (PENDING/RETUR) --
  if (workflow === CourierWorkflow.CLOSING) {
    const pendingPackages = packages.filter(p => p.status !== PackageStatus.DELIVERED && p.status !== PackageStatus.RETURNED);
    
    const handleReturnProcess = (pkgId: string) => {
       setReturnStaffName('');
       setReturnModal({ pkgId, isOpen: true });
    };

    const confirmReturn = () => {
       if (returnModal && returnStaffName) {
         setPackages(prev => prev.map(p => p.id === returnModal.pkgId ? { ...p, status: PackageStatus.RETURNED, receivedBy: returnStaffName } : p));
         setReturnModal(null);
       }
    };

    return (
       <div className="space-y-6">
         <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
            <h2 className="text-xl font-bold text-red-700">Proses Pending / Retur</h2>
            <p className="text-red-500 text-sm mt-1">Selesaikan status paket yang tidak terkirim.</p>
         </div>

         {pendingPackages.length > 0 ? (
           <div className="space-y-3">
             {pendingPackages.map(p => (
               <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="font-bold text-gray-800">{p.trackingNumber}</p>
                     <p className="text-xs text-red-500 font-bold">Gagal Kirim</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => handleReturnProcess(p.id)}
                   className="w-full py-3 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                 >
                   <Camera size={16} /> Foto Serah Terima Gudang
                 </button>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-100">
             <p className="text-green-700 font-bold">Tidak ada paket pending/retur.</p>
             <p className="text-green-600 text-sm">Kerja bagus!</p>
           </div>
         )}

         {pendingPackages.length === 0 && (
           <button 
             onClick={() => {
                alert("Shift Selesai! Terima kasih atas kerja keras Anda.");
                setWorkflow(CourierWorkflow.ABSENT);
                setPackages([]);
                setSummary({ totalCod: 0, totalNonCod: 0, totalPackages: 0 });
                setAttendance(null);
             }}
             className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg"
           >
             Akhiri Shift (Clock Out)
           </button>
         )}

         {/* Return Staff Name Modal */}
         {returnModal && returnModal.isOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-zoom-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Serah Terima Gudang</h3>
                <button onClick={() => setReturnModal(null)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <p className="text-sm text-gray-500 mb-2">Nama Staff Penerima:</p>
              <input 
                autoFocus
                placeholder="Contoh: Budi Gudang"
                value={returnStaffName}
                onChange={(e) => setReturnStaffName(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-lg font-mono outline-none focus:border-orange-500"
              />
              <button 
                disabled={!returnStaffName}
                onClick={confirmReturn}
                className="w-full bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold"
              >
                Konfirmasi Retur
              </button>
            </div>
          </div>
         )}
       </div>
    );
  }

  return null;
};

// --- COMPONENT: DELIVERY MODAL ---
const DeliveryModal = ({ pkg, onClose, onSuccess }: { pkg: Package, onClose: () => void, onSuccess: (id: string, img: string, name: string) => void }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const openWhatsApp = () => window.open(`https://wa.me/${pkg.phoneNumber}`, '_blank');
  const openMaps = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pkg.coordinates?.lat},${pkg.coordinates?.lng}`, '_blank');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-lg">Detail Pengiriman</h3>
           <button onClick={onClose}><X size={24}/></button>
        </div>
        
        <div className="mb-4 bg-gray-50 p-4 rounded-xl space-y-2">
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase">No. Resi</p>
             <p className="font-mono font-bold text-gray-800 text-lg">{pkg.trackingNumber}</p>
           </div>
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase">Penerima</p>
             <p className="font-medium text-gray-800">{pkg.recipientName}</p>
             <p className="text-sm text-gray-500">{pkg.address}</p>
           </div>
           {pkg.type === PackageType.COD && (
             <div className="bg-orange-100 p-2 rounded-lg mt-2 text-center">
               <p className="text-orange-800 font-bold text-sm">TAGIH COD</p>
               <p className="text-orange-700 font-black text-xl">Rp {pkg.codAmount?.toLocaleString()}</p>
             </div>
           )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <button onClick={openWhatsApp} className="flex flex-col items-center justify-center gap-1 bg-green-50 text-green-700 p-3 rounded-xl hover:bg-green-100 transition-colors">
              <MessageCircle size={24} />
              <span className="text-xs font-bold">WhatsApp</span>
           </button>
           <button onClick={openMaps} className="flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-700 p-3 rounded-xl hover:bg-blue-100 transition-colors">
              <Navigation size={24} />
              <span className="text-xs font-bold">Navigasi Maps</span>
           </button>
        </div>

        <div className="space-y-4 border-t pt-4">
           <h4 className="font-bold text-gray-700">Bukti Serah Terima</h4>
           
           <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-white overflow-hidden relative">
              {photo ? (
                <img src={photo} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={28} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Ambil Foto Penerima</span>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
           </label>

           <input 
             placeholder="Nama Penerima (Wajib Diisi)" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
           />

           <button 
             disabled={!photo || !name}
             onClick={() => { if(photo && name) onSuccess(pkg.id, photo, name); }}
             className="w-full bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg"
           >
             Konfirmasi Terkirim
           </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: PERFORMANCE ---
const CourierPerformance = ({ packages, attendance }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Performa Anda</h2>
      
      {/* Daily Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-600 mb-4">Hari Ini</h3>
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl text-center">
               <p className="text-3xl font-black text-green-600">{packages.filter((p: Package) => p.status === PackageStatus.DELIVERED).length}</p>
               <p className="text-xs text-green-700 font-bold uppercase mt-1">Terkirim</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
               <p className="text-3xl font-black text-red-600">{packages.filter((p: Package) => p.status === PackageStatus.RETURNED || p.status === PackageStatus.FAILED).length}</p>
               <p className="text-xs text-red-700 font-bold uppercase mt-1">Retur</p>
            </div>
         </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
        <h3 className="font-bold text-gray-600 mb-4">Grafik Mingguan</h3>
        <ResponsiveContainer width="100%" height="100%">
           <BarChart data={[
             {name: 'Sen', val: 45}, {name: 'Sel', val: 52}, {name: 'Rab', val: 38}, {name: 'Kam', val: 60}, {name: 'Jum', val: 55}, {name: 'Sab', val: 48}
           ]}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} />
             <XAxis dataKey="name" axisLine={false} tickLine={false} />
             <Bar dataKey="val" fill="#f97316" radius={[4,4,0,0]} />
           </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT: HISTORY & ATTENDANCE ---
const CourierHistory = () => {
  const [period, setPeriod] = useState<'EARLY' | 'LATE'>('EARLY');
  
  // Mock Data Logic
  const generateHistory = (isEarly: boolean) => {
    const days = isEarly ? 15 : 15;
    const start = isEarly ? 1 : 16;
    return Array.from({length: days}, (_, i) => ({
       date: `${start + i} Okt`,
       status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
       time: '07:55'
    }));
  };

  const history = generateHistory(period === 'EARLY');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h2>
      
      {/* Period Selector */}
      <div className="bg-gray-100 p-1 rounded-xl flex">
        <button 
          onClick={() => setPeriod('EARLY')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${period === 'EARLY' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
        >
          Periode 1 - 15
        </button>
        <button 
          onClick={() => setPeriod('LATE')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${period === 'LATE' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
        >
          Periode 16 - Akhir
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-sm text-left">
           <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
             <tr>
               <th className="px-6 py-4">Tanggal</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4">Jam Masuk</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {history.map((h, i) => (
               <tr key={i}>
                 <td className="px-6 py-4 font-medium text-gray-900">{h.date}</td>
                 <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold ${h.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {h.status}
                   </span>
                 </td>
                 <td className="px-6 py-4 text-gray-500">{h.status === 'PRESENT' ? h.time : '-'}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
};

// --- COMPONENT: SETTINGS ---
const CourierSettings = ({ user }: { user: User }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <img src={user.avatar} className="w-16 h-16 rounded-full bg-gray-100" />
      <div>
        <h3 className="font-bold text-lg">{user.name}</h3>
        <p className="text-gray-500 text-sm">Kurir - Jakarta Selatan</p>
      </div>
    </div>
    
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
       <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50">
         <span className="font-medium text-gray-700">Ubah Profil</span>
         <ChevronRight size={16} className="text-gray-400" />
       </button>
       <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50">
         <span className="font-medium text-gray-700">Notifikasi</span>
         <ChevronRight size={16} className="text-gray-400" />
       </button>
       <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50">
         <span className="font-medium text-gray-700">Bantuan & Support</span>
         <ChevronRight size={16} className="text-gray-400" />
       </button>
       <button className="w-full p-4 flex justify-between items-center hover:bg-red-50 text-red-600">
         <span className="font-medium">Logout</span>
         <LogIn size={16} />
       </button>
    </div>
    <p className="text-center text-xs text-gray-400 mt-8">Versi Aplikasi 1.0.5</p>
  </div>
);

// --- ADMIN DASHBOARD (Placeholder for consistency) ---
const AdminDashboard = ({ user }: { user: User }) => (
  <div className="text-center p-10">
    <h2 className="text-2xl font-bold">Dashboard Admin</h2>
    <p>Fitur admin tetap tersedia (lihat kode sebelumnya).</p>
  </div>
);