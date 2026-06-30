/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, Search, Plus, Trash2, ArrowUpDown, RefreshCw, X, Sparkles, Check, UserPlus,
  ChevronLeft, ChevronRight, Users, Briefcase, Pencil, User, Printer, Download
} from 'lucide-react';
import { Applicant } from '../types';

interface NewComparadorProps {
  applicants: Applicant[];
  isDarkMode?: boolean;
  onViewProfile?: (id: string) => void;
  onEditApplicant?: (app: Applicant) => void;
}

// Minimal interface for autocomplete suggestions
interface CandidateSuggestion {
  identificador: string;
  name: string;
}

// Global Marquee text wrapper with hover translation
const MarqueeText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <div className="overflow-hidden w-full relative flex justify-center items-center text-center whitespace-nowrap" title={text}>
      <span className={`inline-block truncate max-w-full hover:overflow-visible transition-transform duration-300 animate-marquee-hover cursor-help text-center ${className}`}>
        {text}
      </span>
    </div>
  );
};

// Safe JSON Parsing & Custom Rich Chips layout
const renderListAsRichChips = (keyVal: any, isDarkMode: boolean) => {
  let list: any[] = [];
  try {
    list = typeof keyVal === 'string' ? JSON.parse(keyVal || '[]') : (keyVal || []);
  } catch (err) {
    if (typeof keyVal === 'string') {
      list = keyVal.split(',').map((s: any) => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(list)) {
    if (list) {
      list = [list];
    } else {
      list = [];
    }
  }

  if (list.length === 0) {
    return <span className={isDarkMode ? 'text-slate-500 font-mono text-xs' : 'text-slate-400 font-mono text-xs'}>-</span>;
  }

  return (
    <div className="flex flex-col gap-3 w-full py-1 justify-center items-center text-center">
      {list.slice(0, 5).map((item: any, idx: number) => {
        let name = '';
        let level = '';
        let detail = '';

        if (item && typeof item === 'object') {
          name = item.nombre || item.competencia || item.name || '';
          if (item.esperado !== undefined && item.obtenido !== undefined) {
            level = item.ajuste || '';
            detail = `Esp: ≥${item.esperado} | Obt: ${item.obtenido} | Brecha: ${item.brecha}`;
          } else {
            level = item.nivel || (item.porcentaje ? `${item.porcentaje}%` : '');
            detail = item.detalle || item.detalles || item.descripcion || '';
          }
          if (!name) name = JSON.stringify(item);
        } else {
          const rawString = String(item || '');
          const matchLevel = rawString.match(/\(([^)]+)\)/);
          if (matchLevel) {
            level = matchLevel[1];
            name = rawString.replace(/\([^)]+\)/, '').trim();
          } else {
            name = rawString;
            level = 'Alto';
          }
        }

        if (!name) return null;

        // Custom beautiful rendering for complex competencies
        const isComplexCompetencia = item && typeof item === 'object' && item.esperado !== undefined && item.obtenido !== undefined;

        if (isComplexCompetencia) {
          const numAjuste = parseInt(String(item.ajuste).replace('%', ''), 10) || 0;
          const colors = getPercentageColor(numAjuste);
          const displayAjuste = `Ajuste: ${numAjuste}%`;
          const numBrecha = parseFloat(String(item.brecha)) || 0;

          return (
            <div 
              key={idx} 
              className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all duration-500 w-full hover:scale-[1.01] hover:shadow-sm justify-center items-center text-center ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                  : 'bg-white/60 border-black/5 shadow-sm hover:bg-white hover:border-black/10'
              }`}
            >
              {/* Row 1: The Competency Name (Bold, marquee effect if too long) */}
              <MarqueeText text={name} className="font-bold text-xs text-cyan-600 dark:text-cyan-400 leading-tight" />

              {/* Row 2: A visually stunning, dense layout showing the math */}
              <div className="flex gap-1.5 justify-center items-center text-[10px] font-medium leading-none">
                <span>
                  <span className="text-slate-500 dark:text-slate-400">Esperado:</span>{" "}
                  <strong className="text-slate-700 dark:text-slate-300">{item.esperado}</strong>
                </span>
                <span className="text-slate-300 dark:text-white/10">|</span>
                <span>
                  <span className="text-slate-500 dark:text-slate-400">Obtenido:</span>{" "}
                  <strong className="text-slate-700 dark:text-slate-300">{item.obtenido}</strong>
                </span>
              </div>

              {/* Row 3: The Live Calculations */}
              <div className="flex justify-center items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white drop-shadow-sm border border-white/15 ${colors.bg} ${colors.shadow}`}>
                  {displayAjuste}
                </span>
                <span className="text-slate-300 dark:text-white/10">|</span>
                <span className={`text-[9px] font-mono font-bold ${
                  numBrecha < 0 
                    ? 'text-red-500' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  Brecha: {item.brecha}
                </span>
              </div>
            </div>
          );
        }

        const normLevel = level.toUpperCase();
        let levelBadgeClass = '';
        if (normLevel.includes('ALTO') || normLevel.includes('BUENO') || normLevel.includes('CONFIABLE') || normLevel.includes('ÓPTIMO') || normLevel.includes('OPTIMO') || normLevel.includes('8') || normLevel.includes('9') || normLevel.includes('10')) {
          levelBadgeClass = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
        } else if (normLevel.includes('MEDIO') || normLevel.includes('MODERADO') || normLevel.includes('ESTÁNDAR') || normLevel.includes('ESTANDAR') || normLevel.includes('6') || normLevel.includes('7')) {
          levelBadgeClass = 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
        } else if (normLevel.includes('BAJO') || normLevel.includes('RIESGO') || normLevel.includes('CRÍTICO') || normLevel.includes('CRITICO') || normLevel.includes('1') || normLevel.includes('2') || normLevel.includes('3') || normLevel.includes('4') || normLevel.includes('5')) {
          levelBadgeClass = 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
        } else {
          levelBadgeClass = 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-650 dark:text-slate-400 border-slate-500/30';
        }

        return (
          <div 
            key={idx} 
            className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all duration-500 w-full hover:scale-[1.01] hover:shadow-sm justify-center items-center text-center ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                : 'bg-white/60 border-black/5 shadow-sm hover:bg-white hover:border-black/10'
            }`}
          >
            {/* Row 1: Name with MarqueeText on hover */}
            <MarqueeText text={name} className="font-bold text-xs text-cyan-600 dark:text-cyan-400 leading-tight" />

            {/* Row 2: Level as micro-badge */}
            {level && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border w-fit leading-none self-center mx-auto ${levelBadgeClass}`}>
                {level}
              </span>
            )}

            {/* Row 3: Detail text with MarqueeText on hover */}
            {detail && (
              <MarqueeText text={detail} className="text-[10px] italic text-slate-400 dark:text-slate-500 leading-snug" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Safe JSON Parsing & Visual rendering helpers for Google Sheets data extraction
const renderListAsTags = (keyVal: any, isDarkMode: boolean) => {
  let list: any[] = [];
  try {
    list = typeof keyVal === 'string' ? JSON.parse(keyVal || '[]') : (keyVal || []);
  } catch (err) {
    if (typeof keyVal === 'string') {
      list = keyVal.split(',').map((s: any) => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(list)) {
    if (list) {
      list = [list];
    } else {
      list = [];
    }
  }

  if (list.length === 0) {
    return <span className={isDarkMode ? 'text-slate-500 font-mono text-xs' : 'text-slate-400 font-mono text-xs'}>-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 max-w-full justify-center">
      {list.slice(0, 8).map((item: any, idx: number) => {
        let label = '';
        if (item && typeof item === 'object') {
          const name = item.nombre || item.competencia || item.name || '';
          const levelOrPercent = item.nivel || (item.porcentaje ? `${item.porcentaje}%` : '');
          label = levelOrPercent ? `${name} (${levelOrPercent})` : name;
          if (!label && name) label = name;
          if (!label) label = JSON.stringify(item);
        } else {
          label = String(item || '');
        }

        if (!label) return null;

        return (
          <span 
            key={idx} 
            className="px-2.5 py-0.5 rounded-md bg-white/45 dark:bg-white/10 border border-white/60 dark:border-white/10 shadow-sm text-[11px] font-medium text-slate-900 dark:text-slate-100 hover:bg-white/60 dark:hover:bg-white/15 transition-all duration-200 truncate max-w-[160px]" 
            title={label}
          >
            {label}
          </span>
         );
      })}
      {list.length > 8 && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 self-center">+{list.length - 8}</span>
      )}
    </div>
  );
};

const renderIntegrityBadge = (valRaw: any, isDarkMode: boolean) => {
  const val = String(valRaw || '').trim();
  if (!val || val === '-') {
    return <span className={isDarkMode ? 'text-slate-500 font-mono text-xs' : 'text-slate-400 font-mono text-xs'}>-</span>;
  }

  const norm = val.toUpperCase();
  let badgeClasses = '';
  if (norm.includes('OPTIMO') || norm.includes('ÓPTIMO') || norm.includes('ALTO') || norm.includes('BUENO') || norm.includes('CONFIABLE')) {
    badgeClasses = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.05)]';
  } else if (norm.includes('MEDIO') || norm.includes('MODERADO') || norm.includes('ESTÁNDAR') || norm.includes('ESTANDAR')) {
    badgeClasses = 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.05)]';
  } else if (norm.includes('RIESGO') || norm.includes('BAJO') || norm.includes('CRÍTICO') || norm.includes('CRITICO')) {
    badgeClasses = 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.05)]';
  } else {
    badgeClasses = 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 w-fit mx-auto ${badgeClasses}`}>
      <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      {val}
    </span>
  );
};

const renderObservacionesTags = (observaciones: any, isDarkMode: boolean) => {
  if (!observaciones) {
    return <span className={isDarkMode ? 'text-slate-500 font-mono text-xs' : 'text-slate-400 font-mono text-xs'}>-</span>;
  }

  let list: string[] = [];
  if (typeof observaciones === 'string') {
    list = observaciones.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (Array.isArray(observaciones)) {
    list = observaciones.map((s: any) => String(s || '').trim()).filter(Boolean);
  }

  if (list.length === 0) {
    return <span className={isDarkMode ? 'text-slate-500 font-mono text-xs' : 'text-slate-400 font-mono text-xs'}>-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {list.map((obs, idx) => (
        <span 
          key={idx} 
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/45 dark:bg-white/10 border border-white/60 dark:border-white/10 shadow-sm text-[11px] font-medium text-slate-755 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/15 transition-all duration-200"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
          {obs}
        </span>
      ))}
    </div>
  );
};

// Percentage color dynamic helper using exact corporate color codes
const getPercentageColor = (value: number) => {
  if (value <= 50) {
    return {
      text: 'text-[#d95834]',
      bg: 'bg-[#d95834]',
      shadow: 'shadow-[0_0_8px_rgba(217,88,52,0.4)]',
    };
  } else if (value <= 75) {
    return {
      text: 'text-[#debd37]',
      bg: 'bg-[#debd37]',
      shadow: 'shadow-[0_0_8px_rgba(222,189,55,0.4)]',
    };
  } else {
    return {
      text: 'text-[#00AB4E]',
      bg: 'bg-[#00AB4E]',
      shadow: 'shadow-[0_0_8px_rgba(0,171,78,0.4)]',
    };
  }
};

export default function NewComparador({ applicants, isDarkMode = true, onViewProfile, onEditApplicant }: NewComparadorProps) {
  // State for candidates added to comparison
  const [selectedCandidates, setSelectedCandidates] = useState<Applicant[]>([]);

  // States for Soliciting Unit details (local persistence and printing)
  const [solicitanteUnit, setSolicitanteUnit] = useState(() => localStorage.getItem('comparador_solicitante_unit') || '');
  const [solicitanteAgency, setSolicitanteAgency] = useState(() => localStorage.getItem('comparador_solicitante_agency') || '');
  const [solicitanteBlank1, setSolicitanteBlank1] = useState(() => localStorage.getItem('comparador_solicitante_blank1') || '');
  const [solicitanteBlank2, setSolicitanteBlank2] = useState(() => localStorage.getItem('comparador_solicitante_blank2') || '');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(() => localStorage.getItem('comparador_has_confirmed') === 'true');

  useEffect(() => {
    localStorage.setItem('comparador_solicitante_unit', solicitanteUnit);
    localStorage.setItem('comparador_solicitante_agency', solicitanteAgency);
    localStorage.setItem('comparador_solicitante_blank1', solicitanteBlank1);
    localStorage.setItem('comparador_solicitante_blank2', solicitanteBlank2);
    localStorage.setItem('comparador_has_confirmed', String(hasConfirmed));
  }, [solicitanteUnit, solicitanteAgency, solicitanteBlank1, solicitanteBlank2, hasConfirmed]);

  const handleDownloadPDF = () => {
    const processName = selectedCandidates[0]?.role || solicitanteUnit || "General";
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `TABLA COMPARATIVA - ${processName} - ${currentDate}.pdf`;

    const element = document.querySelector('.print-only');
    if (!element) return;

    // Clone the element to render it offscreen so html2pdf can capture it without display:none issues!
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.display = 'block';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = '1200px'; // fixed landscape print width for perfect aspect ratio
    document.body.appendChild(clone);

    const opt = {
      margin:       10,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'landscape' }
    };

    const runHtml2Pdf = () => {
      // @ts-ignore
      if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(clone).save().then(() => {
          document.body.removeChild(clone);
        });
      } else {
        if (clone.parentNode) {
          document.body.removeChild(clone);
        }
      }
    };

    // @ts-ignore
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    } else {
      runHtml2Pdf();
    }
  };

  // State for search query and suggestion list visibility
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sorting order state for CAP
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Track consecutive additions for stable sorting tie-breaker
  const additionOrderRef = useRef<Record<string, number>>({});
  const additionCounterRef = useRef<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);

  // Sticky header states
  const [isScrolled, setIsScrolled] = useState(false);

  // States for custom floating scrollbar/slider
  const [scrollPercent, setScrollPercent] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [isTableVisibleInViewport, setIsTableVisibleInViewport] = useState(false);

  // Sync scroll percentage and detect scroll availability
  const updateScrollStats = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setScrollPercent(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    setCanScroll(maxScroll > 0);
  }, []);

  // Update stats on mount, resize, intersection, or candidates list change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollStats, { passive: true });
    updateScrollStats();

    const ro = new ResizeObserver(() => {
      updateScrollStats();
    });
    ro.observe(el);

    const io = new IntersectionObserver(([entry]) => {
      setIsTableVisibleInViewport(entry.isIntersecting);
    }, { threshold: 0.02 });
    io.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollStats);
      ro.disconnect();
      io.disconnect();
    };
  }, [selectedCandidates, updateScrollStats]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setScrollPercent(value);
    
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    el.scrollLeft = (value / 100) * maxScroll;
  };

  // Simple scroll listener to toggle the sticky compact header
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const headerHeight = row1Ref.current?.offsetHeight || 420;
      
      // The compact header should show precisely when the bottom edge of the large candidate row has completely scrolled out of the viewport
      const shouldShowCompact = rect.top + headerHeight <= 0;
      
      setIsScrolled(shouldShowCompact);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial scroll check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close search dropdown on click/mousedown outside the search container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get index / search list of candidates available from either Google Sheets or local system
  const availableSuggestions = useMemo<CandidateSuggestion[]>(() => {
    return applicants.map(app => ({
      identificador: String(app.institutionalId || app.id || ''),
      name: String(app.name || '')
    }));
  }, [applicants]);

  // Filtered suggestions based on user input
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return availableSuggestions.slice(0, 8); // default recommendations
    const normalizedQuery = searchQuery.toLowerCase();
    return availableSuggestions.filter(item => 
      String(item.identificador || '').toLowerCase().includes(normalizedQuery) ||
      String(item.name || '').toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, availableSuggestions]);

  /**
   * Simulated GAS or Local sheet fetch for single candidate row data
   */
  const fetchCandidateDetails = async (identificador: string): Promise<Applicant> => {
    setIsSearching(true);
    // Simulate real network delay for high-fidelity HR App look & feel
    await new Promise(resolve => setTimeout(resolve, 350));

    // First check if GAS environment is available
    if (typeof (window as any).google !== 'undefined' && (window as any).google.script && (window as any).google.script.run) {
      return new Promise((resolve, reject) => {
        (window as any).google.script.run
          .withSuccessHandler((result: any) => {
            setIsSearching(false);
            if (result) {
              resolve(result as Applicant);
            } else {
              // Extract fallback from local list
              const found = applicants.find(a => a.id === identificador || a.institutionalId === identificador);
              resolve(found || applicants[0]);
            }
          })
          .withFailureHandler((err: any) => {
            console.error("GAS execution failed, recovering with local state:", err);
            setIsSearching(false);
            const found = applicants.find(a => a.id === identificador || a.institutionalId === identificador);
            resolve(found || applicants[0]);
          })
          .getCandidate(identificador);
      });
    }

    // Default Fallback inside development container
    setIsSearching(false);
    const candidate = applicants.find(a => a.id === identificador || a.institutionalId === identificador);
    if (!candidate) {
      throw new Error("Candidate not found");
    }
    return candidate;
  };

  /**
   * Adds a candidate to the state.
   */
  const handleAddCandidate = async (identificador: string) => {
    // Prevent duplicate entries
    if (selectedCandidates.some(c => c.id === identificador || c.institutionalId === identificador)) {
      return;
    }

    try {
      const newCand = await fetchCandidateDetails(identificador);
      
      // Track addition order index for stable sorting tie-breaker
      additionCounterRef.current += 1;
      additionOrderRef.current[identificador] = additionCounterRef.current;

      setSelectedCandidates(prev => [...prev, newCand]);

      // Clear search
      setSearchQuery('');
    } catch (error) {
      console.error("Error adding candidate to comparison:", error);
    }
  };

  const handleRemoveCandidate = (id: string) => {
    setSelectedCandidates(prev => prev.filter(c => c.id !== id && c.institutionalId !== id));
    delete additionOrderRef.current[id];
  };

  const handleClearAll = () => {
    setSelectedCandidates([]);
    additionOrderRef.current = {};
    additionCounterRef.current = 0;
  };

  // Perform sorting dynamically on render (strictly preserves original state variable 'selectedCandidates')
  const sortedCandidates = useMemo(() => {
    const list = [...selectedCandidates];
    return list.sort((a, b) => {
      const capA = a.capScore ?? a.metrics?.technical ?? 0;
      const capB = b.capScore ?? b.metrics?.technical ?? 0;

      if (capB !== capA) {
        return sortOrder === 'desc' ? capB - capA : capA - capB;
      }

      // Stable tie-breaker: chronological order of addition
      const orderA = additionOrderRef.current[a.institutionalId || a.id] || 0;
      const orderB = additionOrderRef.current[b.institutionalId || b.id] || 0;
      return orderA - orderB;
    });
  }, [selectedCandidates, sortOrder]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className={`font-['Exo_2',sans-serif] tracking-tight relative p-6 md:p-8 rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-955/40 border-white/5 text-white' 
        : 'bg-slate-50/40 border-black/5 text-slate-800'
    }`}>
      {/* Decorative premium ambient orbs for realistic Glassmorphism mesh background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 via-rose-500/10 to-transparent blur-[120px] pointer-events-none animate-pulse duration-[10s]" />

      {/* HEADER CONTROLS (Top Left Search Alignment) */}
      <div className="relative z-[9999] flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] ${
              isDarkMode 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-cyan-50 border-cyan-200 text-cyan-600 shadow-[0_4px_12px_rgba(6,182,212,0.08)]'
            }`}>
              <Scale className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Comparador BDP S.A.M.</h2>
              <p className={`text-xs font-mono uppercase mt-0.5 tracking-wider font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Equipo de Reclutamiento y Selección
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
          {/* Rank Sorting Toggle as compact Glassmorphic icon button */}
          {sortedCandidates.length > 0 && (
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              title={`Calificación CAP: ${sortOrder === 'desc' ? 'Descendente (Mayor primero)' : 'Ascendente (Menor primero)'}`}
              className={`p-2.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/15 text-cyan-300 hover:border-cyan-500/30' 
                  : 'bg-white/45 border-white/60 text-cyan-600 shadow-sm hover:bg-white hover:border-cyan-500/35'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Navigation Button 1: Lista de Postulantes */}
          <button
            onClick={() => console.log('Navigation to Lista de Postulantes triggered')}
            title="Lista de Postulantes"
            className={`p-2.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:bg-white/15 text-indigo-300 hover:border-indigo-500/30' 
                : 'bg-white/45 border-white/60 text-indigo-650 shadow-sm hover:bg-white hover:border-indigo-500/35'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Navigation Button 2: Lista de Procesos */}
          <button
            onClick={() => console.log('Navigation to Lista de Procesos triggered')}
            title="Lista de Procesos"
            className={`p-2.5 rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:bg-white/15 text-purple-300 hover:border-purple-500/30' 
                : 'bg-white/45 border-white/60 text-purple-650 shadow-sm hover:bg-white hover:border-purple-500/35'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-400" />
          </button>

          {/* Prominent Confirmar Comparación Button */}
          {sortedCandidates.length > 0 && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-md ${
                isDarkMode 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:shadow-md'
              }`}
            >
              <Check className="w-4 h-4 animate-pulse" />
              <span>Confirmar comparación</span>
              {hasConfirmed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          )}

          {/* Action Button 1: [Printer Icon] (Print) */}
          {selectedCandidates.length > 0 && (
            <button
              onClick={() => window.print()}
              title="Imprimir Comparación"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-md border ${
                isDarkMode 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20' 
                  : 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          )}

          {/* Action Button 2: [Arrow Down Icon] (Download PDF) */}
          {selectedCandidates.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              title="Descargar PDF"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-md border ${
                isDarkMode 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
          )}

          {/* Autocomplete Search Trigger Area - Bulletproof pointer event & layering */}
          <div className="relative z-[9999]" ref={searchContainerRef}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-md ${
                isSearchOpen
                  ? isDarkMode ? 'bg-white/15 border-[#00b0d8]/40 text-[#00b0d8]' : 'bg-white border-[#004a8f] text-[#004a8f]'
                  : isDarkMode ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10' : 'bg-white/45 border-white/60 text-slate-700 hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar Candidato</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/80 text-slate-600'}`}>
                {sortedCandidates.length}
              </span>
            </button>

            {/* Glassmorphic Dropdown Suggestions */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`absolute right-0 mt-3 w-72 sm:w-85 backdrop-blur-2xl z-[9999] overflow-hidden shadow-2xl rounded-3xl border pointer-events-auto ${
                    isDarkMode 
                      ? 'bg-slate-950/95 border-white/10 text-white' 
                      : 'bg-white/95 border-white/50 text-slate-800'
                  }`}
                >
                  {/* Dropdown Header/Search Input */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar identificador o nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent outline-none text-xs py-1 text-slate-800 dark:text-white"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full">
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions List */}
                  <div className="max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#00b0d8]" />
                        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Consultando base de datos...</span>
                      </div>
                    ) : filteredSuggestions.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Sin coincidencias encontradas</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5 dark:divide-white/5">
                        {filteredSuggestions.map((item) => {
                          const isAlreadyAdded = sortedCandidates.some(c => c.id === item.identificador || c.institutionalId === item.identificador);
                          return (
                            <div 
                              key={item.identificador} 
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input field blur
                              }}
                              className={`flex items-center justify-between p-4 text-xs transition-all ${
                                isAlreadyAdded 
                                  ? 'opacity-60 bg-emerald-500/5' 
                                  : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col gap-1 min-w-0 pr-3">
                                <span className={`font-mono text-[10px] font-bold ${isAlreadyAdded ? 'text-emerald-450' : 'text-[#00b0d8]'}`}>
                                  {item.identificador}
                                </span>
                                <span className="font-semibold truncate max-w-[180px]">{item.name}</span>
                              </div>

                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if (!isAlreadyAdded) {
                                    handleAddCandidate(item.identificador);
                                  }
                                }}
                                disabled={isAlreadyAdded}
                                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-1 cursor-pointer ${
                                  isAlreadyAdded
                                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
                                    : isDarkMode 
                                      ? 'bg-white/10 hover:bg-white/20 text-[#00b0d8] border border-white/10 shadow-sm'
                                      : 'bg-white/60 hover:bg-white/90 text-[#004a8f] border border-white/60 shadow-sm'
                                }`}
                              >
                                {isAlreadyAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Agregado</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Agregar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {sortedCandidates.length > 0 && (
            <button
              onClick={handleClearAll}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-md ${
                isDarkMode 
                  ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 hover:bg-rose-500/25' 
                  : 'bg-rose-50/50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar todo</span>
            </button>
          )}
        </div>
      </div>

      {/* CORE DISPLAY (Empty state or sorted columns viewport) */}
      <AnimatePresence mode="wait">
        {sortedCandidates.length === 0 ? (
          <motion.div
            key="empty-state"
            id="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`flex flex-col items-center justify-center py-24 px-8 backdrop-blur-xl border border-dashed transition-all rounded-[2rem] ${
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/30 border-black/10'
            }`}
          >
            {/* Elegant pulse/fade logo mark */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" />
              <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center border transition-all ${
                isDarkMode ? 'bg-slate-950/80 border-cyan-500/30 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-600 shadow-md'
              }`}>
                <Scale className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <h3 className={`text-base font-bold font-mono uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Análisis Comparativo
            </h3>
            <p className={`text-sm font-medium text-center mt-3 max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Añada candidatos usando el menú superior para contrastar perfiles
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="comparison-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 z-10 relative"
          >
            {/* Matrix Viewport Wrapper with Outer Floating Chevrons */}
            <div className="relative">
              {/* Left and Right Scroll Chevrons - Centered Vertically inside the viewport using a sticky overlay */}
              {sortedCandidates.length > 0 && (
                <div className="absolute inset-y-0 -left-5 -right-5 pointer-events-none z-48">
                  <div className="sticky top-1/2 -translate-y-1/2 flex justify-between w-full px-1">
                    <button 
                      onClick={handleScrollLeft}
                      className="pointer-events-auto p-3 rounded-full backdrop-blur-2xl bg-white/75 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                      title="Desplazar a la izquierda"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <button 
                      onClick={handleScrollRight}
                      className="pointer-events-auto p-3 rounded-full backdrop-blur-2xl bg-white/75 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                      title="Desplazar a la derecha"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Horizontal Scrollable Header Row for each candidate */}
              <div 
                ref={scrollContainerRef}
                className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-slate-800/10 relative snap-x snap-mandatory scroll-smooth scroll-pl-[288px]"
              >
                <div className="min-w-max flex flex-col">
                  {/* COMPACT STICKY HEADER ROW (Pins natively on scroll) */}
                  <div className="sticky top-0 z-45 h-0 overflow-visible">
                    <div 
                      className={`w-full flex gap-6 items-stretch py-3 px-2 border-b transition-all duration-300 ${
                        isScrolled 
                          ? isDarkMode 
                            ? 'bg-slate-950/95 border-white/10 shadow-lg backdrop-blur-xl opacity-100 pointer-events-auto' 
                            : 'bg-white/95 border-slate-200/80 shadow-lg backdrop-blur-xl opacity-100 pointer-events-auto'
                          : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      {/* Frozen Left Label Header block for Compact View */}
                      <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-50 backdrop-blur-md rounded-l-xl flex flex-col justify-start transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-950/95' : 'bg-white/95'
                      }`}>
                        {/* COMPACT HEADER LEFT CHIP */}
                        <div className={`w-full transition-colors duration-300 ease-in-out shadow-lg rounded-2xl backdrop-blur-xl p-3 border ${
                          isDarkMode 
                            ? 'bg-slate-900/95 border-white/10 text-white' 
                            : 'bg-white/95 border-white/50 text-slate-800 shadow-sm'
                        }`}>
                          <div className="flex items-center gap-2 px-1 py-0.5">
                            <Scale className="w-4 h-4 text-[#00b0d8] animate-pulse" />
                            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                              Vista Compacta Pinned
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Compact Cards */}
                      {sortedCandidates.map((cand, index) => {
                        const id = cand.institutionalId || cand.id;
                        const rank = index + 1;
                        const score = cand.capScore ?? cand.metrics?.technical ?? 0;
                        const nombres = cand.nombres || '';
                        const apPat = cand.apellido_paterno || '';
                        const apMat = cand.apellido_materno || '';
                        const combinedName = [nombres, apPat, apMat].map(s => String(s || '').trim()).filter(Boolean).join(' ');
                        const finalName = combinedName || cand.name || 'Sin Nombre';
                        const age = cand.age || cand.edad || 'N/A';
                        const loc = cand.localityOfResidence || cand.localidad_residencia || cand.departmentOfResidence || cand.departamento_residencia || 'La Paz';

                        return (
                          <div key={`compact-${id}`} className="w-80 flex-shrink-0 flex-grow-0 text-left snap-start">
                            <div className="w-full transition-all duration-300 ease-in-out shadow-xl rounded-2xl p-3 border border-[#005baa]/30 bg-gradient-to-br from-[#004a8f] via-[#005baa] to-[#00b0d8] text-white">
                              <div className="w-full flex items-center justify-between pr-2">
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 text-white drop-shadow-sm border ${
                                    rank === 1 ? 'bg-amber-500/40 border-amber-400/40' : 'bg-white/15 border-white/25'
                                  }`}>
                                    #{rank}
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold truncate max-w-[170px] leading-tight text-left text-white drop-shadow-sm" title={finalName}>
                                      {finalName}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/90 drop-shadow-sm leading-tight text-left">
                                      {age} años • {loc}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-mono font-black flex-shrink-0 text-white drop-shadow-sm">
                                  {score}% CAP
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STATIC LARGE HEADER ROW FOR CANDIDATES (Never collapses, avoiding layout shifts) */}
                  <div 
                    ref={row1Ref}
                    className="relative z-40 py-3 px-2 flex gap-6 items-stretch border-b border-transparent"
                  >
                    {/* Frozen Left Label Header block */}
                    <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-50 backdrop-blur-md rounded-l-xl flex flex-col justify-start transition-colors duration-300 ${
                      isDarkMode ? 'bg-slate-950/95' : 'bg-white/95'
                    }`}>
                      {/* LARGE HEADER LEFT CARD */}
                      <div className="flex flex-col justify-between p-6 rounded-3xl transition-all duration-350 ease-in-out bg-gradient-to-br from-[#004a8f] via-[#005baa] to-[#00b0d8] text-white border border-[#005baa]/30 shadow-[0_8px_32px_0_rgba(0,74,143,0.15)]">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Scale className="w-4 h-4 text-white animate-pulse" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-100">Dimensión Comparativa</span>
                          </div>
                          <h4 className="text-base font-bold tracking-tight text-white drop-shadow-sm">
                            Cabeceras de Candidatos
                          </h4>
                          <p className="text-xs mt-2.5 leading-relaxed text-white/90">
                            Candidatos ordenados dinámicamente según calificación de aptitud técnica CAP.
                          </p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-dashed border-white/20 text-[10px] font-mono flex items-center justify-between text-white/85">
                          <span>Candidatos: {sortedCandidates.length}</span>
                          <span className="text-white font-bold">Orden: {sortOrder === 'desc' ? 'Desc' : 'Asc'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Columns with only Large views inside */}
                    <AnimatePresence>
                      {sortedCandidates.map((cand, index) => {
                        const id = cand.institutionalId || cand.id;
                        const rank = index + 1;
                        const score = cand.capScore ?? cand.metrics?.technical ?? 0;

                        const nombres = cand.nombres || '';
                        const apPat = cand.apellido_paterno || '';
                        const apMat = cand.apellido_materno || '';
                        const combinedName = [nombres, apPat, apMat].map(s => String(s || '').trim()).filter(Boolean).join(' ');
                        const finalName = combinedName || cand.name || 'Sin Nombre';

                        const level = cand.nivel_academico || cand.education || 'Licenciatura';
                        const field = cand.carrera || '';
                        const academicText = field ? `${level} en ${field}` : level;

                        const worksAtBdp = cand.trabaja_bdp === 'Sí';
                        const bdpRole = cand.cargo_bdp || '';

                        const age = cand.age || cand.edad || 'N/A';
                        const loc = cand.localityOfResidence || cand.localidad_residencia || cand.departmentOfResidence || cand.departamento_residencia || 'La Paz';

                        return (
                          <div key={id} className="w-80 flex-shrink-0 flex-grow-0 text-left flex flex-col gap-4 snap-start">
                            {/* LARGE CARD */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -15 }}
                              transition={{ type: "spring", stiffness: 200, damping: 20 }}
                              className="relative w-full backdrop-blur-xl flex flex-col justify-between group transition-all duration-350 ease-in-out min-h-[380px] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,176,216,0.3)] bg-gradient-to-br from-[#004a8f] via-[#005baa] to-[#00b0d8] text-white border border-[#005baa]/30 shadow-[0_8px_32px_0_rgba(0,74,143,0.15)] rounded-3xl animate-fadeIn"
                            >
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                {/* Top bar */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <div className={`relative px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm border text-white drop-shadow-sm ${
                                    rank === 1
                                      ? 'bg-amber-500/40 border-amber-400/45 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                      : rank === 2
                                        ? 'bg-white/20 border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                                        : 'bg-white/10 border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                      rank === 1 ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : rank === 2 ? 'bg-slate-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-cyan-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                    }`} />
                                    <span>Puesto {rank}</span>
                                  </div>

                                  <div className="flex flex-col items-end gap-0.5">
                                    <span className="font-mono text-[9px] font-bold text-white/90 tracking-wider drop-shadow-sm">
                                      ID: {id}
                                    </span>
                                    <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded text-white border drop-shadow-sm ${
                                      score >= 85 
                                        ? 'bg-[#00AB4E]/45 border-[#00AB4E]/50 shadow-[0_0_8px_rgba(0,171,78,0.3)]' 
                                        : score >= 70 
                                          ? 'bg-[#debd37]/45 border-[#debd37]/50 shadow-[0_0_8px_rgba(222,189,55,0.3)]' 
                                          : 'bg-[#d95834]/45 border-[#d95834]/50 shadow-[0_0_8px_rgba(217,88,52,0.3)]'
                                    }`}>
                                      CAP: {score}%
                                    </span>
                                  </div>
                                </div>

                                {/* Candidate Core Info (Name & Age) */}
                                <div className="mt-1 text-white">
                                  <h4 className="text-base font-bold tracking-tight text-white drop-shadow-sm group-hover:scale-[1.01] transition-transform">
                                    <MarqueeText text={finalName} className="font-bold text-base" />
                                  </h4>
                                  <p className="text-xs text-cyan-100 font-semibold font-mono mt-0.5 drop-shadow-sm">
                                    {age} años
                                  </p>
                                </div>

                                {/* Academic Background */}
                                <div className="mt-3 p-2.5 rounded-2xl border border-white/20 text-xs leading-relaxed bg-white/10 text-white drop-shadow-sm">
                                  <span className="font-mono text-[9px] uppercase font-bold tracking-wider block mb-0.5 text-white/85">
                                    Formación Académica
                                  </span>
                                  <MarqueeText text={academicText} className="font-semibold text-xs" />
                                </div>

                                {/* Location & Status Attributes */}
                                <div className="mt-3 space-y-1.5 text-xs text-white drop-shadow-sm">
                                  <div className="flex justify-between items-center py-1 border-b border-dashed border-white/20">
                                    <span className="text-white/80 font-medium">Residencia:</span>
                                    <span className="font-semibold text-white">
                                      {cand.departmentOfResidence || cand.departamento_residencia || 'La Paz'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-1 border-b border-dashed border-white/20">
                                    <span className="text-white/80 font-medium">Localidad:</span>
                                    <span className="font-semibold text-white">
                                      {cand.localityOfResidence || cand.localidad_residencia || 'No especificada'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-1 border-b border-dashed border-white/20">
                                    <span className="text-white/80 font-medium">Estado Civil:</span>
                                    <span className="font-semibold text-white">
                                      {cand.maritalStatus || cand.estado_civil || 'Soltero/a'}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions Row */}
                                <div className="mt-4 flex items-center gap-2 justify-between">
                                  {/* Profile Button */}
                                  <button
                                    onClick={() => onViewProfile && onViewProfile(id)}
                                    className="flex-1 py-1.5 px-2 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all duration-300 active:scale-95 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-xs"
                                    title="Ver Perfil"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                    <span>Perfil</span>
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    onClick={() => onEditApplicant && onEditApplicant(cand)}
                                    className="flex-1 py-1.5 px-2 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all duration-300 active:scale-95 bg-amber-500/25 border-amber-500/40 text-amber-200 hover:bg-amber-500/35 shadow-xs"
                                    title="Editar Perfil"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Editar</span>
                                  </button>

                                  {/* Delete/Remove Button */}
                                  <button
                                    onClick={() => handleRemoveCandidate(id)}
                                    className="flex-1 py-1.5 px-2 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all duration-300 active:scale-95 bg-rose-500/25 border-rose-500/40 text-rose-200 hover:bg-rose-500/35 shadow-xs"
                                    title="Remover de comparación"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Quitar</span>
                                  </button>
                                </div>
                              </div>

                              {/* Highlighted BDP Employee Segment */}
                              {worksAtBdp && (
                                <div className="px-5 py-3 rounded-b-[1.75rem] border-t border-white/25 text-xs flex items-center gap-2.5 transition-colors bg-emerald-500/25 text-emerald-100">
                                  <div className="p-1 rounded-full bg-emerald-500/30 text-emerald-200">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-300 tracking-wider block">
                                      Empleado BDP
                                    </span>
                                    <MarqueeText text={`Cargo: ${bdpRole || 'No especificado'}`} className="font-bold text-xs" />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* 2. THE DATA GRID STAGE WITH STICKY COMPACT HEADERS */}
                  <div className="space-y-6 mt-8">
                    {/* SECTION 1: RESULTADOS DE EVALUACIÓN */}
                    <div className={`backdrop-blur-xl p-4 ${
                      isDarkMode
                        ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                        : 'bg-white/30 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                    }`}>
                    {/* Header line of Section 1 */}
                    <div className="flex gap-6 items-center py-1.5 px-4 border-b border-white/10 relative">
                      <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1.5 rounded-l-xl flex items-center gap-2 ${
                        isDarkMode ? 'bg-slate-950/90 border-r border-white/5 text-cyan-400' : 'bg-white/90 border-r border-black/5 text-slate-800 shadow-sm'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                          Resultados de Evaluación
                        </span>
                      </div>
                      {sortedCandidates.map((cand) => {
                        const id = cand.institutionalId || cand.id;
                        const shortName = (cand.name || cand.nombres || 'Postulante').split(' ')[0];
                        return (
                          <div key={id} className="w-80 flex-shrink-0 flex-grow-0 text-[10px] font-bold text-slate-450 dark:text-slate-500 font-mono tracking-wider flex items-center justify-center text-center px-4">
                            Ref: {shortName} ({id})
                          </div>
                        );
                      })}
                    </div>

                    <div className="divide-y divide-white/10 dark:divide-white/5">
                      {/* Row 1: Nota CAP */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nota CAP</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Coeficiente de Adecuación al Puesto</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          const score = Number(cand.nota_cap ?? cand.capScore ?? cand.metrics?.technical ?? 0);
                          const scoreColor = getPercentageColor(score);
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center pr-6 pl-4">
                              <div className="w-full flex items-center justify-between gap-3">
                                <span className={`text-xs font-mono font-black pr-1 w-10 ${scoreColor.text}`}>
                                  {score}%
                                </span>
                                <div className="flex-1 bg-slate-200/50 dark:bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[140px] border border-white/5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreColor.bg} ${scoreColor.shadow}`} style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2: Perfil DISC */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Perfil DISC</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Arquetipo de Comportamiento</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          const disc = String(cand.perfil_disc ?? cand.discScore ?? 'N/D').trim();
                          const dUpper = disc.toUpperCase();
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wide uppercase border shadow-sm ${
                                dUpper.includes('D') ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                                dUpper.includes('I') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                                dUpper.includes('S') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                                dUpper.includes('C') ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' :
                                'bg-slate-500/10 text-slate-650 dark:text-slate-400 border-slate-500/30'
                              }`}>
                                {disc}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 3: Nota Currículum */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nota Currículum</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Calificación de Hoja de Vida</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          const score = Number(cand.nota_curriculum ?? cand.curriculumScore ?? 0);
                          const scoreColor = getPercentageColor(score);
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center pr-6 pl-4">
                              <div className="w-full flex items-center justify-between gap-3">
                                <span className={`text-xs font-mono font-black pr-1 w-10 ${scoreColor.text}`}>
                                  {score}%
                                </span>
                                <div className="flex-1 bg-slate-200/50 dark:bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[140px] border border-white/5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreColor.bg} ${scoreColor.shadow}`} style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 4: Nota Conocimientos */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nota Conocimientos</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Evaluación de Conocimientos Técnicos</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          const score = Number(cand.nota_conocimiento ?? cand.knowledgeScore ?? 0);
                          const scoreColor = getPercentageColor(score);
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center pr-6 pl-4">
                              <div className="w-full flex items-center justify-between gap-3">
                                <span className={`text-xs font-mono font-black pr-1 w-10 ${scoreColor.text}`}>
                                  {score}%
                                </span>
                                <div className="flex-1 bg-slate-200/50 dark:bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[140px] border border-white/5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreColor.bg} ${scoreColor.shadow}`} style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 5: Nota Competencias */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nota Competencias</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Calificación de las competencias a nivel general</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          const score = Number(cand.nota_competencias ?? cand.competencyScore ?? 0);
                          const scoreColor = getPercentageColor(score);
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center pr-6 pl-4">
                              <div className="w-full flex items-center justify-between gap-3">
                                <span className={`text-xs font-mono font-black pr-1 w-10 ${scoreColor.text}`}>
                                  {score}%
                                </span>
                                <div className="flex-1 bg-slate-200/50 dark:bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[140px] border border-white/5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreColor.bg} ${scoreColor.shadow}`} style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: CONOCIMIENTOS, HERRAMIENTAS Y COMPETENCIAS */}
                  <div className={`backdrop-blur-xl p-4 ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                      : 'bg-white/30 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                  }`}>
                    <div className="flex gap-6 items-center py-1.5 px-4 border-b border-white/10 relative">
                      <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1.5 rounded-l-xl flex items-center gap-2 ${
                        isDarkMode ? 'bg-slate-950/90 border-r border-white/5 text-cyan-400' : 'bg-white/90 border-r border-black/5 text-slate-800 shadow-sm'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                          Detalle de Competencias y Herramientas
                        </span>
                      </div>
                      {sortedCandidates.map((cand) => (
                        <div key={cand.institutionalId || cand.id} className="w-80 flex-shrink-0 flex-grow-0 text-[10px] font-bold text-slate-450 dark:text-slate-500 font-mono tracking-wider flex items-center justify-center text-center px-4">
                          Detalle Técnico
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-white/10 dark:divide-white/5">
                      {/* Row 1: Conocimientos Técnicos */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Conocimientos Técnicos</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Nivel de conocimientos técnicos</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderListAsRichChips(cand.conocimientos_tecnicos, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2: Manejo de Herramientas u otros */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Manejo de Herramientas u otros</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Nivel de manejo de herramientas</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderListAsRichChips(cand.herramientas, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 3: Competencias o Habilidades */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Competencias o Habilidades</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Listado de competencias y habilidades</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderListAsRichChips(cand.competencias, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: INTEGRIDAD Y CONFIABILIDAD */}
                  <div className={`backdrop-blur-xl p-4 ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                      : 'bg-white/30 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                  }`}>
                    <div className="flex gap-6 items-center py-1.5 px-4 border-b border-white/10 relative">
                      <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1.5 rounded-l-xl flex items-center gap-2 ${
                        isDarkMode ? 'bg-slate-950/90 border-r border-white/5 text-cyan-400' : 'bg-white/90 border-r border-black/5 text-slate-800 shadow-sm'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                          Integridad y Confiabilidad
                        </span>
                      </div>
                      {sortedCandidates.map((cand) => (
                        <div key={cand.institutionalId || cand.id} className="w-80 flex-shrink-0 flex-grow-0 text-[10px] font-bold text-slate-450 dark:text-slate-500 font-mono tracking-wider flex items-center justify-center text-center px-4">
                          Reporte de Veracidad
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-white/10 dark:divide-white/5">
                      {/* Row 1: Confiabilidad e Integridad */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Confiabilidad e Integridad</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Mide la honestidad y el compromiso con las normas</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderIntegrityBadge(cand.nivel_general_confiabilidad, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2: Nivel de Integridad */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nivel de Integridad</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Firmeza de los principios morales del postulante</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderIntegrityBadge(cand.nivel_integridad, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 3: Nivel de Riesgo de Robo */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nivel de Riesgo de Robo</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Probabilidad de cometer o justificar sustracciones</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderIntegrityBadge(cand.riesgo_robo, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 4: Nivel de Riesgo de Mentira */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Nivel de Riesgo de Mentira</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Tendencia a exagerar o distorsionar la verdad</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderIntegrityBadge(cand.riesgo_mentira, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: OBSERVACIONES */}
                  <div className={`backdrop-blur-xl p-4 ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                      : 'bg-white/30 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem]'
                  }`}>
                    <div className="flex gap-6 items-center py-1.5 px-4 border-b border-white/10 relative">
                      <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1.5 rounded-l-xl flex items-center gap-2 ${
                        isDarkMode ? 'bg-slate-950/90 border-r border-white/5 text-cyan-400' : 'bg-white/90 border-r border-black/5 text-slate-800 shadow-sm'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                          Observaciones Recientes
                        </span>
                      </div>
                      {sortedCandidates.map((cand) => (
                        <div key={cand.institutionalId || cand.id} className="w-80 flex-shrink-0 flex-grow-0 text-[10px] font-bold text-slate-450 dark:text-slate-500 font-mono tracking-wider flex items-center justify-center text-center px-4">
                          Banderas y Alertas
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-white/10 dark:divide-white/5">
                      {/* Row 1: Observaciones */}
                      <div className="flex gap-6 items-stretch py-1.5 px-4 transition-all duration-300 ease-out hover:bg-cyan-50/30 dark:hover:bg-white/5">
                        <div className={`w-72 flex-shrink-0 flex-grow-0 sticky left-0 z-20 backdrop-blur-md px-4 py-1 rounded-l-xl flex flex-col justify-center ${
                          isDarkMode ? 'bg-slate-950/90 border-r border-white/5' : 'bg-white/90 border-r border-black/5 shadow-sm'
                        }`}>
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Observaciones</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono leading-tight">Diferentes anotaciones a considerar en la selección</span>
                        </div>
                        {sortedCandidates.map((cand) => {
                          const id = cand.institutionalId || cand.id;
                          return (
                            <div key={id} className="w-80 flex-shrink-0 flex-grow-0 flex items-center justify-center text-center px-4">
                              {renderObservacionesTags(cand.observaciones, isDarkMode)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* FLOATING CONTROLLER AT THE BOTTOM OF THE VIEWPORT */}
            <AnimatePresence>
              {selectedCandidates.length > 0 && canScroll && isTableVisibleInViewport && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                >
                  <div className={`flex flex-col gap-1 w-[320px] md:w-[420px] p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-900/95 border-white/10 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)]' 
                      : 'bg-white/95 border-slate-200/80 text-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.15)]'
                  }`}>
                    {/* Header line inside the floating controller */}
                    <div className="flex items-center justify-between px-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#00b0d8] animate-pulse" />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                          Navegación Rápida
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {sortedCandidates.length} candidatos
                      </span>
                    </div>

                    {/* Slider Line */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleScrollLeft}
                        className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/80 border-white/5 hover:bg-slate-700 text-slate-300' 
                            : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-650'
                        }`}
                        title="Scroll Izquierda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="0.1"
                          value={scrollPercent} 
                          onChange={handleSliderChange}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-ew-resize focus:outline-none transition-colors"
                          style={{
                            background: isDarkMode
                              ? `linear-gradient(to right, #00b0d8 0%, #00b0d8 ${scrollPercent}%, #334155 ${scrollPercent}%, #334155 100%)`
                              : `linear-gradient(to right, #00b0d8 0%, #00b0d8 ${scrollPercent}%, #cbd5e1 ${scrollPercent}%, #cbd5e1 100%)`
                          }}
                        />
                      </div>

                      <button 
                        onClick={handleScrollRight}
                        className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/80 border-white/5 hover:bg-slate-700 text-slate-300' 
                            : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-650'
                        }`}
                        title="Scroll Derecha"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Datos de la Unidad Solicitante */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border backdrop-blur-2xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-900/90 border-white/10 text-white' 
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200/20 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                    Datos de la Unidad Solicitante
                  </h3>
                </div>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full cursor-pointer transition-all"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-mono leading-relaxed text-slate-500 dark:text-slate-300">
                  Por favor ingrese la información de la Unidad Solicitante para validar el comparador de candidatos. Estos datos se guardarán localmente y se imprimirán en el reporte oficial.
                </p>

                {/* Input 1: Nombre de la Unidad Solicitante */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                    Nombre de la Unidad Solicitante
                  </label>
                  <input
                    type="text"
                    value={solicitanteUnit}
                    onChange={(e) => setSolicitanteUnit(e.target.value)}
                    placeholder="Ej. Gerencia de Finanzas, Subgerencia de Operaciones"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Input 2: Agencia o Sucursal */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                    Agencia o Sucursal
                  </label>
                  <input
                    type="text"
                    value={solicitanteAgency}
                    onChange={(e) => setSolicitanteAgency(e.target.value)}
                    placeholder="Ej. Oficina Nacional, Sucursal La Paz"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Additional Blank Fields for printing */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                      Nota en Blanco 1 (Impresión)
                    </label>
                    <input
                      type="text"
                      value={solicitanteBlank1}
                      onChange={(e) => setSolicitanteBlank1(e.target.value)}
                      placeholder="Ej. Firma Autorizada"
                      className={`w-full px-3 py-2 rounded-xl border text-[11px] focus:outline-none transition-all ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                      Nota en Blanco 2 (Impresión)
                    </label>
                    <input
                      type="text"
                      value={solicitanteBlank2}
                      onChange={(e) => setSolicitanteBlank2(e.target.value)}
                      placeholder="Ej. Sello de Unidad"
                      className={`w-full px-3 py-2 rounded-xl border text-[11px] focus:outline-none transition-all ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200/20 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-900 hover:text-black'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasConfirmed(true);
                    setIsConfirmModalOpen(false);
                  }}
                  disabled={!solicitanteUnit.trim() || !solicitanteAgency.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-500/25"
                >
                  Guardar y Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY AREA FOR PERFECT RESOLUTION DOCUMENT PRODUCTION */}
      <div className="print-only w-full bg-white text-black font-sans p-6">
        {/* COVER PAGE */}
        <div className="page-break flex flex-col justify-between items-center text-center h-[250mm] py-20 px-12 border-[12px] border-double border-[#004a8f]/60 rounded-3xl" style={{ boxSizing: 'border-box' }}>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#004a8f] uppercase leading-none">
              BANCO DE DESARROLLO PRODUCTIVO - BDP S.A.M.
            </h1>
            <div className="w-24 h-1.5 bg-[#00b0d8] mx-auto mt-6 rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-lg font-bold tracking-widest text-[#005baa] uppercase">
              RECLUTAMIENTO Y SELECCIÓN
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              COMPARADOR DE CANDIDATOS
            </h2>
          </div>

          <div className="space-y-2 font-mono text-xs text-slate-600">
            <p className="uppercase font-bold tracking-wider">RECLUTAMIENTO Y SELECCIÓN BDP</p>
            <p className="font-semibold">Fecha y Hora de Emisión: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* COMPARISON TABLES REPORT PAGE */}
        <div className="w-full">
          {/* Document Header */}
          <div className="flex justify-between items-center border-b-4 border-[#004a8f] pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-xl font-black text-[#004a8f] uppercase tracking-tight">
                BANCO DE DESARROLLO PRODUCTIVO - BDP S.A.M.
              </h2>
              <p className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                RECLUTAMIENTO Y SELECCIÓN - COMPARADOR DE POSTULANTES
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <p className="font-bold">MÓDULO: NUEVO COMPARADOR</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Candidates List Row Side-By-Side (Formatted for Landscape Print) */}
          <h3 className="text-base font-black uppercase text-[#004a8f] mb-4 tracking-wider">
            Detalle de Comparación de Perfiles de Candidatos
          </h3>

          <table className="w-full border-collapse border border-slate-300 text-xs text-slate-900">
            <thead>
              <tr className="bg-[#f1f5f9] border-b border-slate-300">
                <th className="border border-slate-300 p-2 text-left font-black text-[#004a8f] w-1/4">Aspecto de Evaluación</th>
                {sortedCandidates.map((cand, idx) => (
                  <th key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center font-black text-[#004a8f]">
                    Candidato {idx + 1}: {cand.nombres || cand.name || 'Sin Nombre'} {cand.apellido_paterno || ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {/* Row 1: Identificador */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Identificador BDP</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center font-mono">
                    {cand.institutionalId || 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Row 2: Nivel Académico */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Nivel Académico</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                    {cand.nivel_academico || cand.education || 'Licenciatura'}
                  </td>
                ))}
              </tr>
              {/* Row 3: Cargo Postulado */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Cargo Postulado</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                    {cand.cargo_postulado || cand.appliedRole || 'Asistente de Negocios'}
                  </td>
                ))}
              </tr>
              {/* Row 4: Nota CAP */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Calificación Nota CAP</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center font-black text-[#004a8f]">
                    {cand.nota_cap || cand.capScore || 0}%
                  </td>
                ))}
              </tr>
              {/* Row 5: Perfil DISC */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Perfil de Compatibilidad DISC</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center font-bold">
                    {cand.perfil_disc || cand.discProfile || 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Row 6: Confiabilidad */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Confiabilidad e Integridad</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                    {cand.confiabilidad_integridad || 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Row 7: Conocimientos Técnicos */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Conocimientos Técnicos</td>
                {sortedCandidates.map((cand) => {
                  let items: any[] = [];
                  try {
                    items = typeof cand.conocimientos_tecnicos === 'string' ? JSON.parse(cand.conocimientos_tecnicos) : (cand.conocimientos_tecnicos || []);
                  } catch(e) {
                    items = String(cand.conocimientos_tecnicos || '').split(',');
                  }
                  return (
                    <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                      {items.map((i: any) => String(i).trim()).filter(Boolean).join(', ') || '-'}
                    </td>
                  );
                })}
              </tr>
              {/* Row 8: Herramientas */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Manejo de Herramientas u otros</td>
                {sortedCandidates.map((cand) => {
                  let items: any[] = [];
                  try {
                    items = typeof cand.herramientas === 'string' ? JSON.parse(cand.herramientas) : (cand.herramientas || []);
                  } catch(e) {
                    items = String(cand.herramientas || '').split(',');
                  }
                  return (
                    <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                      {items.map((i: any) => String(i).trim()).filter(Boolean).join(', ') || '-'}
                    </td>
                  );
                })}
              </tr>
              {/* Row 9: Competencias */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Competencias o Habilidades</td>
                {sortedCandidates.map((cand) => {
                  let items: any[] = [];
                  try {
                    items = typeof cand.competencias === 'string' ? JSON.parse(cand.competencias) : (cand.competencias || []);
                  } catch(e) {
                    items = String(cand.competencias || '').split(',');
                  }
                  return (
                    <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                      {items.map((i: any) => String(i).trim()).filter(Boolean).join(', ') || '-'}
                    </td>
                  );
                })}
              </tr>
              {/* Row 10: Funcionario Activo */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Funcionario Activo / Cargo BDP</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-center">
                    {cand.es_funcionario_activo ? `Sí (${cand.cargo_actual || 'N/A'})` : 'No'}
                  </td>
                ))}
              </tr>
              {/* Row 11: Observaciones */}
              <tr>
                <td className="border border-slate-300 p-2 font-bold bg-[#f8fafc]">Observaciones Clave</td>
                {sortedCandidates.map((cand) => (
                  <td key={cand.institutionalId || cand.id} className="border border-slate-300 p-2 text-left text-[11px] leading-relaxed">
                    {(() => {
                      if (!cand.observaciones) return 'Sin observaciones registradas.';
                      let list: string[] = [];
                      if (typeof cand.observaciones === 'string') {
                        list = cand.observaciones.split(',').map((s: string) => s.trim()).filter(Boolean);
                      } else if (Array.isArray(cand.observaciones)) {
                        list = cand.observaciones.map((s: any) => String(s || '').trim()).filter(Boolean);
                      }
                      return list.length > 0 ? list.join(', ') : 'Sin observaciones registradas.';
                    })()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Requesting Unit Details Panel below the table */}
          <div className="mt-12 p-6 border-2 border-slate-200 bg-slate-50 rounded-2xl print-avoid-break">
            <h4 className="text-sm font-black uppercase text-[#004a8f] mb-3 tracking-wider">
              Datos de Confirmación de la Unidad Solicitante
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs leading-relaxed">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Unidad Solicitante</p>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{solicitanteUnit || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Agencia o Sucursal</p>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{solicitanteAgency || 'No especificada'}</p>
              </div>
              {solicitanteBlank1 && (
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Campo de Impresión 1</p>
                  <p className="text-slate-900 font-medium mt-0.5">{solicitanteBlank1}</p>
                </div>
              )}
              {solicitanteBlank2 && (
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Campo de Impresión 2</p>
                  <p className="text-slate-900 font-medium mt-0.5">{solicitanteBlank2}</p>
                </div>
              )}
              <div className="col-span-2 mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-mono text-[10px] text-slate-500">RECLUTAMIENTO Y SELECCIÓN BDP</span>
                <span className="font-mono text-[10px] text-slate-500">Fecha y hora de confirmación: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signature Sections */}
          <div className="mt-16 grid grid-cols-2 gap-12 print-avoid-break">
            <div className="text-center pt-8 border-t border-slate-300">
              <p className="font-mono text-[10px] text-slate-400">FIRMA Y SELLO DE LA UNIDAD SOLICITANTE</p>
              <p className="font-bold text-xs text-slate-700 mt-1 uppercase">{solicitanteUnit || 'RESPONSABLE'}</p>
            </div>
            <div className="text-center pt-8 border-t border-slate-300">
              <p className="font-mono text-[10px] text-slate-400">RECLUTAMIENTO Y SELECCIÓN BDP</p>
              <p className="font-bold text-xs text-slate-700 mt-1 uppercase">BANCO DE DESARROLLO PRODUCTIVO S.A.M.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
