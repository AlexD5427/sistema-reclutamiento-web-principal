import React, { useState, useEffect, useRef } from 'react';
import { Applicant, ConocimientoTecnico, HerramientaOtro, CompetenciaHabilidad } from '../types';
import { DISC_ARCHETYPES } from '../data/discArchetypes';
import Avatar, { getInitials } from './Avatar';
import { 
  Users, Search, Filter, Plus, Edit3, Trash2, Eye, Award, CheckCircle2, AlertTriangle, 
  HelpCircle, ChevronLeft, ChevronRight, UserPlus, Info, BookOpen, MapPin, Sparkles, Check, Heart, HelpCircle as HelpIcon, ShieldCheck, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getDiscColor = (code: string) => {
  if (!code || code === 'N/A') return '#00b0d8';
  const upper = code.toUpperCase();
  if (upper.startsWith('D')) return '#f43f5e'; // Red/Rose
  if (upper.startsWith('I')) return '#f59e0b'; // Yellow/Amber
  if (upper.startsWith('S')) return '#10b981'; // Green/Emerald
  if (upper.startsWith('C')) return '#0ea5e9'; // Blue/Cyan
  
  if (upper.includes('D')) return '#f43f5e';
  if (upper.includes('I')) return '#f59e0b';
  if (upper.includes('S')) return '#10b981';
  if (upper.includes('C')) return '#0ea5e9';
  
  return '#00b0d8';
};

interface CandidateListSectionProps {
  applicants: Applicant[];
  onAddApplicant: (app: Applicant) => void;
  onUpdateApplicant: (app: Applicant) => void;
  onDeleteApplicant: (id: string) => void;
  isDarkMode?: boolean;
  globalCompetencias?: string[];
}

// -------------------------------------------------------------
// Speedometer/Interactive Gauge Component
// -------------------------------------------------------------
interface SpeedometerGaugeProps {
  label: string;
  value: number; // 0 - 100
  onChange: (val: number) => void;
  isDarkMode: boolean;
}

export const SpeedometerGauge = React.memo(function SpeedometerGauge({ label, value, onChange, isDarkMode }: SpeedometerGaugeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempText(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempText(e.target.value);
  };

  const commitValue = () => {
    setIsEditing(false);
    let num = parseInt(tempText, 10);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue();
    } else if (e.key === 'Escape') {
      setTempText(value.toString());
      setIsEditing(false);
    }
  };

  // SVG parameters
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Let's draw an arc representing 240 degrees (from 150deg to 390deg)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (value / 100) * arcLength;

  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-between transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/45 border-white/5 shadow-inner' 
        : 'bg-white border-[#AAB9C2]/30 shadow-sm'
    }`}>
      <span className={`text-[11px] font-mono uppercase tracking-wider text-center ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
        {label}
      </span>

      {/* Speedometer SVG */}
      <div className="relative w-28 h-20 mt-3 mb-1 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-120" viewBox="0 0 100 100">
          {/* Base Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Status Ring (Speedometer meter) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="url(#speedometer-grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="speedometer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004a8f" />
              <stop offset="50%" stopColor="#00b0d8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text (Interactive Click) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              pattern="[0-9]*"
              value={tempText}
              onChange={handleInputChange}
              onBlur={commitValue}
              onKeyDown={handleKeyDown}
              className={`w-12 text-center font-bold font-mono text-base border rounded py-0.5 outline-none tracking-tight ${
                isDarkMode 
                  ? 'bg-slate-950 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                  : 'bg-slate-50 border-indigo-500 text-[#004a8f]'
              }`}
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="group cursor-pointer text-center relative flex items-baseline justify-center select-none"
              title="Click para editar manualmente"
            >
              <span className={`text-xl font-black font-mono tracking-tight transition-colors duration-200 ${
                isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-[#004a8f]'
              }`}>
                {value}
              </span>
              <span className="text-[10px] font-bold text-slate-400 ml-0.5">%</span>
              {/* Pulsing indicator to show it is editable */}
              <div className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
          <span className="text-[7.5px] font-mono tracking-wider uppercase text-slate-400 font-bold mt-0.5">Nota</span>
        </div>
      </div>

      {/* Slider */}
      <div className="w-full px-2 mt-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-[#00b0d8] h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-800"
        />
      </div>
    </div>
  );
});

// -------------------------------------------------------------
// Comma separated tag input component
// -------------------------------------------------------------
interface ObservationsTagInputProps {
  tags: string[];
  onChange: (updatedTags: string[]) => void;
  isDarkMode: boolean;
}

export const ObservationsTagInput = React.memo(function ObservationsTagInput({ tags, onChange, isDarkMode }: ObservationsTagInputProps) {
  const [typedText, setTypedText] = useState('');

  const processInput = (text: string) => {
    if (text.includes(',')) {
      const parts = text.split(',');
      const finalTags = [...tags];
      // The last element is whatever remains after the last comma
      const remaining = parts.pop() || '';
      
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed && !finalTags.includes(trimmed)) {
          finalTags.push(trimmed);
        }
      });
      
      onChange(finalTags);
      setTypedText(remaining);
    } else {
      setTypedText(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = typedText.trim();
      if (trimmed && !tags.includes(trimmed)) {
        const updated = [...tags, trimmed];
        onChange(updated);
      }
      setTypedText('');
    } else if (e.key === 'Backspace' && typedText === '' && tags.length > 0) {
      // Remove last tag
      const updated = tags.slice(0, -1);
      onChange(updated);
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updated = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      isDarkMode ? 'bg-slate-900/25 border-white/5' : 'bg-white border-[#AAB9C2]/35'
    }`}>
      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
        Observaciones (Separe por comas para generar etiquetas)
      </label>
      
      <div className="flex flex-wrap gap-2 items-center min-h-[42px] p-1.5 rounded-lg bg-slate-100/40 dark:bg-slate-950/40 border border-[#AAB9C2]/15 dark:border-white/5">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-medium transition-all ${
              isDarkMode 
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300' 
                : 'bg-indigo-50 border border-indigo-200 text-[#004a8f]'
            }`}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="hover:scale-125 hover:text-rose-500 transition-transform font-bold leading-none cursor-pointer text-xs"
            >
              ×
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={typedText}
          onChange={(e) => processInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Escriba observaciones separadas por coma..." : "Añadir más..."}
          className="flex-1 bg-transparent border-none outline-none text-xs min-w-[150px] p-1 dark:text-white dark:placeholder-slate-500 text-slate-800 placeholder-slate-400"
        />
      </div>
    </div>
  );
});

