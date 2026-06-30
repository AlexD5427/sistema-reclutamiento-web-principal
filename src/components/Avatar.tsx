import React from 'react';

export function getInitials(name: string, nombres?: string, apellido_paterno?: string): string {
  if (nombres && nombres.trim()) {
    const firstN = nombres.trim().charAt(0).toUpperCase();
    const firstP = (apellido_paterno || '').trim().charAt(0).toUpperCase() || '?';
    return firstN + firstP;
  }
  if (!name) return '??';
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (parts.length === 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  if (parts.length === 3) {
    // e.g. "Juan Perez Gomez" -> "JP"
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  // e.g. "Juan Carlos Perez Gomez" -> "JP"
  const firstN = parts[0].charAt(0).toUpperCase();
  const firstP = parts[parts.length - 2].charAt(0).toUpperCase();
  return firstN + firstP;
}

interface AvatarProps {
  name: string;
  nombres?: string;
  apellido_paterno?: string;
  className?: string;
}

export default function Avatar({ name, nombres, apellido_paterno, className = "w-10 h-10 text-xs" }: AvatarProps) {
  const initials = getInitials(name, nombres, apellido_paterno);
  return (
    <div 
      className={`rounded-full bg-gradient-to-tr from-[#004a8f] to-[#00b0d8] text-white font-bold flex items-center justify-center shadow-sm select-none shrink-0 border border-white/10 ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
