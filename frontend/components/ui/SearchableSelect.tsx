'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface SearchableOption {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  leadingIcon?: string;
  allowClear?: boolean;
}

export default function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  error = false,
  className = '',
  leadingIcon,
  allowClear = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: SearchableOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value) || null;
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for form integration */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left transition-all ${
          className ||
          `bg-[#f8f9ff] text-[#0b1c30] px-4 py-3 rounded-xl border text-sm h-12 ${
            error ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#bccbb9]/40'
          } focus:outline-none focus:ring-2 focus:ring-[#006e2f]`
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-400' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {leadingIcon && (
            <span className="material-symbols-outlined text-[#3d4a3d]/60 text-[20px] flex-shrink-0">
              {leadingIcon}
            </span>
          )}
          <span className={`truncate ${!selectedOption && !value ? 'text-[#3d4a3d]/60' : 'text-[#0b1c30] font-medium'}`}>
            {selectedOption ? selectedOption.label : value ? value : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {allowClear && value && !disabled && (
            <span
              onClick={handleClear}
              className="material-symbols-outlined text-[#3d4a3d]/60 hover:text-[#ba1a1a] text-[18px] p-0.5 cursor-pointer"
              title="Hapus pilihan"
            >
              close
            </span>
          )}
          <span
            className={`material-symbols-outlined text-[#3d4a3d] text-[20px] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-[#bccbb9]/30 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-[#bccbb9]/20 bg-[#f8f9ff]">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#3d4a3d]/60 text-[18px]">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#bccbb9]/40 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  } else if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#3d4a3d]/60 hover:text-[#0b1c30] text-[16px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  !value ? 'bg-[#006e2f]/10 text-[#006e2f] font-bold' : 'text-[#3d4a3d] hover:bg-[#f0f9f3]'
                }`}
              >
                <span>-- {placeholder} --</span>
                {!value && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-[#3d4a3d]/70">
                <span className="material-symbols-outlined text-2xl text-gray-400 block mb-1">search_off</span>
                Tidak ada hasil untuk &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#006e2f]/10 text-[#006e2f] font-bold'
                        : 'text-[#0b1c30] hover:bg-[#f0f9f3]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px] text-[#006e2f]">check</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