const EVALUAR_COMPETENCIES = [
  "Liderazgo",
  "Trabajo en equipo",
  "Pensamiento Estratégico",
  "Comunicación Efectiva",
  "Resolución de Problemas",
  "Orientación al Cliente",
  "Capacidad de Análisis",
  "Adaptabilidad",
  "Iniciativa",
  "Toma de Decisiones",
  "Innovación",
  "Negociación",
  "Inteligencia Emocional",
  "Gestión del Tiempo",
  "Orientación a Resultados"
];

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function CandidateListSection({
  applicants,
  onAddApplicant,
  onUpdateApplicant,
  onDeleteApplicant,
  isDarkMode = true,
  globalCompetencias = [],
}: CandidateListSectionProps) {
  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResidenceDept, setSelectedResidenceDept] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [selectedTrabajaBdp, setSelectedTrabajaBdp] = useState('all');
  const [selectedReliability, setSelectedReliability] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Registration Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listConocimientoError, setListConocimientoError] = useState<string | null>(null);
  const [listHerramientaError, setListHerramientaError] = useState<string | null>(null);
  const [listCompetenciaError, setListCompetenciaError] = useState<string | null>(null);
  const [discTooltipOpen, setDiscTooltipOpen] = useState(false);

  // --- Form fields ---
  // Datos Personales
  const [formIdentificador, setFormIdentificador] = useState('');
  const [formNombres, setFormNombres] = useState('');
  const [formApellidoPaterno, setFormApellidoPaterno] = useState('');
  const [formApellidoMaterno, setFormApellidoMaterno] = useState('');
  const [formAge, setFormAge] = useState(30);

  // Dynamic Array-based lists
  const [formConocimientosTecnicos, setFormConocimientosTecnicos] = useState<ConocimientoTecnico[]>([]);
  const [formHerramientasOtros, setFormHerramientasOtros] = useState<HerramientaOtro[]>([]);
  const [formCompetenciasHabilidades, setFormCompetenciasHabilidades] = useState<CompetenciaHabilidad[]>([]);

  // UI Temp states for dynamic lists addition flows
  const [showAddConocimiento, setShowAddConocimiento] = useState(false);
  const [tempConocimientoNombre, setTempConocimientoNombre] = useState('');

  const [showAddHerramienta, setShowAddHerramienta] = useState(false);
  const [tempHerramientaNombre, setTempHerramientaNombre] = useState('');

  const [showAddCompetencia, setShowAddCompetencia] = useState(false);
  const [tempCompetenciaSearch, setTempCompetenciaSearch] = useState('');
  const [tempCompetenciaSelected, setTempCompetenciaSelected] = useState<string | null>(null);
  const [tempValorEsperado, setTempValorEsperado] = useState<number | ''>('');
  const [tempValorObtenido, setTempValorObtenido] = useState<number | ''>('');
  const [competenciaComboboxOpen, setCompetenciaComboboxOpen] = useState(false);
  const [formDeptResidence, setFormDeptResidence] = useState('');
  const [formLocalityResidence, setFormLocalityResidence] = useState('');
  const [formMaritalStatus, setFormMaritalStatus] = useState('');
  const [formNivelAcademico, setFormNivelAcademico] = useState('Licenciatura');
  const [formCarrera, setFormCarrera] = useState('');
  const formAcademicDegree = formCarrera ? `${formNivelAcademico} en ${formCarrera}` : formNivelAcademico;
  
  // Custom BDP current employment fields
  const [formTrabajaBdp, setFormTrabajaBdp] = useState<'Sí' | 'No'>('No');
  const [formCargoBdp, setFormCargoBdp] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Resultados de Evaluación
  const [formCapScore, setFormCapScore] = useState(85);
  const [formDiscScore, setFormDiscScore] = useState<string | number>(85);
  const [formCurriculumScore, setFormCurriculumScore] = useState(85);
  const [formKnowledgeScore, setFormKnowledgeScore] = useState(85);
  const [formCompetencyScore, setFormCompetencyScore] = useState(85);

  // Conocimientos Técnicos
  const [formTechnicalLevel, setFormTechnicalLevel] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');
  const [formToolsHandlingLevel, setFormToolsHandlingLevel] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');
  const [formReliability, setFormReliability] = useState<string>('Confiable');
  const [formIntegrityLevel, setFormIntegrityLevel] = useState<'Bajo' | 'Medio' | 'Alto'>('Alto');
  const [formTheftRisk, setFormTheftRisk] = useState<'Bajo' | 'Medio' | 'Alto'>('Bajo');
  const [formLyingRisk, setFormLyingRisk] = useState<'Bajo' | 'Medio' | 'Alto'>('Bajo');

  // Observaciones list
  const [formObservations, setFormObservations] = useState<string[]>([]);

  // Backup & Exit Confirmation states
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isMouseOverFormRef = React.useRef(false);

  // Backup form data automatically as the user types
  useEffect(() => {
    if (isFormOpen && !isEditing) {
      const backupData = {
        formIdentificador,
        formNombres,
        formApellidoPaterno,
        formApellidoMaterno,
        formAge,
        formDeptResidence,
        formLocalityResidence,
        formMaritalStatus,
        formNivelAcademico,
        formCarrera,
        formTrabajaBdp,
        formCargoBdp,
        formCapScore,
        formDiscScore,
        formCurriculumScore,
        formKnowledgeScore,
        formCompetencyScore,
        formTechnicalLevel,
        formToolsHandlingLevel,
        formReliability,
        formIntegrityLevel,
        formTheftRisk,
        formLyingRisk,
        formConocimientosTecnicos,
        formHerramientasOtros,
        formCompetenciasHabilidades,
        formObservations,
        timestamp: Date.now()
      };
      localStorage.setItem('candidate_form_backup', JSON.stringify(backupData));
    }
  }, [
    isFormOpen,
    isEditing,
    formIdentificador,
    formNombres,
    formApellidoPaterno,
    formApellidoMaterno,
    formAge,
    formDeptResidence,
    formLocalityResidence,
    formMaritalStatus,
    formNivelAcademico,
    formCarrera,
    formTrabajaBdp,
    formCargoBdp,
    formCapScore,
    formDiscScore,
    formCurriculumScore,
    formKnowledgeScore,
    formCompetencyScore,
    formTechnicalLevel,
    formToolsHandlingLevel,
    formReliability,
    formIntegrityLevel,
    formTheftRisk,
    formLyingRisk,
    formConocimientosTecnicos,
    formHerramientasOtros,
    formCompetenciasHabilidades,
    formObservations
  ]);

  // Default selection set
  useEffect(() => {
    if (applicants.length > 0 && !selectedId) {
      setSelectedId(applicants[0].id);
    }
  }, [applicants, selectedId]);

  // Handle setting active profile for details mapping
  const activeCandidate = applicants.find(a => a.id === selectedId) || applicants[0] || null;

  // Filter logic
  const departments = Array.from(new Set(applicants.map(a => a.departmentOfResidence || 'La Paz')));
  const degrees = Array.from(new Set(applicants.map(a => a.degree || a.education || 'Licenciatura')));

  const filteredCandidates = applicants.filter(cand => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      cand.name.toLowerCase().includes(term) ||
      (cand.role && cand.role.toLowerCase().includes(term)) ||
      (cand.degree && cand.degree.toLowerCase().includes(term)) ||
      (cand.education && cand.education.toLowerCase().includes(term)) ||
      (cand.id && String(cand.id).toLowerCase().includes(term)) ||
      (cand.institutionalId && String(cand.institutionalId).toLowerCase().includes(term));
    
    const candidateDept = cand.departmentOfResidence || 'La Paz';
    const matchDept = selectedResidenceDept === 'all' || candidateDept === selectedResidenceDept;
    
    const candidateDegree = cand.degree || cand.education || 'Licenciatura';
    const matchDegree = selectedDegree === 'all' || candidateDegree === selectedDegree;

    const worksBdp = cand.trabaja_bdp || 'No';
    const matchTrabajaBdp = selectedTrabajaBdp === 'all' || worksBdp === selectedTrabajaBdp;

    const reliabilityVal = cand.reliabilityAndIntegrity || 'Confiable';
    const matchReliability = selectedReliability === 'all' || reliabilityVal === selectedReliability;

    return matchSearch && matchDept && matchDegree && matchTrabajaBdp && matchReliability;
  });

  // Calculate generic scorecard average percentage
  const getCandidateAverage = (cand: Applicant) => {
    const rawDisc = cand.discScore;
    const discNum = typeof rawDisc === 'number' ? rawDisc : 80;
    const scores = [
      cand.capScore || cand.metrics?.technical || 80,
      discNum,
      cand.curriculumScore || 80,
      cand.knowledgeScore || 80,
      cand.competencyScore || 80
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Reset and open form for creating a new candidate with empty state
  const openCreateFormEmpty = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormIdentificador('');
    setFormNombres('');
    setFormApellidoPaterno('');
    setFormApellidoMaterno('');
    setFormAge(28);
    setFormDeptResidence('La Paz');
    setFormLocalityResidence('');
    setFormMaritalStatus('Soltero/a');
    setFormNivelAcademico('Licenciatura');
    setFormCarrera('');

    setFormTrabajaBdp('No');
    setFormCargoBdp('');
    setShowSaveConfirm(false);

    setFormCapScore(80);
    setFormDiscScore("N/A");
    setFormCurriculumScore(80);
    setFormKnowledgeScore(80);
    setFormCompetencyScore(80);

    setFormTechnicalLevel('Medio');
    setFormToolsHandlingLevel('Medio');
    setFormReliability('Confiable');
    setFormIntegrityLevel('Medio');
    setFormTheftRisk('Bajo');
    setFormLyingRisk('Bajo');

    setFormConocimientosTecnicos([]);
    setFormHerramientasOtros([]);
    setFormCompetenciasHabilidades([]);
    setShowAddConocimiento(false);
    setTempConocimientoNombre('');
    setShowAddHerramienta(false);
    setTempHerramientaNombre('');
    setShowAddCompetencia(false);
    setTempCompetenciaSearch('');
    setTempCompetenciaSelected(null);

    setFormObservations([]);
    setIsFormOpen(true);
  };

  // Open candidate creation form with backup check
  const openCreateForm = () => {
    const backup = localStorage.getItem('candidate_form_backup');
    if (backup) {
      setShowBackupPrompt(true);
    } else {
      openCreateFormEmpty();
    }
  };

  // Load the incomplete backup record and resume
  const loadBackupData = () => {
    const backupStr = localStorage.getItem('candidate_form_backup');
    if (!backupStr) return;
    try {
      const backup = JSON.parse(backupStr);
      setIsEditing(false);
      setEditingId(null);
      
      setFormIdentificador(backup.formIdentificador || '');
      setFormNombres(backup.formNombres || '');
      setFormApellidoPaterno(backup.formApellidoPaterno || '');
      setFormApellidoMaterno(backup.formApellidoMaterno || '');
      setFormAge(backup.formAge || 28);
      setFormDeptResidence(backup.formDeptResidence || 'La Paz');
      setFormLocalityResidence(backup.formLocalityResidence || '');
      setFormMaritalStatus(backup.formMaritalStatus || 'Soltero/a');
      setFormNivelAcademico(backup.formNivelAcademico || 'Licenciatura');
      setFormCarrera(backup.formCarrera || '');

      setFormTrabajaBdp(backup.formTrabajaBdp || 'No');
      setFormCargoBdp(backup.formCargoBdp || '');
      setShowSaveConfirm(false);

      setFormCapScore(backup.formCapScore ?? 80);
      setFormDiscScore(backup.formDiscScore ?? 'N/A');
      setFormCurriculumScore(backup.formCurriculumScore ?? 80);
      setFormKnowledgeScore(backup.formKnowledgeScore ?? 80);
      setFormCompetencyScore(backup.formCompetencyScore ?? 80);

      setFormTechnicalLevel(backup.formTechnicalLevel || 'Medio');
      setFormToolsHandlingLevel(backup.formToolsHandlingLevel || 'Medio');
      setFormReliability(backup.formReliability || 'Confiable');
      setFormIntegrityLevel(backup.formIntegrityLevel || 'Medio');
      setFormTheftRisk(backup.formTheftRisk || 'Bajo');
      setFormLyingRisk(backup.formLyingRisk || 'Bajo');

      setFormConocimientosTecnicos(backup.formConocimientosTecnicos || []);
      setFormHerramientasOtros(backup.formHerramientasOtros || []);
      setFormCompetenciasHabilidades(backup.formCompetenciasHabilidades || []);
      
      setFormObservations(backup.formObservations || []);

      setShowAddConocimiento(false);
      setTempConocimientoNombre('');
      setShowAddHerramienta(false);
      setTempHerramientaNombre('');
      setShowAddCompetencia(false);
      setTempCompetenciaSearch('');
      setTempCompetenciaSelected(null);

      setIsFormOpen(true);
      setShowBackupPrompt(false);
    } catch (e) {
      console.error("Error parsing backup data:", e);
      openCreateFormEmpty();
      setShowBackupPrompt(false);
    }
  };

  // Discard the backup data and open a fresh form
  const discardBackupData = () => {
    localStorage.removeItem('candidate_form_backup');
    openCreateFormEmpty();
    setShowBackupPrompt(false);
  };

  // Open edit form populated with Candidate data
  const openEditCandidateForm = (cand: Applicant) => {
    setIsEditing(true);
    setEditingId(cand.id);
    
    setFormIdentificador(cand.institutionalId || cand.id);

    // Populate split names with safety logic
    let n = cand.nombres || '';
    let ap = cand.apellido_paterno || '';
    let am = cand.apellido_materno || '';
    if (!n && !ap && !am && cand.name) {
      const parts = String(cand.name || '').trim().split(/\s+/);
      if (parts.length === 1) {
        n = parts[0];
      } else if (parts.length === 2) {
        n = parts[0];
        ap = parts[1];
      } else if (parts.length === 3) {
        n = parts[0];
        ap = parts[1];
        am = parts[2];
      } else if (parts.length >= 4) {
        n = parts.slice(0, parts.length - 2).join(' ');
        ap = parts[parts.length - 2];
        am = parts[parts.length - 1];
      }
    }
    setFormNombres(n);
    setFormApellidoPaterno(ap);
    setFormApellidoMaterno(am);

    setFormAge(cand.age || 30);
    setFormDeptResidence(cand.departmentOfResidence || 'La Paz');
    setFormLocalityResidence(cand.localityOfResidence || '');
    setFormMaritalStatus(cand.maritalStatus || 'Soltero/a');
    const rawDegree = cand.degree || cand.education || 'Licenciatura';
    let level = 'Licenciatura';
    if (rawDegree.startsWith('Bachiller')) {
      level = 'Bachiller';
    } else if (rawDegree.startsWith('Técnico Medio')) {
      level = 'Técnico Medio';
    } else if (rawDegree.startsWith('Técnico Superior')) {
      level = 'Técnico Superior';
    } else if (rawDegree.startsWith('Licenciatura')) {
      level = 'Licenciatura';
    }
    setFormNivelAcademico(level);
    
    let career = rawDegree;
    if (rawDegree.startsWith(level)) {
      career = rawDegree.replace(level, '').trim();
      if (career.toLowerCase().startsWith('en ')) {
        career = career.slice(3).trim();
      } else if (career.startsWith('-')) {
        career = career.slice(1).trim();
      }
    }
    setFormCarrera(career);

    setFormTrabajaBdp((cand as any).trabajaBdp || 'No');
    setFormCargoBdp((cand as any).cargoBdp || '');
    setShowSaveConfirm(false);

    setFormCapScore(cand.capScore || 80);
    setFormDiscScore(cand.discScore !== undefined ? cand.discScore : "N/A");
    setFormCurriculumScore(cand.curriculumScore || 80);
    setFormKnowledgeScore(cand.knowledgeScore || 80);
    setFormCompetencyScore(cand.competencyScore || 80);

    setFormTechnicalLevel(cand.technicalKnowledgeLevel || 'Medio');
    setFormToolsHandlingLevel(cand.toolsHandlingLevel || 'Medio');
    setFormReliability(cand.reliabilityAndIntegrity || 'Confiable');
    setFormIntegrityLevel(cand.integrityLevel || 'Medio');
    setFormTheftRisk(cand.theftRiskLevel || 'Bajo');
    setFormLyingRisk(cand.lyingRiskLevel || 'Bajo');

    setFormConocimientosTecnicos(cand.conocimientos_tecnicos || []);
    setFormHerramientasOtros(cand.herramientas_otros || []);
    setFormCompetenciasHabilidades(cand.competencias_habilidades || []);
    setShowAddConocimiento(false);
    setTempConocimientoNombre('');
    setShowAddHerramienta(false);
    setTempHerramientaNombre('');
    setShowAddCompetencia(false);
    setTempCompetenciaSearch('');
    setTempCompetenciaSelected(null);

    setFormObservations(cand.observations || cand.skills || []);
    setIsFormOpen(true);
  };

  // Process the Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (isEditing) {
      setShowSaveConfirm(true);
    } else {
      executeFormSubmit();
    }
  };

  // Pure data synchronization / save execution logic
  const executeFormSubmit = async () => {
    const generatedId = isEditing && editingId ? editingId : `app-custom-${Date.now()}`;
    const compositeName = `${formNombres} ${formApellidoPaterno} ${formApellidoMaterno}`.replace(/\s+/g, ' ').trim() || 'Postulante Sin Nombre';
    const existingCand = isEditing ? applicants.find(a => a.id === editingId) : null;
    const mappedMetrics = {
      technical: formCapScore,
      communication: existingCand?.metrics?.communication || 75,
      leadership: existingCand?.metrics?.leadership || 75,
      cultureFit: typeof formDiscScore === 'number' ? formDiscScore : 80,
      experience: Math.min(Math.max(1, Math.round((formAge - 20) * 0.4)), 20),
      problemSolving: existingCand?.metrics?.problemSolving || 75
    };

    const updatedApplicant: Applicant = {
      id: generatedId,
      name: compositeName,
      nombres: formNombres,
      apellido_paterno: formApellidoPaterno,
      apellido_materno: formApellidoMaterno,
      conocimientos_tecnicos: formConocimientosTecnicos,
      herramientas_otros: formHerramientasOtros,
      competencias_habilidades: formCompetenciasHabilidades,
      email: `${compositeName.trim().toLowerCase().replace(/\s+/g, '.')}@postulante.bdp.com.bo`,
      phone: `+591 7${Math.floor(Math.random() * 90000000) + 10000000}`,
      agency: "Registro Directo BDP",
      role: formAcademicDegree.includes("Sistemas") || formAcademicDegree.includes("Informática") ? "Analista de Sistemas" : "Especialista Operativo BDP",
      status: "New",
      metrics: mappedMetrics,
      skills: formObservations.length > 0 ? formObservations : ["Evaluado BDP"],
      resumeSummary: `Postulante de ${formAge} años residente de ${formDeptResidence}. Formación académica: ${formAcademicDegree}. Cumple satisfactoriamente con los criterios internos de selección de personal institucional.`,
      notes: formObservations.join(", ") || "Formulario de registro inicial completado e interactuado vía matriz interna.",
      avatarUrl: undefined, // remove external image URL
      experienceYears: Math.min(Math.max(1, Math.round((formAge - 22) * 0.7)), 20),
      education: formAcademicDegree,
      expectedSalary: `${Math.floor(formCapScore * 80) + 4000} BOB / mes`,
      timeline: [
        { id: `t1-${Date.now()}`, stage: "Formulario Sincronizado", date: new Date().toISOString().split('T')[0], status: "completed", note: "Información personal y evaluación agregada al portal corporativo." }
      ],
      updatedAt: new Date().toISOString(),
      
      // Personal Details questionnaire specific fields
      institutionalId: formIdentificador,
      age: formAge,
      departmentOfResidence: formDeptResidence,
      localityOfResidence: formLocalityResidence,
      maritalStatus: formMaritalStatus,
      degree: formAcademicDegree,
      formacion_academica: formAcademicDegree,
      nivel_academico: formNivelAcademico,
      carrera: formCarrera,

      // Evaluation & scores specific metrics
      capScore: formCapScore,
      discScore: formDiscScore,
      curriculumScore: formCurriculumScore,
      knowledgeScore: formKnowledgeScore,
      competencyScore: formCompetencyScore,
      leadershipCompetency: existingCand?.leadershipCompetency || existingCand?.metrics?.leadership || 75,
      strategicCompetency: existingCand?.strategicCompetency || existingCand?.metrics?.problemSolving || 75,
      effectiveCommCompetency: existingCand?.effectiveCommCompetency || existingCand?.metrics?.communication || 75,

      // Technical & tools dropdowns
      technicalKnowledgeLevel: formTechnicalLevel,
      toolsHandlingLevel: formToolsHandlingLevel,
      reliabilityAndIntegrity: formReliability,
      integrityLevel: formIntegrityLevel,
      theftRiskLevel: formTheftRisk,
      lyingRiskLevel: formLyingRisk,

      // Observations tags
      observations: formObservations,

      // Custom BDP current employment fields
      trabajaBdp: formTrabajaBdp,
      cargoBdp: formTrabajaBdp === 'Sí' ? formCargoBdp : undefined
    } as any;

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    // Build the specific flat JSON structure with keys exactly maps to user requirements
    const payload = {
      identificador: formIdentificador,
      nombre_completo: compositeName,
      nombres: formNombres,
      apellido_paterno: formApellidoPaterno,
      apellido_materno: formApellidoMaterno,
      conocimientos_tecnicos: JSON.stringify(formConocimientosTecnicos),
      herramientas_otros: JSON.stringify(formHerramientasOtros),
      competencias_habilidades: JSON.stringify(formCompetenciasHabilidades),
      herramientas: JSON.stringify(formHerramientasOtros),
      competencias: JSON.stringify(formCompetenciasHabilidades),
      edad: Number(formAge),
      departamento_residencia: formDeptResidence,
      localidad_residencia: formLocalityResidence,
      estado_civil: formMaritalStatus,
      formacion_academica: formAcademicDegree,
      nivel_academico: formNivelAcademico,
      carrera: formCarrera,
      nota_cap: Number(formCapScore),
      perfil_disc: typeof formDiscScore === 'string' ? formDiscScore : (Number(formDiscScore) || 80),
      nota_curriculum: Number(formCurriculumScore),
      nota_conocimiento: Number(formKnowledgeScore),
      nota_competencias: Number(formCompetencyScore),
      nivel_conocimientos_tecnicos: formTechnicalLevel,
      nivel_manejo_herramientas: formToolsHandlingLevel,
      nivel_general_confiabilidad: formReliability,
      nivel_integridad: formIntegrityLevel,
      riesgo_robo: formTheftRisk,
      riesgo_mentira: formLyingRisk,
      observaciones: formObservations.join(", "),
      trabaja_bdp: formTrabajaBdp,
      cargo_bdp: formTrabajaBdp === 'Sí' ? formCargoBdp : '',
      ...(isEditing ? { action: "update" } : {})
    };

    try {
      const SCRIPT_URL = (import.meta as any).env.VITE_SCRIPT_URL || (typeof process !== 'undefined' ? process.env.REACT_APP_SCRIPT_URL : '') || "https://script.google.com/macros/s/AKfycby5iqFsfvuL6movHAfZ46CZZuND22M1J-R-D3BLv2mx-a8lmRa_AePbmV59jPRTA-hczQ/exec";
      console.log("CURRENT SCRIPT URL:", SCRIPT_URL);
      
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload),
        mode: "no-cors",
        redirect: "follow"
      });

      // Update the Local React State list for immediate responsiveness in the app directory
      if (isEditing) {
        onUpdateApplicant(updatedApplicant);
      } else {
        onAddApplicant(updatedApplicant);
        setSelectedId(generatedId);
      }

      setSubmitSuccess("¡Socio Postulante registrado y sincronizado con éxito con Google Sheets!");
      
      // Clean and reset all form fields upon success
      setTimeout(() => {
        setFormIdentificador('');
        setFormNombres('');
        setFormApellidoPaterno('');
        setFormApellidoMaterno('');
        setFormAge(28);
        setFormDeptResidence('La Paz');
        setFormLocalityResidence('');
        setFormMaritalStatus('Soltero/a');
        setFormNivelAcademico('Licenciatura');
        setFormCarrera('');
        setFormTrabajaBdp('No');
        setFormCargoBdp('');
        setFormCapScore(80);
        setFormDiscScore(80);
        setFormCurriculumScore(80);
        setFormKnowledgeScore(80);
        setFormCompetencyScore(80);
        setFormTechnicalLevel('Medio');
        setFormToolsHandlingLevel('Medio');
        setFormReliability('Confiable');
        setFormIntegrityLevel('Medio');
        setFormTheftRisk('Bajo');
        setFormLyingRisk('Bajo');
        setFormConocimientosTecnicos([]);
        setFormHerramientasOtros([]);
        setFormCompetenciasHabilidades([]);
        setFormObservations([]);
        
        // Remove backup since it's successfully submitted
        localStorage.removeItem('candidate_form_backup');

        setSubmitSuccess(null);
        setIsFormOpen(false);
      }, 2500);

    } catch (err: any) {
      console.error("Fetch Error details in CandidateListSection:", {
        message: err?.message,
        status: err?.status || (err?.response ? err?.response?.status : undefined)
      });
      setSubmitError(err.message || "Error al sincronizar con Google Sheets.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dynamic array-based list event handlers ---
  const [tempConocimientoNivel, setTempConocimientoNivel] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');
  const [tempConocimientoDetalle, setTempConocimientoDetalle] = useState('');

  const [tempHerramientaNivel, setTempHerramientaNivel] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');

  const [tempCompetenciaPorcentaje, setTempCompetenciaPorcentaje] = useState(80);

  const handleAddConocimientoClick = () => {
    if (!tempConocimientoNombre.trim()) {
      setListConocimientoError("Por favor escriba el nombre del conocimiento.");
      return;
    }
    if (formConocimientosTecnicos.length >= 7) {
      setListConocimientoError("Límite alcanzado: máximo 7 conocimientos técnicos.");
      return;
    }
    setListConocimientoError(null);
    setShowAddConocimiento(true);
  };

  const handleConfirmConocimiento = () => {
    if (!tempConocimientoNombre.trim()) return;
    const newItem = {
      nombre: tempConocimientoNombre.trim(),
      nivel: tempConocimientoNivel,
      detalle: tempConocimientoDetalle.trim() || undefined
    };
    setFormConocimientosTecnicos([...formConocimientosTecnicos, newItem]);
    setTempConocimientoNombre('');
    setTempConocimientoNivel('Medio');
    setTempConocimientoDetalle('');
    setShowAddConocimiento(false);
    setListConocimientoError(null);
  };

  const handleRemoveConocimiento = (index: number) => {
    setFormConocimientosTecnicos(formConocimientosTecnicos.filter((_, idx) => idx !== index));
    setListConocimientoError(null);
  };

  const handleAddHerramientaClick = () => {
    if (!tempHerramientaNombre.trim()) {
      setListHerramientaError("Por favor escriba el nombre de la herramienta.");
      return;
    }
    if (formHerramientasOtros.length >= 5) {
      setListHerramientaError("Límite alcanzado: máximo 5 herramientas.");
      return;
    }
    setListHerramientaError(null);
    setShowAddHerramienta(true);
  };

  const handleConfirmHerramienta = () => {
    if (!tempHerramientaNombre.trim()) return;
    const newItem = {
      nombre: tempHerramientaNombre.trim(),
      nivel: tempHerramientaNivel
    };
    setFormHerramientasOtros([...formHerramientasOtros, newItem]);
    setTempHerramientaNombre('');
    setTempHerramientaNivel('Medio');
    setShowAddHerramienta(false);
    setListHerramientaError(null);
  };

  const handleRemoveHerramienta = (index: number) => {
    setFormHerramientasOtros(formHerramientasOtros.filter((_, idx) => idx !== index));
    setListHerramientaError(null);
  };

  const handleSelectCompetencia = (comp: string) => {
    setTempCompetenciaSelected(comp);
    setTempCompetenciaSearch(comp);
    setCompetenciaComboboxOpen(false);
    setListCompetenciaError(null);
    setShowAddCompetencia(true); // Open configuration card
    setTempValorEsperado('');   // default values are empty
    setTempValorObtenido('');
  };

  const handleConfirmCompetencia = () => {
    if (!tempCompetenciaSelected) return;
    if (formCompetenciasHabilidades.length >= 7) {
      setListCompetenciaError("Límite alcanzado: máximo 7 competencias.");
      return;
    }
    
    const valEsperado = tempValorEsperado === '' ? 0 : tempValorEsperado;
    const valObtenido = tempValorObtenido === '' ? 0 : tempValorObtenido;
    const rawBrecha = valObtenido - valEsperado;
    const roundedBrecha = Math.round(rawBrecha * 10) / 10;
    const liveBrecha = roundedBrecha > 0 ? 0 : roundedBrecha;

    let liveAjuste = '0%';
    if (valEsperado > 0) {
      const pct = Math.round((valObtenido / valEsperado) * 100);
      const capped = Math.min(100, pct);
      liveAjuste = `${capped}%`;
    }

    const newItem = {
      nombre: tempCompetenciaSelected,
      competencia: tempCompetenciaSelected,
      porcentaje: parseInt(liveAjuste) || valObtenido,
      
      // new complex object properties
      name: tempCompetenciaSelected,
      esperado: valEsperado,
      obtenido: valObtenido,
      brecha: liveBrecha,
      ajuste: liveAjuste
    };

    setFormCompetenciasHabilidades([...formCompetenciasHabilidades, newItem]);
    setTempCompetenciaSelected(null);
    setTempCompetenciaSearch('');
    setTempValorEsperado('');
    setTempValorObtenido('');
    setShowAddCompetencia(false);
    setListCompetenciaError(null);
  };

  const handleRemoveCompetencia = (index: number) => {
    setFormCompetenciasHabilidades(formCompetenciasHabilidades.filter((_, idx) => idx !== index));
  };

  const competencySource = globalCompetencias && globalCompetencias.length > 0 ? globalCompetencias : EVALUAR_COMPETENCIES;

  const filteredCompetencies = competencySource.filter(comp => {
    const alreadyAdded = formCompetenciasHabilidades.some(item => {
      const name = item.competencia || item.nombre || item.name || '';
      return name.toLowerCase() === comp.toLowerCase();
    });
    if (alreadyAdded) return false;
    return comp.toLowerCase().includes(tempCompetenciaSearch.toLowerCase());
  });

  return (
    <div className="w-full">
      {/* 1. COMPONENT CONTROLLER HEADER */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm transition-all duration-300 ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-[#AAB9C2]/40 shadow-sm'
      }`}>
        <div className="flex items-center gap-4.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
            isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-indigo-50 border-[#004a8f]/35 text-[#004a8f]'
          }`}>
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
              Portal de Directorio y Gestión de Postulantes
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Consola global de perfiles registrados con indicadores psicométricos, integrales y técnicos extendidos.
            </p>
          </div>
        </div>

        {/* Create Candidate Fast Action Button */}
        <button
          onClick={openCreateForm}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all shadow-md cursor-pointer hover:-translate-y-0.5 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-cyan-500 to-[#00b0d8] text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110'
              : 'bg-gradient-to-r from-[#004a8f] to-[#00b0d8] text-white hover:brightness-105'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>REGISTRAR NUEVO POSTULANTE</span>
        </button>
      </div>

      {/* 2. ADVANCED MULTI-FILTERS BAR */}
      <div className={`backdrop-blur-xl border rounded-2xl p-5 mb-8 flex flex-col gap-4 shadow-sm transition-all duration-300 ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-[#AAB9C2]/30 shadow-xs'
      }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-200/40 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-xs font-mono font-black tracking-wider uppercase">Filtros Avanzados de Búsqueda</span>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedResidenceDept('all');
              setSelectedDegree('all');
              setSelectedTrabajaBdp('all');
              setSelectedReliability('all');
            }}
            className={`py-1.5 px-3.5 border rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all hover:scale-102 cursor-pointer ${
              isDarkMode 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20' 
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            RESTABLECER TODO
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar postulante o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-white/10 text-white focus:border-cyan-500/50' 
                  : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Dept filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedResidenceDept}
              onChange={(e) => setSelectedResidenceDept(e.target.value)}
              className={`flex-1 p-2 border rounded-xl text-xs outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
              }`}
            >
              <option value="all">Todo Dep. Residencia</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Academic degree filter */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className={`flex-1 p-2 border rounded-xl text-xs outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
              }`}
            >
              <option value="all">Toda Formación</option>
              {degrees.map(deg => (
                <option key={deg} value={deg}>{deg}</option>
              ))}
            </select>
          </div>

          {/* Works at BDP filter */}
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedTrabajaBdp}
              onChange={(e) => setSelectedTrabajaBdp(e.target.value)}
              className={`flex-1 p-2 border rounded-xl text-xs outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
              }`}
            >
              <option value="all">Filtro: Funcionario BDP</option>
              <option value="Sí">Trabaja en BDP (Sí)</option>
              <option value="No">No trabaja en BDP (No)</option>
            </select>
          </div>

          {/* Reliability Filter */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedReliability}
              onChange={(e) => setSelectedReliability(e.target.value)}
              className={`flex-1 p-2 border rounded-xl text-xs outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
              }`}
            >
              <option value="all">Filtro: Confiabilidad</option>
              <option value="Confiable">Confiable</option>
              <option value="Poco Confiable">Poco Confiable</option>
              <option value="No Confiable">No Confiable</option>
              <option value="Bajo">Evaluación de Riesgo Bajo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CORE ADAPTIVE WORKSPACE split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CANDIDATES CONTAINER INDEX (GRID COL 5) */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">
              POSTULANTES ENCONTRADOS ({filteredCandidates.length})
            </span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className={`backdrop-blur-xl border rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <HelpCircle className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
              <p className="text-xs font-bold font-mono">NINGÚN COMPATIBLE</p>
              <p className="text-[10px] mt-1 text-slate-500">Intente relajando los criterios de búsqueda.</p>
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const capVal = cand.capScore || cand.metrics?.technical || 85;
              const isSelected = selectedId === cand.id;
              
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedId(cand.id)}
                  className={`border rounded-2xl p-4.5 cursor-pointer flex items-center justify-between transition-all duration-300 relative group overflow-hidden ${
                    isSelected 
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-cyan-950/25 to-slate-900/60 border-cyan-500 shadow-[0_4px_25px_rgba(6,182,212,0.15)] bg-slate-950' 
                        : 'bg-indigo-50/50 border-[#004a8f] shadow-md bg-indigo-50/20'
                      : isDarkMode 
                        ? 'bg-white/5 border-white/5 hover:border-slate-700 hover:bg-white/10' 
                        : 'bg-white border-[#AAB9C2]/30 hover:border-[#004a8f]/60 hover:shadow-xs'
                  }`}
                >
                  {/* Subtle selection shine band */}
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500" />
                  )}

                  <div className="flex items-center gap-3.5 max-w-[70%]">
                    <Avatar name={cand.name} className="w-11 h-11 text-sm" />
                    
                    <div className="leading-tight truncate">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs font-bold tracking-tight truncate max-w-[145px] ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          {cand.name}
                        </h4>
                        <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-400/10 dark:bg-white/5 text-slate-400">
                          {cand.age || 30} Años
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {cand.formacion_academica || cand.degree || cand.education || 'Sin formación'}
                      </p>
                      
                      {/* Department indicator */}
                      <span className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {cand.departmentOfResidence || 'La Paz'}
                      </span>
                    </div>
                  </div>

                  {/* Right score label + options buttons */}
                  <div className="flex flex-col items-end gap-1 font-mono leading-none">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 dark:text-cyan-400 font-extrabold uppercase scale-90">CAP</span>
                      <span className={`text-[13px] font-black ${isDarkMode ? 'text-cyan-300' : 'text-[#004a8f]'}`}>
                        {capVal}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCandidateForm(cand);
                        }}
                        className={`p-1.5 rounded transition-all border shrink-0 ${
                          isDarkMode 
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20' 
                            : 'bg-indigo-50 border-indigo-200 text-[#004a8f] hover:bg-indigo-100'
                        }`}
                        title="Modificar cuestionario"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Quitar definitivamente la ficha de ${cand.name}?`)) {
                            onDeleteApplicant(cand.id);
                          }
                        }}
                        className={`p-1.5 rounded transition-all border shrink-0 ${
                          isDarkMode 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        }`}
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: REVELATORY DEEP CANDIDATE COGNITIVE REPORT (GRID COL 7) */}
        <div className="lg:col-span-7">
          {activeCandidate ? (
            <div className={`backdrop-blur-xl border rounded-3xl p-6 shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-[#AAB9C2]/45'
            }`}>
              
              {/* Header inside Scorecard */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mb-5 gap-4 border-slate-200/40 dark:border-white/5">
                <div className="flex items-center gap-3.5">
                  <Avatar name={activeCandidate.name} className="w-14 h-14 rounded-2xl text-base" />
                  <div className="leading-tight">
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                      ID: {activeCandidate.institutionalId || activeCandidate.id}
                    </span>
                    <h3 className={`text-base font-black tracking-tight mt-1 truncate max-w-[220px] ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                      {activeCandidate.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono italic mt-0.5 truncate max-w-[230px]">
                      {activeCandidate.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditCandidateForm(activeCandidate)}
                    className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-mono font-bold transition-all border duration-200 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 shadow-sm' 
                        : 'bg-indigo-50 border-indigo-300/60 text-[#004a8f] hover:bg-indigo-100/90 shadow-xs'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDITAR PERFIL</span>
                  </button>
                </div>
              </div>

              {/* SECTION: DATOS PERSONALES CARD LAYOUT */}
              <div className="space-y-4.5 mb-6">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Datos Personales</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-sans text-xs">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Identificador</p>
                    <p className={`font-semibold mt-1 font-mono truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {activeCandidate.institutionalId || 'No Registrado'}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Edad</p>
                    <p className={`font-semibold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {activeCandidate.age || 'No Registrado'} Años
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Estado Civil</p>
                    <p className={`font-semibold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {activeCandidate.maritalStatus || 'No Registrado'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Departamento de Residencia</p>
                    <p className={`font-semibold mt-1 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {activeCandidate.departmentOfResidence || 'La Paz'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Localidad de Residencia</p>
                    <p className={`font-semibold mt-1 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {activeCandidate.localityOfResidence || 'Ninguna especificada'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Grado Académico</p>
                    <p className={`font-semibold mt-1 truncate italic text-[11px] ${isDarkMode ? 'text-slate-200' : 'text-[#004a8f]'}`} title={activeCandidate.degree || activeCandidate.education}>
                      {activeCandidate.degree || activeCandidate.education || 'Ninguno'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Funcionario BDP</p>
                    <p className={`font-semibold mt-1 truncate text-[11px] ${
                      activeCandidate.trabaja_bdp === 'Sí' 
                        ? 'text-emerald-500 font-bold' 
                        : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                    }`} title={activeCandidate.trabaja_bdp === 'Sí' ? `Sí - ${activeCandidate.cargo_bdp || 'Cargo no especificado'}` : 'No'}>
                      {activeCandidate.trabaja_bdp === 'Sí' 
                        ? `Sí (${activeCandidate.cargo_bdp || 'Especificado'})` 
                        : 'No trabaja en BDP'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: RESULTADOS DE EVALUACIÓN VELOCÍMETROS & METRICS */}
              <div className="space-y-4 mb-6 border-t pt-5 border-slate-200/40 dark:border-white/5">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] flex items-center gap-1 mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Resultados de Evaluación</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  {/* Gauge 1 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <span className="text-[8px] font-mono uppercase tracking-wide text-slate-400">Nota CAP</span>
                    <span className={`text-[15px] font-black font-mono mt-1 ${isDarkMode ? 'text-indigo-300' : 'text-[#004a8f]'}`}>
                      {activeCandidate.capScore || activeCandidate.metrics?.technical || 80}%
                    </span>
                  </div>
                  {/* Gauge 2 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <span className="text-[8px] font-mono uppercase tracking-wide text-slate-400">Perfil DISC</span>
                    <span className={`text-[15px] font-black font-mono mt-1 ${isDarkMode ? 'text-[#00b0d8]' : 'text-[#00b0d8]'}`}>
                      {activeCandidate.discScore || activeCandidate.metrics?.cultureFit || 80}
                    </span>
                  </div>
                  {/* Gauge 3 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <span className="text-[8px] font-mono uppercase tracking-wide text-slate-400">Currículum</span>
                    <span className={`text-[15px] font-black font-mono mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-[#00b0d8]'}`}>
                      {activeCandidate.curriculumScore || activeCandidate.metrics?.experience || 80}%
                    </span>
                  </div>
                  {/* Gauge 4 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <span className="text-[8px] font-mono uppercase tracking-wide text-slate-400">Conocimientos</span>
                    <span className={`text-[15px] font-black font-mono mt-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                      {activeCandidate.knowledgeScore || activeCandidate.metrics?.technical || 80}%
                    </span>
                  </div>
                  {/* Gauge 5 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <span className="text-[8px] font-mono uppercase tracking-wide text-slate-400">Competencias</span>
                    <span className={`text-[15px] font-black font-mono mt-1 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                      {activeCandidate.competencyScore || activeCandidate.metrics?.problemSolving || 80}%
                    </span>
                  </div>
                </div>

                {/* Cognitive breakdown metrics list */}
                <div className={`p-3.5 rounded-xl border-dashed border font-sans text-xs space-y-2 mt-4 ${
                  isDarkMode ? 'border-white/10 text-slate-300' : 'border-slate-300 text-slate-600 bg-slate-100/30'
                }`}>
                  <p className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-slate-400">Desglose de Competencias</p>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-[11px]">Potencial de Liderazgo:</span>
                    <span className={`font-mono font-bold font-black ${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'}`}>
                      {activeCandidate.leadershipCompetency || activeCandidate.metrics?.leadership || 80}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-200/45 dark:border-white/5">
                    <span className="font-semibold text-[11px]">Pensamiento Estratégico:</span>
                    <span className={`font-mono font-bold font-black ${isDarkMode ? 'text-[#00b0d8]' : 'text-[#004a8f]'}`}>
                      {activeCandidate.strategicCompetency || activeCandidate.metrics?.problemSolving || 80}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-200/45 dark:border-white/5">
                    <span className="font-semibold text-[11px]">Comunicación Efectiva:</span>
                    <span className={`font-mono font-bold font-black ${isDarkMode ? 'text-emerald-400' : 'text-[#004a8f]'}`}>
                      {activeCandidate.effectiveCommCompetency || activeCandidate.metrics?.communication || 80}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: CONOCIMIENTOS TÉCNICOS & RISKS MAP */}
              <div className="space-y-4 mb-6 border-t pt-5 border-slate-200/40 dark:border-white/5">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conocimientos Técnicos, Herramientas, Confiabilidad e Integridad</span>
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Conocimientos Solicitados</span>
                    <span className={`text-[11px] font-bold mt-1 uppercase ${
                      activeCandidate.technicalKnowledgeLevel === 'Alto' ? 'text-emerald-500' : activeCandidate.technicalKnowledgeLevel === 'Bajo' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {activeCandidate.technicalKnowledgeLevel || 'Medio'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Manejo de Herramientas/Idiomas</span>
                    <span className={`text-[11px] font-bold mt-1 uppercase ${
                      activeCandidate.toolsHandlingLevel === 'Alto' ? 'text-emerald-500' : activeCandidate.toolsHandlingLevel === 'Bajo' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {activeCandidate.toolsHandlingLevel || 'Medio'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Confiabilidad e Integridad</span>
                    <span className={`text-[11.5px] font-bold mt-1 uppercase ${
                      activeCandidate.reliabilityAndIntegrity === 'Confiable' ? 'text-emerald-500' : 'text-rose-400 font-extrabold'
                    }`}>
                      {activeCandidate.reliabilityAndIntegrity || 'Confiable'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Nivel de Integridad</span>
                    <span className={`text-[11px] font-bold mt-1 uppercase ${
                      activeCandidate.integrityLevel === 'Alto' ? 'text-emerald-500' : activeCandidate.integrityLevel === 'Bajo' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {activeCandidate.integrityLevel || 'Medio'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Nivel de Hurto/Robo (Riesgo)</span>
                    <span className={`text-[11px] font-bold mt-1 uppercase ${
                      activeCandidate.theftRiskLevel === 'Alto' ? 'text-rose-500 font-extrabold' : activeCandidate.theftRiskLevel === 'Medio' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {activeCandidate.theftRiskLevel || 'Bajo'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex flex-col ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/20'}`}>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase">Nivel de Mentira/Engaño (Riesgo)</span>
                    <span className={`text-[11px] font-bold mt-1 uppercase ${
                      activeCandidate.lyingRiskLevel === 'Alto' ? 'text-rose-500 font-extrabold' : activeCandidate.lyingRiskLevel === 'Medio' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {activeCandidate.lyingRiskLevel || 'Bajo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: OBSERVACIONES TAG LABELS */}
              <div className="space-y-3.5 mb-2 border-t pt-5 border-slate-200/40 dark:border-white/5">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Observaciones Generadas</span>
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {(activeCandidate.observations && activeCandidate.observations.length > 0) ? (
                    activeCandidate.observations.map((obs, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-medium font-sans px-3 py-1.5 rounded-full border tracking-wide uppercase shadow-sm ${
                          isDarkMode 
                            ? 'bg-slate-900 border-white/10 text-slate-300' 
                            : 'bg-slate-50 border-[#AAB9C2]/35 text-[#004a8f]'
                        }`}
                      >
                        ✔ {obs}
                      </span>
                    ))
                  ) : (activeCandidate.skills && activeCandidate.skills.length > 0) ? (
                    activeCandidate.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-medium font-sans px-3 py-1.5 rounded-full border tracking-wide uppercase shadow-sm ${
                          isDarkMode 
                            ? 'bg-slate-900 border-white/10 text-slate-300' 
                            : 'bg-slate-50 border-[#AAB9C2]/35 text-[#004a8f]'
                        }`}
                      >
                        ✔ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Ninguna observación ni etiqueta disponible para este postulante.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className={`backdrop-blur-xl border rounded-3xl p-12 text-center h-[400px] flex flex-col items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-300'
            }`}>
              <HelpCircle className="w-16 h-16 text-slate-400 mb-4 animate-bounce" />
              <p className="text-sm font-bold font-mono">WORKSPACE VACÍO</p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                Seleccione un candidato de la columna izquierda para revelar sus expedientes de evaluación integral.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL DRAWER FORM FOR CREATING / EDITING CANDIDATES */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            {/* Backdrop backing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                // If hovered inside form, prevent closing
                if (isMouseOverFormRef.current) return;
                // Otherwise prompt for confirmation on click outside
                setShowExitConfirm(true);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Form body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onMouseEnter={() => { isMouseOverFormRef.current = true; }}
              onMouseLeave={() => { isMouseOverFormRef.current = false; }}
              className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border p-7 shadow-2xl flex flex-col z-10 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {/* Form title */}
              <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200/40 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-[#00b0d8]" />
                  <h3 className="text-base font-black tracking-tight uppercase">
                    {isEditing ? 'Modificar Ficha de Postulante' : 'Cuestionario de Registro de Postulante'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="p-1 px-3.5 rounded-full text-xs font-mono font-bold border transition-colors hover:bg-rose-500 hover:text-white cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleSubmitForm} className="space-y-6 text-xs flex-1">
                
                {/* FIELDSET BLOCK 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] border-b pb-1 border-slate-200/40 dark:border-white/5">
                    DATOS PERSONALES
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Identificador */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Identificador Único
                      </label>
                      <input
                        type="text"
                        value={formIdentificador}
                        onChange={(e) => setFormIdentificador(e.target.value)}
                        placeholder="CI - Nro Proceso - Año"
                        className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35 focus:border-indigo-505'
                        }`}
                      />
                    </div>

                    {/* Nombres, Apellido Paterno, Apellido Materno Split Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-1 sm:col-span-2">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                          Nombres
                        </label>
                        <input
                          id="form-input-nombres"
                          type="text"
                          value={formNombres}
                          onChange={(e) => setFormNombres(e.target.value)}
                          placeholder="Nombre(s)..."
                          className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                            isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35 focus:border-indigo-505'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                          Apellido Paterno
                        </label>
                        <input
                          id="form-input-apellido-paterno"
                          type="text"
                          value={formApellidoPaterno}
                          onChange={(e) => setFormApellidoPaterno(e.target.value)}
                          placeholder="Apellido Paterno..."
                          className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                            isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35 focus:border-indigo-505'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                          Apellido Materno
                        </label>
                        <input
                          id="form-input-apellido-materno"
                          type="text"
                          value={formApellidoMaterno}
                          onChange={(e) => setFormApellidoMaterno(e.target.value)}
                          placeholder="Apellido Materno..."
                          className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                            isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35 focus:border-indigo-505'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Edad with arrows / spinners next to it */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Edad
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formAge === 0 ? '' : formAge}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setFormAge(0);
                            } else {
                              const parsed = parseInt(val, 10);
                              setFormAge(isNaN(parsed) ? 0 : parsed);
                            }
                          }}
                          onBlur={() => {
                            if (formAge < 18) setFormAge(18);
                            else if (formAge > 75) setFormAge(75);
                          }}
                          className={`w-full p-2.5 border rounded-l-xl outline-none text-center font-bold font-mono transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance]:textfield ${
                            isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-[#AAB9C2]/35'
                          }`}
                        />
                        <div className="flex flex-col shrink-0">
                          <button
                            type="button"
                            onClick={() => setFormAge(prev => Math.min(75, prev + 1))}
                            className={`px-3 py-1.5 border-t border-r border-[#AAB9C2]/30 text-xs font-bold font-mono rounded-tr-lg ${
                              isDarkMode ? 'bg-slate-900 border-white/5 hover:bg-slate-800' : 'bg-slate-150 hover:bg-slate-200'
                            }`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormAge(prev => Math.max(18, prev - 1))}
                            className={`px-3 py-1.5 border-b border-r border-t border-[#AAB9C2]/30 text-xs font-bold font-mono rounded-br-lg ${
                              isDarkMode ? 'bg-slate-900 border-white/5 hover:bg-slate-800' : 'bg-slate-150 hover:bg-slate-200'
                            }`}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Departamento de residencia */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Departamento de Residencia
                      </label>
                      <select
                        id="form-select-departamento"
                        value={formDeptResidence}
                        onChange={(e) => setFormDeptResidence(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Beni">Beni</option>
                        <option value="Chuquisaca">Chuquisaca</option>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Oruro">Oruro</option>
                        <option value="Pando">Pando</option>
                        <option value="Potosí">Potosí</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Tarija">Tarija</option>
                      </select>
                    </div>

                    {/* Localidad de residencia */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Localidad de Residencia
                      </label>
                      <input
                        type="text"
                        value={formLocalityResidence}
                        onChange={(e) => setFormLocalityResidence(e.target.value)}
                        placeholder="Ej. Zona Sopocachi, Equipetrol..."
                        className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35 focus:border-indigo-505'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Estado civil */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Estado Civil
                      </label>
                      <select
                        value={formMaritalStatus}
                        onChange={(e) => setFormMaritalStatus(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                        <option value="Conviviente / Unión Libre">Conviviente / Unión Libre</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                      </select>
                    </div>

                    {/* Nivel Académico */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Nivel Académico
                      </label>
                      <select
                        value={formNivelAcademico}
                        onChange={(e) => setFormNivelAcademico(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="Bachiller">Bachiller</option>
                        <option value="Técnico Medio">Técnico Medio</option>
                        <option value="Técnico Superior">Técnico Superior</option>
                        <option value="Licenciatura">Licenciatura</option>
                      </select>
                    </div>

                    {/* Carrera */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Carrera
                      </label>
                      <input
                        type="text"
                        value={formCarrera}
                        onChange={(e) => setFormCarrera(e.target.value)}
                        placeholder="Ej. Auditoría, Ingeniería de Sistemas, etc."
                        className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-slate-50 border-[#AAB9C2]/35'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Trabaja en BDP Section */}
                  <div className="mt-4 p-4 rounded-xl border border-[#00b0d8]/20 bg-[#00b0d8]/5 space-y-3">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-300">
                      El postulante trabaja actualmente en BDP
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="trabajaBdp"
                          value="Sí"
                          checked={formTrabajaBdp === 'Sí'}
                          onChange={() => setFormTrabajaBdp('Sí')}
                          className="w-4 h-4 accent-[#004a8f]"
                        />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Sí</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="trabajaBdp"
                          value="No"
                          checked={formTrabajaBdp === 'No'}
                          onChange={() => setFormTrabajaBdp('No')}
                          className="w-4 h-4 accent-[#004a8f]"
                        />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>No</span>
                      </label>
                    </div>

                    {formTrabajaBdp === 'Sí' && (
                      <div className="mt-2.5 transition-all duration-300 animate-fadeIn">
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400 dark:text-slate-300">
                          Cargo actual del Postulante
                        </label>
                        <input
                          type="text"
                          value={formCargoBdp}
                          onChange={(e) => setFormCargoBdp(e.target.value)}
                          placeholder="Ej. Oficial de Créditos, Analista..."
                          className={`w-full p-2.5 border rounded-xl outline-none text-xs transition-all ${
                            isDarkMode 
                              ? 'bg-slate-950 border-white/10 focus:border-cyan-500' 
                              : 'bg-white border-slate-300 focus:border-indigo-505'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* FIELDSET BLOCK 2: RESULTADOS DE EVALUACIÓN VELOCÍMETROS DYNAMIC DIALS */}
                <div className="space-y-4 border-t pt-5 border-slate-200/40 dark:border-white/5">
                  <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] border-b pb-1 border-slate-200/40 dark:border-white/5">
                    RESULTADOS DE EVALUACIÓN
                  </h4>

                  <p className="text-[10px] text-slate-400 font-sans italic">
                    Utilice los deslizadores analógicos de velocímetro para elegir las puntuaciones o haga clic en el número de porcentaje en el centro del dial para realizar un ingreso manual directo desde el teclado (0% a 100%).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Velocímetros (Nota CAP, Nota Currículum, Conocimientos, Competencias) */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <SpeedometerGauge label="Nota CAP" value={formCapScore} onChange={setFormCapScore} isDarkMode={isDarkMode} />
                        <SpeedometerGauge label="Nota Currículum" value={formCurriculumScore} onChange={setFormCurriculumScore} isDarkMode={isDarkMode} />
                        <SpeedometerGauge label="Conocimientos" value={formKnowledgeScore} onChange={setFormKnowledgeScore} isDarkMode={isDarkMode} />
                        <SpeedometerGauge label="Competencias" value={formCompetencyScore} onChange={setFormCompetencyScore} isDarkMode={isDarkMode} />
                      </div>
                    </div>

                    {/* Column 2: Perfil DISC Refactored Card */}
                    {(() => {
                      const currentArchetype = DISC_ARCHETYPES.find(
                        arch => formDiscScore === `${arch.title} (${arch.code})` || formDiscScore === arch.code || (formDiscScore && typeof formDiscScore === 'string' && formDiscScore.includes(`(${arch.code})`))
                      );
                      const displayCode = currentArchetype ? currentArchetype.code : 'N/A';
                      const displayTitle = currentArchetype ? currentArchetype.title : 'Seleccione el arquetipo';
                      const codeColor = getDiscColor(displayCode);

                      return (
                        <div id="perfil-disc-card" className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[250px] ${
                          isDarkMode ? 'bg-[#0b101d] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          {/* Decorative Background accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00b0d8]/5 rounded-bl-full pointer-events-none" />

                          <div className="flex flex-col items-center justify-center py-6 flex-1 text-center">
                            {/* Top/Center Display and Info Button (!) Side by Side */}
                            <div className="flex items-center gap-3.5 mb-2">
                              <span 
                                id="disc-display-code" 
                                className="text-6xl font-extrabold tracking-tight filter drop-shadow-sm"
                                style={{ 
                                  fontFamily: '"Exo 2", "Inter", sans-serif', 
                                  color: codeColor,
                                  fontStyle: 'italic'
                                }}
                              >
                                {displayCode}
                              </span>
                              
                              {/* Aesthetic circular Info Button (!) */}
                              <button
                                id="disc-info-btn"
                                type="button"
                                onClick={() => setDiscTooltipOpen(true)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800'
                                }`}
                                title="Ver detalles del arquetipo"
                              >
                                !
                              </button>
                            </div>

                            {/* Title Display */}
                            <span 
                              id="disc-display-title" 
                              className="text-xl font-bold uppercase tracking-wider block min-h-[28px] mt-2 transition-all duration-300"
                              style={{ color: displayCode === 'N/A' ? '#94a3b8' : codeColor }}
                            >
                              {displayTitle}
                            </span>
                          </div>

                          {/* Dropdown Selector */}
                          <div className="mt-3">
                            <label htmlFor="disc-archetype-select" className="block text-[8px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                              Perfil DISC
                            </label>
                            <select
                              id="disc-archetype-select"
                              value={formDiscScore}
                              onChange={(e) => setFormDiscScore(e.target.value)}
                              className={`w-full p-2 text-xs font-medium rounded-lg border focus:ring-1 focus:ring-[#00b0d8] focus:border-[#00b0d8] outline-none transition-colors ${
                                isDarkMode 
                                  ? 'bg-slate-900 border-white/10 text-white' 
                                  : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            >
                              <option value="N/A">Seleccione el arquetipo (N/A)</option>
                              {DISC_ARCHETYPES.map((arch) => (
                                <option key={`${arch.title}-${arch.code}`} value={`${arch.title} (${arch.code})`}>
                                  {arch.title} ({arch.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Clean Lightweight Modal/Popover using AnimatePresence */}
                          <AnimatePresence>
                            {discTooltipOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                id="disc-modal"
                                className={`absolute inset-0 p-4 flex flex-col justify-between z-10 ${
                                  isDarkMode ? 'bg-[#0f172a]' : 'bg-white'
                                }`}
                              >
                                <div className="flex-1 overflow-y-auto">
                                  <h4 className="font-mono font-black text-[#00b0d8] uppercase border-b pb-1.5 mb-2 border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] tracking-wider">
                                    <span>{displayCode === 'N/A' ? 'Información' : `Arquetipo: ${displayCode}`}</span>
                                  </h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {displayCode === 'N/A' 
                                      ? 'Seleccione un perfil para ver los detalles.' 
                                      : currentArchetype?.description || 'Coloca aquí la descripción...'}
                                  </p>
                                </div>
                                <button
                                  id="disc-modal-close-btn"
                                  type="button"
                                  onClick={() => setDiscTooltipOpen(false)}
                                  className="mt-2 w-full py-1 text-center text-[10px] font-mono tracking-wider uppercase border rounded-lg transition-colors border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-800/50 cursor-pointer"
                                >
                                  Cerrar
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}
                  </div>


                </div>

                {/* SECTION A: CONOCIMIENTOS, HERRAMIENTAS Y COMPETENCIAS */}
                <div className="space-y-6 border-t pt-5 border-slate-200/40 dark:border-white/5">
                  <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] border-b pb-1 border-slate-200/40 dark:border-white/5">
                    A. CONOCIMIENTOS, HERRAMIENTAS Y COMPETENCIAS
                  </h4>

                  {/* A1. Conocimientos Técnicos (Max 7 items) */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/10 border-white/5' : 'bg-slate-50/50 border-[#AAB9C2]/20'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-300">
                        A1. Conocimientos Técnicos <span className="text-slate-500 font-normal">({formConocimientosTecnicos.length}/7)</span>
                      </label>
                    </div>

                    {/* Display of added items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {formConocimientosTecnicos.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border flex flex-col justify-between relative group transition-all ${
                            isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200/80 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-xs truncate max-w-[80%]">{item.nombre}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              item.nivel === 'Alto' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : item.nivel === 'Medio' 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {item.nivel}
                            </span>
                          </div>
                          {item.detalle && (
                            <p className="text-[10px] text-slate-400 mt-1.5 font-sans leading-relaxed">{item.detalle}</p>
                          )}
                          <button
                            id={`btn-remove-conocimiento-${idx}`}
                            type="button"
                            onClick={() => handleRemoveConocimiento(idx)}
                            className="absolute -top-1.5 -right-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-400 text-rose-500 rounded-full p-1 border border-rose-500/20 flex items-center justify-center cursor-pointer w-6 h-6 shrink-0"
                            title="Eliminar conocimiento"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Inline Flow */}
                    {formConocimientosTecnicos.length < 7 ? (
                      <div className="space-y-3">
                        <div className="flex gap-2.5">
                          <input
                            id="input-conocimiento-nombre"
                            type="text"
                            value={tempConocimientoNombre}
                            onChange={(e) => setTempConocimientoNombre(e.target.value)}
                            placeholder="Escriba un conocimiento (ej. Contabilidad gubernamental)..."
                            className={`flex-1 p-2.5 text-xs border rounded-xl outline-none transition-all ${
                              isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-white border-[#AAB9C2]/35 focus:border-indigo-505'
                            }`}
                          />
                          <button
                            id="btn-add-conocimiento-trigger"
                            type="button"
                            onClick={handleAddConocimientoClick}
                            className="px-4 py-2 bg-[#00b0d8] hover:bg-[#0096b8] text-white font-bold rounded-xl active:scale-95 transition-all text-xs cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            Agregar +
                          </button>
                        </div>

                        {listConocimientoError && (
                          <p className="text-[10px] text-rose-500 font-medium px-1.5">{listConocimientoError}</p>
                        )}

                        {showAddConocimiento && (
                          <div className={`p-3.5 rounded-xl border animate-fadeIn space-y-3 ${
                            isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-[#AAB9C2]/20'
                          }`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5 text-slate-400">
                                  Nivel del Conocimiento
                                </label>
                                <select
                                  id="select-conocimiento-nivel"
                                  value={tempConocimientoNivel}
                                  onChange={(e) => setTempConocimientoNivel(e.target.value as any)}
                                  className={`w-full p-2 text-xs border rounded-lg cursor-pointer ${
                                    isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                                  }`}
                                >
                                  <option value="Bajo">Bajo / Basic</option>
                                  <option value="Medio">Medio / Intermediate</option>
                                  <option value="Alto">Alto / Advance</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase tracking-wider mb-1.5 text-slate-400">
                                  Detalle / Experiencia Adicional (Opcional)
                                </label>
                                <input
                                  id="input-conocimiento-detalle"
                                  type="text"
                                  value={tempConocimientoDetalle}
                                  onChange={(e) => setTempConocimientoDetalle(e.target.value)}
                                  placeholder="Ej. 3 años en auditoría interna..."
                                  className={`w-full p-2 text-xs border rounded-lg outline-none ${
                                    isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2.5">
                              <button
                                type="button"
                                onClick={() => setShowAddConocimiento(false)}
                                className="px-3.5 py-1.5 border border-slate-300 dark:border-white/5 rounded-lg text-[10px] text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                id="btn-add-conocimiento-confirm"
                                type="button"
                                onClick={handleConfirmConocimiento}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] shadow-sm transition-colors cursor-pointer"
                              >
                                Confirmar e Insertar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-500 italic mt-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        ✔ Límite alcanzado de conocimientos técnicos (7 items). Elimine alguno si desea ingresar uno nuevo.
                      </p>
                    )}
                  </div>

                  {/* A2. Manejo de Herramientas u otros (Max 5 items) */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/10 border-white/5' : 'bg-slate-50/50 border-[#AAB9C2]/20'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-300">
                        A2. Manejo de Herramientas u otros <span className="text-slate-500 font-normal">({formHerramientasOtros.length}/5)</span>
                      </label>
                    </div>

                    {/* Display as list badges with delete option */}
                    <div className="flex flex-wrap gap-2 mb-3.5">
                      {formHerramientasOtros.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-2 pr-1 shadow-sm transition-all ${
                            isDarkMode 
                              ? 'bg-slate-950 border-white/10 text-slate-300' 
                              : 'bg-white border-[#AAB9C2]/30 text-slate-700'
                          }`}
                        >
                          <span className="font-bold">{item.nombre}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            item.nivel === 'Alto' ? 'bg-emerald-500/15 text-emerald-400' : item.nivel === 'Medio' ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-500/15 text-slate-400'
                          }`}>
                            {item.nivel}
                          </span>
                          <button
                            id={`btn-remove-herramientas-${idx}`}
                            type="button"
                            onClick={() => handleRemoveHerramienta(idx)}
                            className="w-5 h-5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center font-mono cursor-pointer transition-colors shrink-0"
                            title="Eliminar herramienta"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {formHerramientasOtros.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No se agregaron herramientas aún.</span>
                      )}
                    </div>

                    {/* Inline input */}
                    {formHerramientasOtros.length < 5 ? (
                      <div className="space-y-3">
                        <div className="flex gap-2.5">
                          <input
                            id="input-herramienta-nombre"
                            type="text"
                            value={tempHerramientaNombre}
                            onChange={(e) => setTempHerramientaNombre(e.target.value)}
                            placeholder="Escriba la herramienta (ej. Excel Avanzado, SAP)..."
                            className={`flex-1 p-2.5 text-xs border rounded-xl outline-none transition-all ${
                              isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500' : 'bg-white border-[#AAB9C2]/35 focus:border-indigo-505'
                            }`}
                          />
                          <button
                            id="btn-add-herramienta-trigger"
                            type="button"
                            onClick={handleAddHerramientaClick}
                            className="px-4 py-2 bg-[#00b0d8] hover:bg-[#0096b8] text-white font-bold rounded-xl active:scale-95 transition-all text-xs cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            Configurar +
                          </button>
                        </div>

                        {listHerramientaError && (
                          <p className="text-[10px] text-rose-500 font-medium px-1.5">{listHerramientaError}</p>
                        )}

                        {showAddHerramienta && (
                          <div className={`p-3 rounded-xl border animate-fadeIn flex items-center justify-between gap-4 ${
                            isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-[#AAB9C2]/20 shadow-inner'
                          }`}>
                            <div className="flex-1 max-w-xs">
                              <label className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-slate-400">
                                Nivel de Dominio
                              </label>
                              <select
                                id="select-herramienta-nivel"
                                value={tempHerramientaNivel}
                                onChange={(e) => setTempHerramientaNivel(e.target.value as any)}
                                className={`w-full p-2 text-xs border rounded-lg cursor-pointer ${
                                  isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                                }`}
                              >
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                              </select>
                            </div>
                            <div className="flex gap-2 self-end">
                              <button
                                type="button"
                                onClick={() => setShowAddHerramienta(false)}
                                className="px-3 py-1.5 border border-slate-300 dark:border-white/5 rounded-lg text-[10px] text-slate-400 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                id="btn-add-herramienta-confirm"
                                type="button"
                                onClick={handleConfirmHerramienta}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Insertar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-500 italic mt-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        ✔ Límite alcanzado de herramientas (5 items).
                      </p>
                    )}
                  </div>

                  {/* A3. Competencias o Habilidades (Max 7 items) */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/10 border-white/5' : 'bg-slate-50/50 border-[#AAB9C2]/20'}`}>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-300 mb-3">
                      A3. Competencias o Habilidades (Autocomplete Search) <span className="text-slate-500 font-normal">({formCompetenciasHabilidades.length}/7)</span>
                    </label>

                    {/* Progress representation list for saved tools */}
                    <div className="space-y-3.5 mb-4">
                      {formCompetenciasHabilidades.map((item: any, idx) => {
                        const hasComplexData = item.esperado !== undefined && item.obtenido !== undefined;
                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-xl border space-y-2 relative transition-all ${
                              isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200/60 shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs pr-6">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">{item.competencia || item.nombre || item.name}</span>
                              <span className="font-mono font-extrabold text-cyan-500">
                                {hasComplexData ? item.ajuste : `${item.porcentaje}%`}
                              </span>
                            </div>
                            
                            {hasComplexData ? (
                              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px] text-slate-450 dark:text-slate-400">
                                <div className="flex flex-col">
                                  <span>Esperado:</span>
                                  <span className="font-bold text-slate-650 dark:text-slate-200">≥ {item.esperado}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span>Obtenido:</span>
                                  <span className="font-bold text-slate-650 dark:text-slate-200">{item.obtenido}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span>Brecha:</span>
                                  <span className={`font-bold ${item.brecha < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-650 dark:text-slate-200'}`}>
                                    {item.brecha}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              /* Visual progress bar for legacy data */
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-[#00b0d8] h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${item.porcentaje}%` }}
                                />
                              </div>
                            )}

                            <button
                              id={`btn-remove-competencia-${idx}`}
                              type="button"
                              onClick={() => handleRemoveCompetencia(idx)}
                              className="absolute top-1.5 right-2 w-6 h-6 hover:bg-rose-500/15 text-rose-500 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shrink-0"
                              title="Eliminar competencia"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      {formCompetenciasHabilidades.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic block">Inserte competencias evaluadas mediante el buscador inferior.</span>
                      )}
                    </div>

                    {/* Autocomplete Search Combobox */}
                    {formCompetenciasHabilidades.length < 7 ? (
                      <div className="space-y-3.5 relative">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-wider mb-1.5 text-slate-400">
                            Buscar competencia por nombre (Escriba para filtrar)
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                id="input-competencia-search"
                                type="text"
                                value={tempCompetenciaSearch}
                                onChange={(e) => {
                                  setTempCompetenciaSearch(e.target.value);
                                  setCompetenciaComboboxOpen(true);
                                }}
                                onFocus={() => setCompetenciaComboboxOpen(true)}
                                placeholder="Escriba para filtrar (ej. Liderazgo, Comunicación)..."
                                className={`w-full p-2.5 text-xs border rounded-xl outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500 text-white' : 'bg-white border-[#AAB9C2]/35 focus:border-indigo-505 text-slate-800'
                                }`}
                              />

                              {/* Floating Autocomplete menu */}
                              {competenciaComboboxOpen && (
                                <ul 
                                  id="autocomplete-dropdown"
                                  className={`absolute z-50 w-full left-0 mt-1 max-h-48 overflow-y-auto border rounded-xl shadow-2xl divide-y transition-all ${
                                    isDarkMode 
                                      ? 'bg-slate-950 border-white/10 divide-white/5 text-slate-200' 
                                      : 'bg-white border-slate-200 divide-slate-100 text-slate-700'
                                  }`}
                                >
                                  {filteredCompetencies.length > 0 ? (
                                    filteredCompetencies.map((comp, idx) => (
                                      <li 
                                        key={idx}
                                        onClick={() => handleSelectCompetencia(comp)}
                                        className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                                          isDarkMode ? 'hover:bg-cyan-500/15' : 'hover:bg-indigo-500/10 hover:text-[#004a8f]'
                                        }`}
                                      >
                                        {comp}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="px-3 py-2.5 text-xs text-slate-400 italic">No se encontraron competencias libres.</li>
                                  )}
                                </ul>
                              )}
                            </div>
                            {competenciaComboboxOpen && (
                              <button
                                type="button"
                                onClick={() => setCompetenciaComboboxOpen(false)}
                                className="px-3 text-[10px] border border-slate-300 dark:border-white/10 rounded-xl"
                              >
                                Cerrar ×
                              </button>
                            )}
                          </div>
                        </div>

                        {listCompetenciaError && (
                          <p className="text-[10px] text-rose-500 font-medium px-1.5">{listCompetenciaError}</p>
                        )}

                        {/* Slider configuration panel */}
                        {showAddCompetencia && tempCompetenciaSelected && (() => {
                          const liveBrecha = (() => {
                            const valEsperado = tempValorEsperado === '' ? 0 : tempValorEsperado;
                            const valObtenido = tempValorObtenido === '' ? 0 : tempValorObtenido;
                            const raw = valObtenido - valEsperado;
                            const rounded = Math.round(raw * 10) / 10;
                            return rounded > 0 ? 0 : rounded;
                          })();

                          const liveAjuste = (() => {
                            const valEsperado = tempValorEsperado === '' ? 0 : tempValorEsperado;
                            const valObtenido = tempValorObtenido === '' ? 0 : tempValorObtenido;
                            if (valEsperado <= 0) return '0%';
                            const pct = Math.round((valObtenido / valEsperado) * 100);
                            const capped = Math.min(100, pct);
                            return `${capped}%`;
                          })();

                          return (
                            <div className={`p-4 rounded-xl border animate-fadeIn space-y-4 ${
                              isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-[#AAB9C2]/25 shadow-inner'
                            }`}>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                                  Configurar Competencia: <strong className="text-cyan-400 font-sans tracking-normal lowercase first-letter:uppercase">{tempCompetenciaSelected}</strong>
                                </span>
                              </div>

                              {/* Side-by-side Inputs and Live Calculations in a grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Inputs Column */}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Valor Esperado */}
                                  <div>
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                                      Valor Esperado
                                    </label>
                                    <div className="flex items-center">
                                      <span className={`px-2.5 py-2 border border-r-0 rounded-l-xl font-mono font-bold text-sm select-none ${
                                        isDarkMode ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'
                                      }`}>
                                        ≥
                                      </span>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        max="100"
                                        value={tempValorEsperado}
                                        placeholder="Introduzca el valor"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const parsed = parseFloat(val.replace(',', '.'));
                                          setTempValorEsperado(isNaN(parsed) ? '' : Math.max(0, parsed));
                                        }}
                                        className={`w-full p-2 text-xs border rounded-r-xl outline-none transition-all ${
                                          isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500 text-white' : 'bg-white border-slate-300 focus:border-indigo-505 text-slate-800'
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Valor Obtenido */}
                                  <div>
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                                      Valor Obtenido
                                    </label>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      max="100"
                                      value={tempValorObtenido}
                                      placeholder="Introduzca el valor"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const parsed = parseFloat(val.replace(',', '.'));
                                        setTempValorObtenido(isNaN(parsed) ? '' : Math.max(0, parsed));
                                      }}
                                      className={`w-full p-2 text-xs border rounded-xl outline-none transition-all ${
                                        isDarkMode ? 'bg-slate-950 border-white/5 focus:border-cyan-500 text-white' : 'bg-white border-slate-300 focus:border-indigo-505 text-slate-800'
                                      }`}
                                    />
                                  </div>
                                </div>

                                {/* Live Calculations Column */}
                                <div className={`p-3 rounded-xl flex flex-col justify-center gap-2 border ${
                                  isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-100/50 border-slate-250'
                                }`}>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-mono text-[10px] uppercase text-slate-400">Brecha:</span>
                                    <span className={`font-mono font-extrabold ${liveBrecha < 0 ? 'text-rose-400 font-black' : 'text-slate-400 dark:text-slate-300'}`}>
                                      {liveBrecha}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-mono text-[10px] uppercase text-slate-400">Ajuste:</span>
                                    <span className="font-mono font-extrabold text-cyan-400 dark:text-cyan-400 font-black">
                                      {liveAjuste}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex justify-end gap-2 text-[10px] pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddCompetencia(false);
                                    setTempCompetenciaSelected(null);
                                    setTempCompetenciaSearch('');
                                  }}
                                  className="px-3.5 py-2 border border-slate-300 dark:border-white/5 rounded-lg text-slate-450 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  id="btn-add-competencia-confirm"
                                  type="button"
                                  onClick={handleConfirmCompetencia}
                                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1 border border-cyan-400/20"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Confirmar
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-500 italic mt-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        ✔ Límite alcanzado de competencias (7 items).
                      </p>
                    )}
                  </div>
                </div>

                {/* SECTION B: CONFIABILIDAD DEL POSTULANTE */}
                <div className="space-y-4 border-t pt-5 border-slate-200/40 dark:border-white/5">
                  <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00b0d8] border-b pb-1 border-slate-200/40 dark:border-white/5">
                    B. CONFIABILIDAD DEL POSTULANTE
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Confiabilidad */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Confiabilidad e Integridad
                      </label>
                      <select
                        id="form-select-reliability"
                        value={formReliability}
                        onChange={(e) => setFormReliability(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Confiable">Confiable</option>
                        <option value="Confiabilidad Media">Confiabilidad Media</option>
                        <option value="No Confiable">No Confiable</option>
                      </select>
                    </div>

                    {/* Nivel integridad */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Nivel de Integridad
                      </label>
                      <select
                        id="form-select-integrity-level"
                        value={formIntegrityLevel}
                        onChange={(e) => setFormIntegrityLevel(e.target.value as any)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>

                    {/* Nivel de robo */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Nivel de Robo (Riesgo)
                      </label>
                      <select
                        id="form-select-theft-risk"
                        value={formTheftRisk}
                        onChange={(e) => setFormTheftRisk(e.target.value as any)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>

                    {/* Nivel de mentira */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-300">
                        Nivel de Mentira (Riesgo)
                      </label>
                      <select
                        id="form-select-lying-risk"
                        value={formLyingRisk}
                        onChange={(e) => setFormLyingRisk(e.target.value as any)}
                        className={`w-full p-2.5 border rounded-xl outline-none cursor-pointer transition-all ${
                          isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-[#AAB9C2]/35 text-slate-800'
                        }`}
                      >
                        <option value="N/A">N/A</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FIELDSET BLOCK 4: OBSERVACIONES (DYNAMIC TAG GENERATOR ON COMMA) */}
                <div className="space-y-4 border-t pt-5 border-slate-200/40 dark:border-white/5">
                  <ObservationsTagInput 
                    tags={formObservations} 
                    onChange={setFormObservations} 
                    isDarkMode={isDarkMode} 
                  />
                </div>

                {/* API SYNCHRONIZATION STATUS NOTIFICATIONS */}
                {(submitSuccess || submitError) && (
                  <div className="space-y-3 mt-4 animate-fade-in">
                    {submitSuccess && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span>{submitSuccess}</span>
                      </div>
                    )}
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* SUBMIT ROW BUTTONS */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-200/40 dark:border-white/5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowExitConfirm(true)}
                    className={`py-2 px-5 rounded-xl font-mono text-[11px] font-bold transition-all hover:scale-102 cursor-pointer ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      isDarkMode 
                        ? 'bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800' 
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    CANCELAR
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`py-2 px-6 rounded-xl font-mono text-[11px] font-bold tracking-wide transition-all hover:scale-102 cursor-pointer flex items-center gap-2 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    } ${
                      isDarkMode 
                        ? 'bg-cyan-500 text-slate-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : 'bg-[#004a8f] text-white hover:bg-[#005baa]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>GUARDANDO...</span>
                      </>
                    ) : (
                      isEditing ? 'GUARDAR MODIFICACIONES' : 'REGISTRAR SOCIO POSTULANTE'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Confirmation Modal with Backdrop Blur */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveConfirm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              style={{ zIndex: 101 }}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md p-6 rounded-2xl border shadow-xl text-center z-[102] ${
                isDarkMode ? 'bg-[#0b101d] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-lg font-bold">¿Confirmar modificaciones?</h3>
              <p className="text-xs text-slate-400 mt-2">
                Está a punto de actualizar de manera permanente la información y métricas del postulante en nuestra base corporativa del BDP sincronizada con Google Sheets. ¿Desea continuar?
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSaveConfirm(false)}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#151c2c] hover:bg-[#1e293b] text-slate-300 border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveConfirm(false);
                    executeFormSubmit();
                  }}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-[#004a8f] text-white hover:bg-[#00396c] transition-colors shadow-md cursor-pointer"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showBackupPrompt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBackupPrompt(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative max-w-md w-full mx-4 rounded-3xl border p-6 shadow-2xl flex flex-col z-[70] ${
                isDarkMode ? 'bg-[#0e1726] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-850'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black font-mono tracking-tight uppercase">
                  Registro Incompleto Encontrado
                </h3>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Se detectó un registro no guardado de su última sesión. ¿Desea recuperar los datos para reanudar el cuestionario de registro o prefiere descartarlos y empezar uno nuevo?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={discardBackupData}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wide transition-colors border cursor-pointer hover:bg-rose-500 hover:text-white ${
                    isDarkMode ? 'bg-slate-900 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  DESCARTAR
                </button>
                <button
                  type="button"
                  onClick={loadBackupData}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wide bg-cyan-500 text-slate-950 hover:brightness-110 transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                >
                  CARGAR REGISTRO
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupPrompt(false)}
                className="text-slate-500 hover:text-slate-400 text-[10px] font-mono tracking-wider uppercase mt-4 text-center cursor-pointer"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}

        {showExitConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative max-w-md w-full mx-4 rounded-3xl border p-6 shadow-2xl flex flex-col z-[70] ${
                isDarkMode ? 'bg-[#0e1726] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-850'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black font-mono tracking-tight uppercase">
                  ¿Confirmar Salida?
                </h3>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                ¿Está seguro de que desea cerrar el cuestionario? Los cambios ingresados se mantendrán respaldados localmente, pero no se registrarán de manera definitiva en el portal corporativo hasta que guarde el formulario.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wide transition-colors border cursor-pointer ${
                    isDarkMode ? 'bg-slate-900 border-white/5 text-slate-350 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  SEGUIR EDITANDO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setShowExitConfirm(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wide bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-600/20 cursor-pointer"
                >
                  SÍ, SALIR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
