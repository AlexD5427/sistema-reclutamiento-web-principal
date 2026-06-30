/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface BackgroundBlobsProps {
  isDarkMode?: boolean;
}

export default function BackgroundBlobs({ isDarkMode = true }: BackgroundBlobsProps) {
  // SVG points for a regular hexagon
  const hexPoints = "50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5";

  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden ${
      isDarkMode 
        ? "bg-[#060a12] selection:bg-cyan-500/30 selection:text-white" 
        : "bg-[#f5f8fa] selection:bg-[#004a8f]/10 selection:text-[#004a8f]"
    }`}>
      {/* Deep glass shade base */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDarkMode ? "bg-slate-950/80" : "bg-white/40"
      }`} />
      
      {/* Hexagon 1: Top-Left (Indigo/Cyan) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          rotate: [0, 120, 240, 360],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] transition-all duration-500"
        style={{ filter: 'blur(80px)' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="hexGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity={isDarkMode ? 0.25 : 0.15} />
              <stop offset="100%" stopColor={isDarkMode ? "#06b6d4" : "#22d3ee"} stopOpacity={isDarkMode ? 0.05 : 0.02} />
            </linearGradient>
          </defs>
          <polygon points={hexPoints} fill="url(#hexGrad1)" />
        </svg>
      </motion.div>

      {/* Hexagon 2: Bottom-Right (Emerald/Teal) */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 40, -40, 0],
          rotate: [360, 240, 120, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] transition-all duration-500"
        style={{ filter: 'blur(90px)' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#10b981" : "#34d399"} stopOpacity={isDarkMode ? 0.18 : 0.12} />
              <stop offset="100%" stopColor={isDarkMode ? "#0891b2" : "#06b6d4"} stopOpacity={isDarkMode ? 0.04 : 0.01} />
            </linearGradient>
          </defs>
          <polygon points={hexPoints} fill="url(#hexGrad2)" />
        </svg>
      </motion.div>

      {/* Hexagon 3: Center-Right (Purple/Rose) */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, 30, -50, 0],
          rotate: [90, 180, 270, 360],
          scale: [0.95, 1.05, 1, 0.95],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] right-[10%] w-[380px] h-[380px] transition-all duration-500"
        style={{ filter: 'blur(100px)' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="hexGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#6366f1" : "#818cf8"} stopOpacity={isDarkMode ? 0.2 : 0.1} />
              <stop offset="100%" stopColor={isDarkMode ? "#d946ef" : "#f472b6"} stopOpacity={isDarkMode ? 0.03 : 0.01} />
            </linearGradient>
          </defs>
          <polygon points={hexPoints} fill="url(#hexGrad3)" />
        </svg>
      </motion.div>

      {/* Ambient Micro-Hexagons overlaying purely for fine-grain texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath d='M14 1 L26 8 L26 22 L14 29 L2 22 L2 8 Z M14 25 L26 32 L26 46 L14 53 L2 46 L2 32 Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
             backgroundSize: '28px 49px'
           }} 
      />
    </div>
  );
}
