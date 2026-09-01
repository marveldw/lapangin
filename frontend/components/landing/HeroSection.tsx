"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronDown, Star, Check } from "lucide-react";

const SPORT_OPTIONS = [
  "Futsal",
  "Badminton",
  "Basket",
  "Tennis",
  "Voli",
  "Mini Soccer",
  "Padel",
  "Tenis Meja",
];

const SPORT_FILTERS = ["Futsal", "Badminton", "Basket", "Tennis", "Voli", "Mini Soccer"];

const STATS = [
  { value: "2.400+", label: "Lapangan terdaftar" },
  { value: "38", label: "Kota di Indonesia" },
  { value: "150rb+", label: "Booking per bulan" },
  { value: "4,9/5", label: "Rating rata-rata" },
];

const FEATURED_CARD = {
  status: "BOOKING DIKONFIRMASI",
  name: "GOR Senayan · Court 3",
  time: "Hari ini · 19:00–20:00",
  rating: "4,9",
  price: "Rp 120.000",
};

export default function HeroSection() {
  const [selectedSport, setSelectedSport] = useState("Futsal");
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const [location, setLocation] = useState("");

  const sportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sportDropdownRef.current && !sportDropdownRef.current.contains(e.target as Node)) {
        setIsSportDropdownOpen(false);
      }
    };

    if (isSportDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSportDropdownOpen]);

  return (
    <section className="pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Column: Text & Search */}
        <div className="flex-1 flex flex-col gap-6 w-full">

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#0b1c30] leading-[1.15] tracking-tight">
            Cari lapangan.<br />
            Booking. <span className="text-[#006e2f]">Main.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-lg">
            Satu platform untuk menemukan dan memesan lapangan olahraga terbaik di kotamu — jadwal real-time, harga transparan, tanpa perlu telepon.
          </p>

          {/* Search Box Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-black/5 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-30">
            
            {/* Custom Dropdown Olahraga */}
            <div ref={sportDropdownRef} className="flex-1 relative">
              <button
                type="button"
                onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
                className={`w-full text-left bg-[#f8f9ff] hover:bg-gray-50/90 border transition-all rounded-xl px-3.5 py-2 flex items-center gap-3 cursor-pointer select-none ${
                  isSportDropdownOpen
                    ? "border-[#006e2f] ring-3 ring-[#006e2f]/10 bg-white"
                    : "border-gray-200/70"
                }`}
              >
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">
                    Olahraga
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0b1c30] truncate">
                      {selectedSport}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        isSportDropdownOpen ? "rotate-180 text-[#006e2f]" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Custom Styled Dropdown Menu */}
              {isSportDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
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

            {/* Input Lokasi */}
            <div className="flex-1 bg-[#f8f9ff] hover:bg-gray-50/80 border border-gray-200/70 rounded-xl px-3.5 py-2 flex items-center gap-3 transition-colors">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">
                  Lokasi
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kota / area"
                  className="w-full bg-transparent text-sm font-semibold text-[#0b1c30] placeholder:text-gray-400 placeholder:font-normal outline-none truncate"
                />
              </div>
            </div>

            {/* Button Cari */}
            <Link
              href={`/lapangan?sport=${encodeURIComponent(selectedSport.toLowerCase())}&location=${encodeURIComponent(location)}`}
              className="bg-[#006e2f] hover:bg-[#005321] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Cari</span>
            </Link>
          </div>

          {/* Quick Sport Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {SPORT_FILTERS.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => setSelectedSport(sport)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedSport === sport
                    ? "bg-[#006e2f] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#006e2f] hover:text-[#006e2f]"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Guarantee / Note */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Check className="w-3.5 h-3.5 text-[#006e2f] shrink-0" />
            <span>Slot hari ini tersedia — booking & bayar dalam 60 detik.</span>
          </div>

        </div>

        {/* Right Column: Hero Image with Floating Booking Card */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none flex justify-center items-center">
          <div className="relative w-full max-w-[460px] aspect-[4/4.8] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#0b1c30] to-[#122840]">
            <img
              src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80"
              alt="Badminton Player"
              className="w-full h-full object-cover object-top opacity-90 hover:scale-105 transition-transform duration-700"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Floating Booking Confirmed Card */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-4 animate-fade-in">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[9px] font-extrabold tracking-wider text-gray-400 uppercase">
                  {FEATURED_CARD.status}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-sm font-bold text-[#0b1c30] leading-snug">
                {FEATURED_CARD.name}
              </p>
              <p className="text-[11px] text-gray-500 mb-3">
                {FEATURED_CARD.time}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-[#0b1c30]">{FEATURED_CARD.rating}</span>
                </div>
                <span className="text-xs font-extrabold text-[#006e2f]">
                  {FEATURED_CARD.price}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Stats Counter Bar */}
      <div className="border-t border-gray-100 bg-[#fbfcfe]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                {value}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
