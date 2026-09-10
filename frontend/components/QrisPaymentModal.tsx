'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';

interface QrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  grossAmount: number;
  qrUrl: string;
  qrString?: string;
  expiresAt?: string;
  title?: string;
  onSuccess: () => void;
}

export default function QrisPaymentModal({
  isOpen,
  onClose,
  orderId,
  grossAmount,
  qrUrl,
  expiresAt,
  title = 'Pembayaran QRIS Dinamis',
  onSuccess,
}: QrisPaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SETTLEMENT' | 'EXPIRED' | 'CANCELLED'>('PENDING');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper untuk mem-parse tanggal secara aman lintas browser dan timezone
  const parseTargetTime = (dateStr?: string): number => {
    if (!dateStr) return 0;
    let safeStr = dateStr.trim();
    // Jika backend mengirim datetime tanpa identifier timezone (seperti "YYYY-MM-DD HH:mm:ss"),
    // anggap sebagai UTC dengan menambahkan 'Z'
    if (!safeStr.includes('Z') && !/[+-]\d{2}(:\d{2})?$/.test(safeStr)) {
      safeStr = safeStr.replace(' ', 'T') + 'Z';
    }
    const parsed = new Date(safeStr).getTime();
    return isNaN(parsed) ? new Date(dateStr).getTime() : parsed;
  };

  // Reset status saat modal dibuka atau orderId berubah
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('PENDING');
      setTimeLeft('');
    }
  }, [isOpen, orderId]);

  // 1. Countdown timer
  useEffect(() => {
    if (!isOpen || !expiresAt || paymentStatus === 'SETTLEMENT') return;

    const targetTime = parseTargetTime(expiresAt);
    if (!targetTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('00:00 (Kedaluwarsa)');
        setPaymentStatus('EXPIRED');
        return;
      }

      const totalSeconds = Math.max(0, Math.floor(difference / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [isOpen, expiresAt, paymentStatus]);

  // 2. Real-time polling check to /api/payments/{orderId}/status
  useEffect(() => {
    if (!isOpen || !orderId || paymentStatus === 'SETTLEMENT' || paymentStatus === 'EXPIRED') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await api.get(`/payments/${orderId}/status`);
        if (res.success && res.data) {
          const currentStatus = res.data.status;
          if (currentStatus === 'SETTLEMENT') {
            setPaymentStatus('SETTLEMENT');
            if (pollingRef.current) clearInterval(pollingRef.current);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else if (currentStatus === 'EXPIRED' || currentStatus === 'CANCELLED') {
            setPaymentStatus(currentStatus);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch (err) {
        // Abaikan error jaringan sesaat saat polling
      }
    };

    // Polling setiap 3 detik
    pollingRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderId, paymentStatus, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b1c30]/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (paymentStatus !== 'PENDING') onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center gap-5 z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* SUCCESS STATE */}
        {paymentStatus === 'SETTLEMENT' ? (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Pembayaran Berhasil!</h3>
              <p className="text-xs text-gray-500 mt-1">Transaksi Anda telah diverifikasi oleh sistem.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 w-full border border-gray-100">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Total Dibayar</p>
              <p className="text-lg font-black text-[#006e2f]">{formatRupiah(grossAmount)}</p>
            </div>
          </div>
        ) : paymentStatus === 'EXPIRED' ? (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">timer_off</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">QRIS Kedaluwarsa</h3>
              <p className="text-xs text-gray-500 mt-1">Waktu pembayaran telah habis. Silakan tutup dan klik &apos;Bayar QRIS&apos; kembali untuk membuat kode pembayaran baru.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer"
            >
              Tutup &amp; Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider">
                  QRIS
                </div>
                <span className="text-xs font-bold text-gray-800">{title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Total Payment */}
            <div className="w-full bg-[#f8f9ff] rounded-2xl p-3.5 text-center border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-2xl font-black text-[#006e2f] mt-0.5">{formatRupiah(grossAmount)}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-1">Order ID: {orderId}</p>
            </div>

            {/* QR Code Container */}
            <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-xs flex flex-col items-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Scan QRIS"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                  Memuat QR Code...
                </div>
              )}

              {/* Countdown badge */}
              {timeLeft && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Bayar dalam: {timeLeft}</span>
                </div>
              )}
            </div>

            {/* Supported Banks / Wallets Note */}
            <div className="w-full text-center">
              <p className="text-[11px] text-gray-500 font-medium">
                Bisa di-scan dari <strong>BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay</strong> &amp; semua aplikasi pendukung QRIS.
              </p>
            </div>

            {/* Polling Indicator */}
            <div className="w-full flex items-center justify-center gap-2 text-[11px] text-[#006e2f] bg-green-50 py-2 rounded-xl font-medium">
              <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-ping" />
              <span>Menunggu pembayaran Anda...</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
