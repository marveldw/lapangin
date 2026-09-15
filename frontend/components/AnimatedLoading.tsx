'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedLoadingProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function AnimatedLoading({
  message = 'Memuat Lapangin',
  submessage,
  size = 'md',
  fullScreen = false,
}: AnimatedLoadingProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const iconSizes = {
    sm: 'text-[24px]',
    md: 'text-[36px]',
    lg: 'text-[48px]',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <div className="absolute w-12 h-12 rounded-full bg-[#006e2f]/10 animate-ping"></div>
        {/* Animated spinning sports ball icon */}
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#bccbb9]/40 flex items-center justify-center text-[#006e2f] relative z-10 transition-transform">
          <span className={`material-symbols-outlined ${iconSizes[size]} animate-spin [animation-duration:3s]`}>
            sports_soccer
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h4 className={`font-bold text-[#0b1c30] tracking-tight ${textSizes[size]}`}>
          {message}
          <span className="inline-block w-6 text-left text-[#006e2f] font-extrabold">{dots}</span>
        </h4>
        {submessage && (
          <p className="text-xs text-[#3d4a3d] mt-1 max-w-xs">{submessage}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9ff]">
        {content}
      </div>
    );
  }

  return content;
}
