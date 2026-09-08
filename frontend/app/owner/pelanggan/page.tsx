'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface CustomerRecord {
  customer_id: number;
  owner_id: number;
  name: string;
  phone: string;
  email?: string | null;
  bookings_count?: number;
  created_at?: string;
  bookings?: any[];
}

export default function PelangganPage() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/customers', token);
      if (res.success && res.data) {
        const items = Array.isArray(res.data.data) ? res.data.data : res.data;
        setCustomers(items || []);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError('Gagal memuat data pelanggan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle Add Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setAddError('Nama dan Nomor Telepon wajib diisi.');
      return;
    }

    setAddLoading(true);
    setAddError(null);
    try {
      const res = await api.post(
        '/customers',
        {
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
        },
        token
      );

      if (res.success && res.data) {
        setCustomers((prev) => [res.data, ...prev]);
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        setNewEmail('');
      } else {
        setAddError(res.message || 'Gagal menambahkan data pelanggan.');
      }
    } catch (err) {
      setAddError('Terjadi kesalahan koneksi.');
    } finally {
      setAddLoading(false);
    }
  };

  // View Customer Detail
  const handleViewCustomer = async (customerId: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/customers/${customerId}`, token);
      if (res.success && res.data) {
        setSelectedCustomer(res.data);
      }
    } catch (err) {
      console.error('Failed to load customer detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Search Filter
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, searchTerm]);

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0b1c30]">Data Pelanggan</h1>
          <p className="text-sm text-[#3d4a3d] mt-1">
            Kelola data pelanggan yang terdaftar dan pernah melakukan booking di venue Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#006e2f] hover:bg-[#005321] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Tambah Pelanggan</span>
        </button>
      </header>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#bccbb9]/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a3d]/50 text-[20px]">
            search
          </span>
          <input
            className="w-full bg-[#f8f9ff] text-[#0b1c30] text-xs pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 border border-[#bccbb9]/30 transition-all placeholder:text-[#3d4a3d]/50"
            placeholder="Cari nama, WhatsApp, atau email..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold text-[#3d4a3d]">
          Total: <b>{filteredCustomers.length}</b> pelanggan
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Table Data */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[#bccbb9]/30 overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#006e2f]">
            <span className="material-symbols-outlined animate-spin text-[32px]">
              progress_activity
            </span>
            <span className="text-xs font-bold">Memuat Data Pelanggan...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 text-[40px]">group_off</span>
            <p className="font-bold text-sm text-[#0b1c30]">Belum Ada Data Pelanggan</p>
            <p className="text-xs text-[#3d4a3d]">
              Pelanggan akan otomatis tercatat saat mereka melakukan pemesanan lapangan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#3d4a3d] font-bold text-xs border-b border-[#bccbb9]/30">
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Kontak (WhatsApp / Email)</th>
                  <th className="px-6 py-4 text-center">Total Booking</th>
                  <th className="px-6 py-4">Bergabung Sejak</th>
                  <th className="px-6 py-4 text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#0b1c30] divide-y divide-[#bccbb9]/20">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.customer_id}
                    onClick={() => handleViewCustomer(cust.customer_id)}
                    className="hover:bg-[#f8f9ff]/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-semibold flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#006e2f] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-[#0b1c30]">{cust.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0b1c30]">{cust.phone}</span>
                        {cust.email && (
                          <span className="text-[11px] text-[#3d4a3d]">{cust.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e5eeff] text-[#004b1e] font-extrabold text-xs">
                        {cust.bookings_count ?? 0} Booking
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3d4a3d] font-medium">
                      {cust.created_at ? formatDateIndo(cust.created_at) : '-'}
                    </td>
                    <td className="px-6 py-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(cust.customer_id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#f8f9ff] hover:bg-[#e5eeff] text-[#006e2f] border border-[#bccbb9]/30 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Riwayat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full flex flex-col gap-5 animate-in zoom-in-95 duration-150 border border-[#bccbb9]/30">
            <div className="flex justify-between items-center border-b border-[#bccbb9]/30 pb-3">
              <h3 className="text-lg font-bold text-[#0b1c30]">Tambah Pelanggan Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3d] uppercase mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/40 text-xs text-[#0b1c30] outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3d] uppercase mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/40 text-xs text-[#0b1c30] outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3d] uppercase mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="budi@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/40 text-xs text-[#0b1c30] outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#bccbb9]/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#3d4a3d] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2 rounded-xl bg-[#006e2f] text-white text-xs font-bold hover:bg-[#005321] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {addLoading ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Booking History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full flex flex-col gap-5 animate-in zoom-in-95 duration-150 border border-[#bccbb9]/30 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#bccbb9]/30 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#3d4a3d]">{selectedCustomer.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider">
                Riwayat Booking Pelanggan Ini
              </h4>

              {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                <div className="flex flex-col divide-y divide-[#bccbb9]/20">
                  {selectedCustomer.bookings.map((b: any) => (
                    <div key={b.booking_id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#0b1c30]">
                          #{b.booking_code} - {b.court?.name || 'Lapangan'}
                        </p>
                        <p className="text-[11px] text-[#3d4a3d]">
                          {formatDateIndo(b.booking_date)} ({b.start_time.slice(0, 5)} -{' '}
                          {b.end_time.slice(0, 5)})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#006e2f]">{formatRupiah(b.price)}</p>
                        <span className="text-[10px] font-bold text-[#3d4a3d]">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Belum ada riwayat booking.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#bccbb9]/30">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 text-xs font-bold text-[#0b1c30] hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}