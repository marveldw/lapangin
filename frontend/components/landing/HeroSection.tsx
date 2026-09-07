"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  ChevronDown, 
  Check, 
  ArrowRight 
} from "lucide-react";

const SPORT_OPTIONS = [
  "Padel",
  "Badminton",
  "Futsal",
  "Mini Soccer",
  "Basket",
  "Tennis",
  "Voli",
  "Tenis Meja",
];

const STATS = [
  { value: "2.400+", label: "Lapangan Terdaftar" },
  { value: "38+", label: "Kota di Indonesia" },
  { value: "150rb+", label: "Booking per Bulan" },
  { value: "4,9 / 5", label: "Rating Kepuasan" },
];

export default function HeroSection() {
  const [selectedSport, setSelectedSport] = useState("Padel");
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const [location, setLocation] = useState("");

  const sportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sportDropdownRef.current &&
        !sportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSportDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="relative w-full bg-white">
      {/* 1. Hero Banner Area with Image */}
      <div className="relative w-full min-h-[520px] sm:min-h-[600px] lg:min-h-[660px] flex flex-col justify-start pt-28 sm:pt-36 lg:pt-40 pb-24 sm:pb-28 lg:pb-32 bg-[#0b1c30] text-white overflow-hidden">
        {/* Full-width Background Image & Atmosphere */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="/venue-hero.jpg"
            alt="Indoor Sports Venue"
            className="w-full h-full object-cover object-center"
          />
          {/* Left-to-right gradient: dark on left for high-contrast text, transparent on right to show active court & lounge */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30]/95 via-[#0b1c30]/80 md:via-[#0b1c30]/70 to-[#0b1c30]/30" />
          {/* Top & bottom subtle fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/75 via-transparent to-[#0b1c30]/85" />
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start text-left">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.12] mb-4 max-w-2xl drop-shadow-md">
            Sewa Lapangan Olahraga<br />
            Tanpa Ribet, Langsung Main.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-200/90 max-w-xl leading-relaxed font-normal drop-shadow">
            Temukan dan booking lapangan olahraga favoritmu secara instan. Cek jadwal ketersediaan real-time dengan harga transparan tanpa perlu telepon.
          </p>
        </div>
      </div>

      {/* 2. Floating Search Bar (Simple Unified Bar, No Inner Cards) */}
      <div className="relative z-20 -mt-8 sm:-mt-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#006e2f] text-white rounded-2xl md:rounded-full shadow-2xl shadow-emerald-950/30 p-2 sm:p-2.5 border border-emerald-500/40">
          <div className="flex flex-col md:flex-row items-stretch md:items-center">
            
            {/* Lokasi */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-2.5">
              <MapPin className="w-5 h-5 text-emerald-200 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-100/80 tracking-wider uppercase">
                  Lokasi
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pilih Kota / Area"
                  className="w-full bg-transparent text-sm font-bold text-white placeholder:text-emerald-100/60 outline-none truncate"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-9 bg-white/20 mx-1" />

            {/* Cabang Olahraga */}
            <div ref={sportDropdownRef} className="flex-1 relative flex items-center px-4 py-2 sm:py-2.5">
              <button
                type="button"
                onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
                className="w-full flex items-center gap-3 text-left cursor-pointer select-none"
              >
                <Search className="w-5 h-5 text-emerald-200 shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-100/80 tracking-wider uppercase">
                    Cabang Olahraga
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate">
                      {selectedSport}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-200 transition-transform duration-200 ${
                        isSportDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu Olahraga */}
              {isSportDropdownOpen && (
                <div className="absolute top-full left-0 right-0 sm:w-64 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50 text-gray-900 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-1 space-y-0.5">
                    {SPORT_OPTIONS.map((sport) => {
                      const isSelected = selectedSport === sport;
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => {
                            setSelectedSport(sport);
                            setIsSportDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-[#006e2f]"
                              : "text-gray-700 hover:bg-gray-50 hover:text-[#006e2f]"
                          }`}
                        >
                          <span>{sport}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#006e2f]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button: Temukan -> */}
            <Link
              href={`/lapangan?sport=${encodeURIComponent(selectedSport.toLowerCase())}&location=${encodeURIComponent(location)}`}
              className="bg-white hover:bg-emerald-50 text-[#006e2f] px-8 py-3.5 rounded-xl md:rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 active:scale-[0.98] cursor-pointer mt-2 md:mt-0"
            >
              <span>Temukan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        </div>
      </div>

      {/* 3. Statistics Section (Clean with vertical green lines like screenshot 1) */}
      <div className="w-full pt-12 sm:pt-14 pb-10 sm:pb-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="border-l-[3px] border-[#006e2f] pl-3.5 sm:pl-4 flex flex-col justify-center">
                <p className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#0b1c30] tracking-tight leading-tight">
                  {value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
