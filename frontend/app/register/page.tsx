'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'OWNER' | 'CUSTOMER'>('OWNER');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setValidationErrors({});

    if (password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal harus 8 karakter.');
      return;
    }

    setLoading(true);

    const res = await register({
      name,
      email,
      phone,
      role,
      password,
      password_confirmation: passwordConfirmation,
    });

    if (res.success) {
      if (res.role === 'OWNER') {
        router.push('/owner/dashboard');
      } else {
        router.push('/lapangan');
      }
    } else {
      setErrorMsg(res.message || 'Gagal melakukan pendaftaran.');
      if (res.errors) {
        setValidationErrors(res.errors);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-sm border border-[#bccbb9]/20">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Lapangin" className="h-9 w-auto object-contain" />
            <span className="text-2xl font-bold text-[#006e2f] tracking-tight">Lapangin</span>
          </div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Daftar Akun Baru</h1>
          <p className="text-xs text-[#3d4a3d] mt-1">Gabung sekarang dan kelola reservasi lapangan dengan mudah</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6 bg-[#eff4ff] p-1.5 rounded-xl flex gap-1">
          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'OWNER'
                ? 'bg-[#006e2f] text-white shadow-sm'
                : 'text-[#3d4a3d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">stadium</span>
            <span>Pemilik Lapangan (Owner)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'CUSTOMER'
                ? 'bg-[#006e2f] text-white shadow-sm'
                : 'text-[#3d4a3d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Penyewa / Pemain</span>
          </button>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm font-medium flex items-start gap-2 border border-[#ba1a1a]/20">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="flex flex-col gap-1">
              <span>{errorMsg}</span>
              {Object.keys(validationErrors).length > 0 && (
                <ul className="text-xs list-disc list-inside mt-1 space-y-0.5">
                  {Object.values(validationErrors).flat().map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
              {role === 'OWNER' ? 'Nama Pemilik / Nama GOR' : 'Nama Lengkap'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'OWNER' ? 'GOR Budi Perkasa' : 'Budi Santoso'}
              className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
            />
          </div>

          {/* Email & No Telepon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
                No. WhatsApp / Telepon
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
              />
            </div>
          </div>

          {/* Password & Konfirmasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3d4a3d] mb-1 uppercase tracking-wider">
                Ulangi Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password"
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccbb9]/50 focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f] outline-none text-sm text-[#0b1c30] bg-[#ffffff] transition-all"
              />
            </div>
          </div>

          {/* Benefit Badge Info */}
          {role === 'OWNER' && (
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center gap-2.5 text-xs text-[#004b1e] font-medium mt-1">
              <span className="material-symbols-outlined text-[20px] text-[#006e2f] shrink-0">verified</span>
              <span>Otomatis mendapatkan <b>Paket Percobaan (Free Plan)</b> untuk 1 lapangan!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#006e2f] hover:bg-[#006e2f]/90 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Mendaftarkan akun...</span>
              </>
            ) : (
              <span>Daftar Sebagai {role === 'OWNER' ? 'Owner' : 'Pelanggan'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#3d4a3d]">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#006e2f] font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}