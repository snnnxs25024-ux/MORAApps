import React, { useState, useEffect } from 'react';
import { Scan, X, Camera } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(true);

  // Simulate scanning process
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate successful scan after 2 seconds
      if (scanning) {
        // Randomly simulate different barcode lengths/formats
        const randomSuffix = Math.floor(Math.random() * 100000);
        const randomCode = `SPX-ID-${randomSuffix}`; 
        onScan(randomCode);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [scanning, onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
      </div>
      
      <div className="relative w-full h-full bg-gray-900 overflow-hidden flex flex-col items-center justify-center">
        {/* Mock Camera View */}
        <div className="absolute inset-0 opacity-60 bg-[url('https://picsum.photos/800/1200?grayscale')] bg-cover bg-center"></div>
        
        {/* Scanning Overlay - WIDE RECTANGLE for Long Barcodes */}
        <div className="relative z-10 w-[90%] max-w-sm h-32 border-2 border-orange-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] flex items-center justify-center">
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-500 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-500 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-500 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-500 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
          
          {/* Scanning Laser Line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-scan-x"></div>
          
          <div className="absolute -bottom-8 text-white/80 text-xs font-mono tracking-widest uppercase">Scanning...</div>
        </div>

        <div className="absolute bottom-24 text-center px-6">
          <p className="text-white font-bold text-lg mb-1 drop-shadow-md">
            Scan Barcode / Resi
          </p>
          <p className="text-gray-300 text-sm max-w-xs mx-auto">
            Pastikan seluruh barcode masuk ke dalam area kotak.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan-x {
          0% { left: 5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 95%; opacity: 0; }
        }
        .animate-scan-x {
          animation: scan-x 2s infinite linear;
        }
      `}</style>
    </div>
  );
};