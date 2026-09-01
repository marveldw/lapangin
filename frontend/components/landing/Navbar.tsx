"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Calendar, 
  ShieldCheck,
  Building2
} from "lucide-react";
import { getAuthUser, logoutUser, type User } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/lapangan", label: "Sewa Lapangan" },
  { href: "/partner", label: "Partner With Us" },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user session on mount
  useEffect(() => {
    const currentUser = getAuthUser();
    setUser(currentUser);
    setIsLoadingAuth(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logoutUser();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="h-16 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Lapangin Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold text-[#0b1c30] tracking-tight">Lapangin</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-[#006e2f] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoadingAuth && user ? (
            /* User Profile Dropdown (Clean & Minimalist) */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-full hover:bg-gray-50 border border-gray-200/90 transition-all cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#0b1c30] text-white flex items-center justify-center text-xs font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Minimalist Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-1 duration-150 z-50 text-xs">
                  {/* User Details */}
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {user.role === "OWNER" && (
                      <>
                        <Link
                          href="/owner/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-gray-400" />
                          <span>Dashboard Owner</span>
                        </Link>
                        <Link
                          href="/owner/jadwal"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Jadwal &amp; Reservasi</span>
                        </Link>
                      </>
                    )}

                    {user.role === "ADMIN" && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/admin`}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                        <span>Panel Super Admin</span>
                      </a>
                    )}

                    {user.role === "CUSTOMER" && (
                      <Link
                        href="/lapangan"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>Jelajahi Lapangan</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout Action */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-gray-400" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isLoadingAuth ? (
            /* Guest Buttons */
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-[#006e2f] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#0b1c30] hover:bg-[#006e2f] text-white font-semibold px-5 py-2 rounded-full text-sm transition-all shadow-xs"
              >
                Daftar
              </Link>
            </>
          ) : (
            <div className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-[#006e2f] hover:bg-gray-50 focus:outline-hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          
          {/* User Profile on Mobile */}
          {!isLoadingAuth && user && (
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0b1c30] text-white flex items-center justify-center text-xs font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-[#006e2f] py-1.5 transition-colors"
              >
                {label}
              </Link>
            ))}

            {user?.role === "OWNER" && (
              <Link
                href="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-[#006e2f] py-1.5 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                <span>Dashboard Owner</span>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <a
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/admin`}
                className="text-sm font-semibold text-gray-700 hover:text-[#006e2f] py-1.5 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>Panel Super Admin</span>
              </a>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {!isLoadingAuth && user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-400" />
                <span>Keluar</span>
              </button>
            ) : !isLoadingAuth ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-gray-700 hover:text-[#006e2f] border border-gray-200 rounded-xl"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold bg-[#0b1c30] hover:bg-[#006e2f] text-white rounded-xl shadow-xs"
                >
                  Daftar
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
