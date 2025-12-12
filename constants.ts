import { Package, PackageStatus, PackageType, Role, User } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u0', name: 'Tamu / Guest', role: Role.GUEST, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' },
  { id: 'u1', name: 'Andi Kurir', role: Role.COURIER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
  { id: 'u2', name: 'Budi PIC', role: Role.PIC, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { id: 'u3', name: 'Citra Admin', role: Role.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Citra' },
];

export const MOCK_PACKAGES: Package[] = [
  { 
    id: 'p1', 
    trackingNumber: 'SPX-ID-882190', 
    recipientName: 'Siti Aminah', 
    address: 'Jl. Melati No. 4, Jakarta Selatan', 
    phoneNumber: '6281234567890',
    coordinates: { lat: -6.2088, lng: 106.8456 },
    status: PackageStatus.PENDING, 
    type: PackageType.NON_COD, 
    timestamp: '2023-10-27T08:00:00Z' 
  },
  { 
    id: 'p2', 
    trackingNumber: 'SPX-ID-112344', 
    recipientName: 'Joko Susilo', 
    address: 'Apartemen Green View, Twr A, Lt 12', 
    phoneNumber: '6281987654321',
    coordinates: { lat: -6.2258, lng: 106.8056 },
    status: PackageStatus.DELIVERED, 
    type: PackageType.COD, 
    codAmount: 150000, 
    timestamp: '2023-10-26T14:30:00Z', 
    proofImage: 'https://picsum.photos/200/300' 
  },
  { 
    id: 'p3', 
    trackingNumber: 'SPX-ID-991231', 
    recipientName: 'PT. Maju Mundur', 
    address: 'Ruko Business Park Block C, Jakarta Pusat', 
    phoneNumber: '6282112345678',
    coordinates: { lat: -6.1751, lng: 106.8650 },
    status: PackageStatus.LOADED, 
    type: PackageType.NON_COD, 
    timestamp: '2023-10-27T09:15:00Z' 
  },
  { 
    id: 'p4', 
    trackingNumber: 'SPX-ID-772123', 
    recipientName: 'Dewi Sartika', 
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat', 
    phoneNumber: '6285712340987',
    coordinates: { lat: -6.1901, lng: 106.7700 },
    status: PackageStatus.FAILED, 
    type: PackageType.COD, 
    codAmount: 50000, 
    timestamp: '2023-10-26T18:00:00Z' 
  },
  { 
    id: 'p5', 
    trackingNumber: 'SPX-ID-554321', 
    recipientName: 'Rahmat Hidayat', 
    address: 'Jl. Sudirman Kav 50, Jakarta Pusat', 
    phoneNumber: '6281399887766',
    coordinates: { lat: -6.2151, lng: 106.8100 },
    status: PackageStatus.PENDING, 
    type: PackageType.NON_COD, 
    timestamp: '2023-10-27T10:00:00Z' 
  },
];

export const APP_COLORS = {
  primary: 'orange-600', // SPX Orange-ish
  secondary: 'slate-800',
  success: 'emerald-500',
  warning: 'amber-500',
  danger: 'rose-500',
};