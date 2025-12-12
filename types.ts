export enum Role {
  GUEST = 'GUEST',
  COURIER = 'COURIER',
  PIC = 'PIC',
  ADMIN = 'ADMIN'
}

export enum PackageStatus {
  PENDING = 'PENDING', // Belum diantar
  LOADED = 'LOADED',   // Sudah discan masuk karung/tas
  DELIVERED = 'DELIVERED', // Sukses
  FAILED = 'FAILED', // Gagal antar
  RETURNED = 'RETURNED' // Sudah diserahterimakan balik ke gudang
}

export enum PackageType {
  COD = 'COD',
  NON_COD = 'NON_COD'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface Package {
  id: string;
  trackingNumber: string;
  recipientName: string;
  address: string;
  phoneNumber: string; // New: For WhatsApp/Call
  coordinates: { lat: number; lng: number }; // New: For Google Maps
  status: PackageStatus;
  type: PackageType;
  codAmount?: number;
  timestamp: string;
  proofImage?: string;
  receivedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO String
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface ShiftSummary {
  totalCod: number;
  totalNonCod: number;
  totalPackages: number;
}

export enum CourierWorkflow {
  ABSENT = 'ABSENT',         // Belum absen
  PLANNING = 'PLANNING',     // Input jumlah paket
  LOADING = 'LOADING',       // Scan masuk barang
  DELIVERING = 'DELIVERING', // Proses antar
  CLOSING = 'CLOSING'        // Proses retur/pending
}