'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { formatDateIndo } from '@/lib/formatters';

interface StaffMember {
  user_id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export default function KelolaStafPage() {
  const { user, token } = useAuth();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal Tambah Staf
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success Modal (Kredensial yang baru dibuat untuk disalin)
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Modal Reset Password Staf
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [passwordModalSuccess, setPasswordModalSuccess] = useState<string | null>(null);

  // Modal Konfirmasi Deaktivasi/Aktivasi
  const [statusTargetStaff, setStatusTargetStaff] = useState<StaffMember | null>(null);
  const [statusToggling, setStatusToggling] = useState(false);

  const isOwner = user?.role?.toUpperCase() === 'OWNER';

  const fetchStaff = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/owner/staff', token);
      if (res.success && Array.isArray(res.data)) {
        setStaffList(res.data);
      } else {
        setStaffList([]);
      }
    } catch {
      setError('Gagal memuat data staf.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchStaff();
    }
  }, [token, isOwner]);

  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return staffList;
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
    );
  }, [staffList, search]);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama staf wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setFormError('Email staf wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Nomor telepon staf wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setFormError('Kata sandi minimal 8 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      };

      const res = await api.post('/owner/staff', payload, token);
      if (res.success && res.data) {
        setShowAddModal(false);
        setCreatedCredentials({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        fetchStaff();
      } else {
        const msg = res.message || (res.errors ? Object.values(res.errors).flat().join(' ') : 'Gagal membuat akun staf.');
        setFormError(msg);
      }
    } catch {
      setFormError('Terjadi kesalahan koneksi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Halo ${createdCredentials.name},\nBerikut akun staf untuk mengelola venue di Lapangin:\nEmail: ${createdCredentials.email}\nKata Sandi: ${createdCredentials.password}\n\nSilakan login di portal Lapangin: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleStatus = async () => {
    if (!statusTargetStaff || !token) return;
    setStatusToggling(true);
    try {
      const newStatus = statusTargetStaff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await api.put(`/owner/staff/${statusTargetStaff.user_id}`, { status: newStatus }, token);
      if (res.success) {
        setStatusTargetStaff(null);
        fetchStaff();
      } else {
        alert(res.message || 'Gagal mengubah status staf.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setStatusToggling(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPassword || !token) return;
    setPasswordModalError(null);
    setPasswordModalSuccess(null);

    if (newPassword.length < 8) {
      setPasswordModalError('Kata sandi baru minimal 8 karakter.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put(
        `/owner/staff/${selectedStaffForPassword.user_id}`,
        { password: newPassword },
        token
      );
      if (res.success) {
        setPasswordModalSuccess(`Kata sandi untuk '${selectedStaffForPassword.name}' berhasil diperbarui.`);
        setNewPassword('');
        setTimeout(() => {
          setSelectedStaffForPassword(null);
          setPasswordModalSuccess(null);
        }, 1800);
      } else {
        setPasswordModalError(res.message || 'Gagal memperbarui kata sandi.');
      }
    } catch {
      setPasswordModalError('Terjadi kesalahan koneksi.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
        </div>
        <h1 className="text-xl font-bold text-[#0b1c30]">Akses Dibatasi</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Halaman ini khusus untuk Owner venue. Akun Staf/Admin tidak memiliki izin untuk mengelola sub-akun staf lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header & Deskripsi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">Kelola Admin &amp; Staf</h1>
          <p className="text-sm text-gray-500 mt-1">
            Berikan akun operasional kepada karyawan atau kasir venue Anda dengan batasan wewenang aman.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006e2f] hover:bg-[#005321] text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Tambah Staf Baru</span>
        </button>
      </div>

      {/* Info Card Role & Wewenang */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006e2f] border border-emerald-300/60 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30]">Perlindungan Akses Multi-Tenant</h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Akun Staf hanya dapat melihat jadwal, melayani booking, dan mengelola lapangan venue Anda.
              <strong className="text-emerald-950"> Staf diblokir total</strong> dari melihat saldo dompet, menarik dana, mengubah nomor rekening bank, atau menghapus lapangan.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar & Pencarian */}
      <div className="bg-white rounded-2xl p-4 border border-[#bccbb9]/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau no. telepon staf..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10 transition-all"
          />
        </div>
        <div className="text-xs text-gray-500 self-center">
          Total Staf: <span className="font-bold text-[#0b1c30]">{staffList.length}</span>
        </div>
      </div>

      {/* Tabel Data Staf */}
      <div className="bg-white rounded-2xl border border-[#bccbb9]/30 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchStaff}
              className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">person_search</span>
            </div>
            <h3 className="text-base font-bold text-[#0b1c30]">Belum Ada Staf</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {search
                ? 'Tidak ditemukan staf yang cocok dengan pencarian Anda.'
                : 'Anda belum mendaftarkan staf. Klik tombol Tambah Staf Baru untuk membuat akun admin/kasir.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#0b1c30]">
              <thead className="bg-[#f8f9ff] text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#bccbb9]/30">
                <tr>
                  <th className="px-6 py-4">Nama Staf</th>
                  <th className="px-6 py-4">Kontak (Email / HP)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Terdaftar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff) => {
                  const isActive = staff.status === 'ACTIVE';
                  return (
                    <tr key={staff.user_id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#006e2f] font-bold text-sm flex items-center justify-center shrink-0">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0b1c30]">{staff.name}</p>
                            <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-200/50">
                              STAFF OPERASIONAL
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">{staff.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{staff.phone || 'Tidak ada no. telepon'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                          />
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {staff.created_at ? formatDateIndo(staff.created_at) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStaffForPassword(staff);
                              setNewPassword('');
                              setPasswordModalError(null);
                              setPasswordModalSuccess(null);
                            }}
                            title="Reset Kata Sandi"
                            className="p-1.5 text-gray-500 hover:text-[#006e2f] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">key</span>
                          </button>
                          <button
                            onClick={() => setStatusTargetStaff(staff)}
                            title={isActive ? 'Nonaktifkan Akun Staf' : 'Aktifkan Akun Staf'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isActive ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Tambah Staf Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0b1c30]">Tambah Akun Staf</h3>
                  <p className="text-xs text-gray-500">Buat kredensial login staf baru</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Nama Lengkap Staf <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Email Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staf@lapangananda.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+]/g, '');
                    const sanitized = val.startsWith('+') ? '+' + val.slice(1).replace(/\+/g, '') : val.replace(/\+/g, '');
                    setPhone(sanitized);
                  }}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">
                    Kata Sandi Awal <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-[#006e2f] hover:underline cursor-pointer"
                  >
                    Acak Sandi
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Berikan kata sandi ini kepada staf Anda setelah akun dibuat.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Membuat Akun...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Kredensial Berhasil Dibuat (Siap Disalin) */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006e2f] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30] text-center">Akun Staf Berhasil Dibuat!</h3>
            <p className="text-xs text-gray-500 text-center mt-1">
              Salin informasi akun berikut dan kirimkan ke staf Anda untuk masuk ke sistem:
            </p>

            <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 font-mono text-xs text-[#0b1c30]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-sans">Nama:</span>
                <span className="font-semibold">{createdCredentials.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-sans">Email:</span>
                <span className="font-semibold">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-sans">Kata Sandi:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleCopyCredentials}
                className="w-full py-2.5 bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? 'done' : 'content_copy'}
                </span>
                <span>{copied ? 'Berhasil Disalin!' : 'Salin Pesan Kredensial'}</span>
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="w-full py-2 text-gray-600 hover:bg-gray-100 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Kata Sandi Staf */}
      {selectedStaffForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">lock_reset</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0b1c30]">Atur Ulang Sandi</h3>
                  <p className="text-xs text-gray-500">{selectedStaffForPassword.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForPassword(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {passwordModalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {passwordModalError}
              </div>
            )}
            {passwordModalSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                {passwordModalSuccess}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0b1c30] focus:outline-hidden focus:bg-white focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForPassword(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 bg-[#006e2f] hover:bg-[#005321] text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {savingPassword ? 'Menyimpan...' : 'Perbarui Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Konfirmasi Deaktivasi / Aktivasi */}
      {statusTargetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                statusTargetStaff.status === 'ACTIVE'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {statusTargetStaff.status === 'ACTIVE' ? 'block' : 'check_circle'}
              </span>
            </div>
            <h3 className="font-bold text-base text-[#0b1c30]">
              {statusTargetStaff.status === 'ACTIVE' ? 'Nonaktifkan Akun Staf?' : 'Aktifkan Akun Staf?'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {statusTargetStaff.status === 'ACTIVE'
                ? `Akun staf '${statusTargetStaff.name}' tidak akan bisa login ke sistem hingga diaktifkan kembali.`
                : `Akun staf '${statusTargetStaff.name}' akan dapat login kembali ke sistem.`}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStatusTargetStaff(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={statusToggling}
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-all cursor-pointer ${
                  statusTargetStaff.status === 'ACTIVE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#006e2f] hover:bg-[#005321]'
                }`}
              >
                {statusToggling ? 'Memproses...' : statusTargetStaff.status === 'ACTIVE' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
