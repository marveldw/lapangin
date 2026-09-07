'use client';

import React from 'react';
import { formatRupiah } from '@/lib/formatters';

export interface BookingRecord {
  booking_id: number;
  booking_code: string;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
}

interface Props {
  booking: BookingRecord;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 border border-[#bccbb9]/30">
        <div className="flex justify-between items-start border-b border-[#bccbb9]/30 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0b1c30]">
              {booking.customer?.name || 'Pelanggan'}
            </h3>
            <span className="font-mono text-xs text-[#006e2f] font-bold">
              #{booking.booking_code}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#3d4a3d]">Waktu</span>
            <span className="font-bold">
              {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3d4a3d]">No. WhatsApp</span>
            <span className="font-bold">
              {booking.customer?.phone || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3d4a3d]">Tarif Sewa</span>
            <span className="font-extrabold text-[#006e2f]">
              {formatRupiah(booking.price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3d4a3d]">Status</span>
            <span className="font-bold">{booking.status}</span>
          </div>
        </div>

        {booking.customer?.phone && (
          <a
            href={`https://wa.me/${booking.customer.phone.replace(/^0/, '62')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Hubungi via WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
