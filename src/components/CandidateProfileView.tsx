/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Applicant, QualificationMetrics, TimelineEvent } from '../types';
import { BdpLogo } from './BdpLogo';
import Avatar from './Avatar';
import { 
  ArrowLeft, Mail, Phone, Calendar, Briefcase, GraduationCap, DollarSign, 
  Award, Percent, HelpCircle, Sparkles, CheckCircle2, ChevronRight, Save, 
  Clock, BookOpen, ShieldCheck, Download, Printer, ZoomIn, ZoomOut, 
  FileText, TrendingUp, RotateCcw, AlertTriangle, Users, MessageSquare, 
  Bookmark, Check, Plus, Trash2, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CandidateProfileViewProps {
  applicant: Applicant;
  onClose: () => void;
  onUpdateApplicant: (updated: Applicant) => void;
  isDarkMode?: boolean;
}

export default function CandidateProfileView({
  applicant,
  onClose,
  onUpdateApplicant,
  isDarkMode = true,
}: CandidateProfileViewProps) {
  // Accessibility Zoom Level State: 1 = normal, 1.1 = large, 1.25 = extra large
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'timeline' | 'evaluation'>('overview');
  
  // Fit Sandbox weights
  const [techWeight, setTechWeight] = useState<number>(30);
  const [commWeight, setCommWeight] = useState<number>(15);
  const [leadWeight, setLeadWeight] = useState<number>(15);
  const [cultureWeight, setCultureWeight] = useState<number>(20);
  const [problemWeight, setProblemWeight] = useState<number>(20);

  // Editable ratings for sandbox override
  const [overrideTech, setOverrideTech] = useState<number>(applicant.metrics.technical);
  const [overrideComm, setOverrideComm] = useState<number>(applicant.metrics.communication);
  const [overrideLead, setOverrideLead] = useState<number>(applicant.metrics.leadership);
  const [overrideCulture, setOverrideCulture] = useState<number>(applicant.metrics.cultureFit);
  const [overrideProblem, setOverrideProblem] = useState<number>(applicant.metrics.problemSolving);

  // Status updates & notes within profile view
  const [notesText, setNotesText] = useState<string>(applicant.notes || '');
  const [pipelineStatus, setPipelineStatus] = useState<Applicant['status']>(applicant.status);
  
  // Interactive Timeline edit simulation
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(applicant.timeline || []);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [newEventStage, setNewEventStage] = useState<string>('');
  const [newEventNote, setNewEventNote] = useState<string>('');

  // Committee interactive decision tracker
  const [riskAssessment, setRiskAssessment] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [approvalStatus, setApprovalStatus] = useState<'Pending' | 'Approved' | 'Requires Review'>('Pending');
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedMembers, setVotedMembers] = useState<Array<{ name: string; position: string; vote: string; feedback: string }>>([
    { 
      name: "Lic. Carlos Mendoza", 
      position: "Jefe de Riesgos y Cumplimiento", 
      vote: "Aprobado con Condiciones", 
      feedback: "El candidato demuestra alta capacidad técnica pero debe alinearse con la política estricta de riesgo crediticio institucional." 
    },
    { 
      name: "Dra. Silvana Rojas", 
      position: "Gerente de Desarrollo del Talento S.A.M.", 
      vote: "Aprobado", 
      feedback: "Excelente nivel comunicativo y sólido encaje cultural con los valores corporativos de fomento del microcrédito." 
    }
  ]);
  const [newFeedbackText, setNewFeedbackText] = useState<string>('');

  // Save updates helper
  const handleSaveAllChanges = () => {
    const updatedApplicantDetails: Applicant = {
      ...applicant,
      status: pipelineStatus,
      notes: notesText,
      metrics: {
        ...applicant.metrics,
        technical: overrideTech,
        communication: overrideComm,
        leadership: overrideLead,
        cultureFit: overrideCulture,
        problemSolving: overrideProblem
      },
      timeline: timelineEvents,
      updatedAt: new Date().toISOString()
    };
    onUpdateApplicant(updatedApplicantDetails);
  };

  // Reset Override Ratings
  const handleResetOverrides = () => {
    setOverrideTech(applicant.metrics.technical);
    setOverrideComm(applicant.metrics.communication);
    setOverrideLead(applicant.metrics.leadership);
    setOverrideCulture(applicant.metrics.cultureFit);
    setOverrideProblem(applicant.metrics.problemSolving);
    setTechWeight(30);
    setCommWeight(15);
    setLeadWeight(15);
    setCultureWeight(20);
    setProblemWeight(20);
  };

  // Dynamic Fit Score Weighted Calculation
  const fitScoreCalculated = useMemo(() => {
    const sumWeights = techWeight + commWeight + leadWeight + cultureWeight + problemWeight;
    if (sumWeights === 0) return 0;

    const weightedSum = 
      (overrideTech * techWeight) +
      (overrideComm * commWeight) +
      (overrideLead * leadWeight) +
      (overrideCulture * cultureWeight) +
      (overrideProblem * problemWeight);

    return Math.round(weightedSum / sumWeights);
  }, [overrideTech, overrideComm, overrideLead, overrideCulture, overrideProblem, techWeight, commWeight, leadWeight, cultureWeight, problemWeight]);

  // Handle Add Timeline Event
  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventStage || !newEventNote) return;

    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: newEventStage,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      note: newEventNote
    };

    const updatedTimeline = [newEvent, ...timelineEvents];
    setTimelineEvents(updatedTimeline);
    setNewEventStage('');
    setNewEventNote('');
    setShowAddEventModal(false);
  };

  // Add hiring manager committee review feedback
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText) return;

    setVotedMembers([
      ...votedMembers,
      {
        name: "Lic. Alexander Roberto (Tú)",
        position: "Evaluador Principal del Comité",
        vote: "Aprobado",
        feedback: newFeedbackText
      }
    ]);
    setNewFeedbackText('');
    setHasVoted(true);
  };

  // Status visual colors
  const getStatusStyle = (status: Applicant['status']) => {
    switch (status) {
      case 'New':
        return isDarkMode 
          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Screening':
        return isDarkMode 
          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
          : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interviewing':
        return isDarkMode 
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shortlisted':
        return isDarkMode 
          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
          : 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Offered':
        return isDarkMode 
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return isDarkMode 
          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          : 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Archived':
      default:
        return isDarkMode 
          ? 'bg-slate-500/10 text-slate-300 border-slate-500/30'
          : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabelText = (status: Applicant['status']) => {
    switch (status) {
      case 'New': return 'Nuevo';
      case 'Screening': return 'Pre-filtrado';
      case 'Interviewing': return 'En Entrevistas';
      case 'Shortlisted': return 'Preseleccionado';
      case 'Offered': return 'Ofertado';
      case 'Rejected': return 'No Seleccionado';
      case 'Archived': return 'Archivado';
      default: return status;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ fontSize: `${zoomLevel}rem` }}
      className={`fixed inset-0 z-[100] overflow-y-auto min-h-screen px-4 py-8 sm:px-6 lg:px-12 backdrop-blur-3xl transition-colors duration-400 ${
        isDarkMode ? 'bg-slate-950/98 text-slate-100' : 'bg-slate-50/98 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        
        {/* Top Control Bar (Accessibility + Navigation actions) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200/25 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium text-xs ${
                isDarkMode 
                  ? 'border-white/10 hover:bg-white/5 bg-slate-900/60 text-slate-300 hover:text-white' 
                  : 'border-slate-200 hover:bg-slate-100 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Tablero Principal</span>
            </button>
            <span className="text-xs font-mono px-3 py-1 bg-slate-200/30 dark:bg-white/5 rounded-full text-slate-400">
              Vista Completa de Perfil
            </span>
          </div>

          {/* Accessibility Widgets */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center rounded-xl p-1 border text-xs ${
              isDarkMode ? 'border-white/10 bg-slate-900/60' : 'border-slate-200 bg-white'
            }`}>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.05))} 
                className="p-1.5 hover:bg-slate-200/40 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-inherit cursor-pointer"
                title="Disminuir tamaño de fuente"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[10px] text-slate-400 select-none">
                FUENTE: {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(1.2, prev + 0.05))} 
                className="p-1.5 hover:bg-slate-200/40 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-inherit cursor-pointer"
                title="Aumentar tamaño de fuente"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Print and Export buttons */}
            <button 
              onClick={() => window.print()}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isDarkMode ? 'border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`}
              title="Exportar reporte a PDF / Impresión institucional"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Section Banner */}
        <div className={`relative border rounded-3xl overflow-hidden p-8 sm:p-10 transition-all duration-500 shadow-2xl ${
          isDarkMode 
            ? 'bg-[#0a1122]/60 border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl' 
            : 'bg-white/80 border-slate-200/80 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl'
        }`}>
          {/* Subtle logo background watermarks */}
          <div className="absolute top-0 right-0 p-8 opacity-5 font-mono select-none pointer-events-none hidden lg:block">
            <BdpLogo className="h-60 w-auto" isDarkMode={isDarkMode} />
          </div>

          <div className="relative space-y-8">
            {/* Row 1: Profile Main Information and Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
                <Avatar name={applicant.name} className="w-32 h-32 rounded-3xl text-5xl shadow-2xl border-2 border-cyan-400/30" />

                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>{applicant.name}</h1>
                    
                    {/* Interactive quick status select */}
                    <select
                      value={(() => {
                        const statusMap: Record<string, string> = {
                          'Archived': 'Base de Datos',
                          'New': 'Base de Datos',
                          'Shortlisted': 'Segunda Opción',
                          'Offered': 'Segunda Opción',
                          'Interviewing': 'Selección',
                          'Screening': 'Selección',
                          'Rejected': 'Descartado'
                        };
                        return statusMap[pipelineStatus] || 'Base de Datos';
                      })()}
                      onChange={(e) => {
                        const val = e.target.value;
                        const spToEn: Record<string, 'New' | 'Screening' | 'Interviewing' | 'Shortlisted' | 'Offered' | 'Archived' | 'Rejected'> = {
                          'Base de Datos': 'Archived',
                          'Segunda Opción': 'Shortlisted',
                          'Selección': 'Interviewing',
                          'Descartado': 'Rejected'
                        };
                        const newEnStatus = spToEn[val] || 'New';
                        setPipelineStatus(newEnStatus);
                      }}
                      className={`text-[11px] font-extrabold tracking-wider font-mono px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${getStatusStyle(pipelineStatus)}`}
                    >
                      <option value="Base de Datos">Base de Datos</option>
                      <option value="Segunda Opción">Segunda Opción</option>
                      <option value="Selección">Selección</option>
                      <option value="Descartado">Descartado</option>
                    </select>
                  </div>
                  
                  <p className={`text-base font-black tracking-wide flex items-center justify-center sm:justify-start gap-2 ${
                    isDarkMode ? 'text-cyan-400' : 'text-[#005baa]'
                  }`}>
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    <span className="uppercase font-mono text-sm tracking-wide">{applicant.role || 'Puesto no especificado'}</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs text-slate-450">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-cyan-500" /> {applicant.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-cyan-500" /> {applicant.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Decision Container */}
              <div className={`w-full lg:w-auto p-6 rounded-2xl border flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-4.5 ${
                isDarkMode ? 'bg-[#0e1628]/80 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-center sm:text-left lg:text-right font-mono text-[11px]">
                  <p className="text-slate-405 font-medium uppercase tracking-wider">Ajuste Corporativo Actual</p>
                  <p className={`text-3xl font-black mt-1 ${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'}`}>
                    {fitScoreCalculated}%
                  </p>
                </div>
                <button
                  onClick={handleSaveAllChanges}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-103 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500 to-[#00b0d8] text-slate-950 hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]' 
                      : 'bg-gradient-to-r from-[#004a8f] to-[#005baa] text-white'
                  }`}
                >
                  <Save className="w-4 h-4" /> Guardar Evaluaciones
                </button>
              </div>
            </div>

            {/* Row 2: Bento Grid for Full Registration Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/30 dark:border-white/5">
              {/* Card 1: Carrera / Formación Académica */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-250/60 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Estudios y Formación</span>
                </div>
                <p className={`text-xs font-bold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>
                  {applicant.carrera || applicant.degree || applicant.education || 'Sin carrera especificada'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {applicant.education || 'Nivel de grado no especificado'}
                </p>
              </div>

              {/* Card 2: Residencia y Origen */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-250/60 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Datos Personales</span>
                </div>
                <p className={`text-xs font-bold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>
                  {applicant.age ? `${applicant.age} Años` : 'Edad no declarada'} / {applicant.maritalStatus || 'Estado civil no especificado'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Identificador: {applicant.institutionalId || applicant.id}
                </p>
              </div>

              {/* Card 3: Ubicación Geográfica */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-250/60 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ubicación de Residencia</span>
                </div>
                <p className={`text-xs font-bold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>
                  {applicant.departmentOfResidence || 'La Paz'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Localidad: {applicant.localityOfResidence || 'Ninguna especificada'}
                </p>
              </div>

              {/* Card 4: Relación BDP */}
              <div className={`p-4 rounded-2xl border transition-all ${
                applicant.trabaja_bdp === 'Sí'
                  ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                  : isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-250/60'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <ShieldCheck className={`w-4 h-4 ${applicant.trabaja_bdp === 'Sí' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Vínculo Institucional BDP</span>
                </div>
                <p className={`text-xs font-bold leading-snug ${
                  applicant.trabaja_bdp === 'Sí'
                    ? 'text-emerald-500'
                    : isDarkMode ? 'text-slate-300' : 'text-slate-850'
                }`}>
                  {applicant.trabaja_bdp === 'Sí' ? 'Funcionario Activo BDP' : 'No trabaja en BDP'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono truncate" title={applicant.cargo_bdp || ''}>
                  {applicant.trabaja_bdp === 'Sí' ? `Cargo: ${applicant.cargo_bdp || 'Especificado'}` : 'Socio Postulante Externo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className={`flex border-b pb-1 gap-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer text-xs font-bold pb-2 uppercase tracking-wider relative transition-all ${
              activeTab === 'overview' 
                ? isDarkMode ? 'text-white border-b-2 border-b-[#00b0d8]' : 'text-[#004a8f] border-b-2 border-b-[#004a8f]'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Métricas de Calificación & Sandbox
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`cursor-pointer text-xs font-bold pb-2 uppercase tracking-wider relative transition-all ${
              activeTab === 'resume' 
                ? isDarkMode ? 'text-white border-b-2 border-b-[#00b0d8]' : 'text-[#004a8f] border-b-2 border-b-[#004a8f]'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Extracto de Currículum Parsed
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`cursor-pointer text-xs font-bold pb-2 uppercase tracking-wider relative transition-all ${
              activeTab === 'timeline' 
                ? isDarkMode ? 'text-white border-b-2 border-b-[#00b0d8]' : 'text-[#004a8f] border-b-2 border-b-[#004a8f]'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Historial de Selección & Línea de Tiempo
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`cursor-pointer text-xs font-bold pb-2 uppercase tracking-wider relative transition-all ${
              activeTab === 'evaluation' 
                ? isDarkMode ? 'text-white border-b-2 border-b-[#00b0d8]' : 'text-[#004a8f] border-b-2 border-b-[#004a8f]'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Panel de Evaluadores & Comité
          </button>
        </div>

        {/* Active tab rendered content inside bento grids layout */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: METRICS & SANDBOX */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left hand Side: Visual circular progress of skills & indicators */}
              <div className={`p-6 rounded-2xl border lg:col-span-4 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Rendimiento de Candidato
                  </h3>
                  
                  {/* Gauge progress representations */}
                  <div className="space-y-4">
                    {[
                      { label: "Capacidad Técnica", val: overrideTech, color: "from-blue-600 to-[#00b0d8]" },
                      { label: "Comunicación Efectiva", val: overrideComm, color: "from-purple-600 to-pink-500" },
                      { label: "Liderazgo Directivo", val: overrideLead, color: "from-orange-500 to-amber-500" },
                      { label: "Alineación Cultural BDP", val: overrideCulture, color: "from-emerald-500 to-green-400" },
                      { label: "Resolución de Problemas Complejos", val: overrideProblem, color: "from-pink-600 to-teal-400" }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between font-mono text-xs text-slate-400">
                          <span>{metric.label}</span>
                          <span className="font-bold text-slate-100 dark:text-slate-200">{metric.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-300/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.val}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={`h-full bg-gradient-to-r ${metric.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`mt-6 pt-6 border-t font-mono text-xs space-y-2 text-slate-400 border-slate-200/20`}>
                  <p className="flex justify-between">
                    <span>Años de experiencia:</span>
                    <span className="text-slate-100 dark:text-white font-bold">{applicant.experienceYears} Años</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Expectativa Salarial:</span>
                    <span className="text-slate-100 dark:text-white font-bold">{applicant.expectedSalary}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Agencia Proveedora:</span>
                    <span className="text-slate-100 dark:text-white font-bold">{applicant.agency}</span>
                  </p>
                </div>
              </div>

              {/* Right hand Side: Interactive weighting parameters sandbox */}
              <div className={`p-6 rounded-2xl border lg:col-span-8 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-spin-slow" />
                      Simulador Avanzado de Ajuste Corporativo SAM
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ajuste las ponderaciones para ver cómo responde la calificación ponderada a las prioridades del puesto actual.
                    </p>
                  </div>
                  <button 
                    onClick={handleResetOverrides}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-[#004a8f]'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reajustar Valores
                  </button>
                </div>

                {/* Grid with parameters sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider 1: Technical */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Puntaje Técnico</span>
                      <span className="font-mono bg-cyan-500/10 text-[#00b0d8] px-2 py-0.5 rounded text-[10px]">
                        Rating: {overrideTech}% • Peso: {techWeight}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={overrideTech} 
                        onChange={(e) => setOverrideTech(parseInt(e.target.value))}
                        className="w-full grayscale-0 cursor-pointer h-1 bg-slate-300/30 rounded-lg appearance-none accent-[#00b0d8]"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Ponderar Prioridad:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setTechWeight(prev => Math.max(0, prev - 5))} className="hover:text-white">-5%</button>
                          <span>{techWeight}%</span>
                          <button onClick={() => setTechWeight(prev => Math.min(100, prev + 5))} className="hover:text-white">+5%</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slider 2: Communication */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Comunicación</span>
                      <span className="font-mono bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded text-[10px]">
                        Rating: {overrideComm}% • Peso: {commWeight}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={overrideComm} 
                        onChange={(e) => setOverrideComm(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-300/30 rounded-lg appearance-none accent-pink-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Ponderar Prioridad:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setCommWeight(prev => Math.max(0, prev - 5))} className="hover:text-white">-5%</button>
                          <span>{commWeight}%</span>
                          <button onClick={() => setCommWeight(prev => Math.min(100, prev + 5))} className="hover:text-white">+5%</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slider 3: Leadership */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Liderazgo</span>
                      <span className="font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px]">
                        Rating: {overrideLead}% • Peso: {leadWeight}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={overrideLead} 
                        onChange={(e) => setOverrideLead(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-300/30 rounded-lg appearance-none accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Ponderar Prioridad:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setLeadWeight(prev => Math.max(0, prev - 5))} className="hover:text-white">-5%</button>
                          <span>{leadWeight}%</span>
                          <button onClick={() => setLeadWeight(prev => Math.min(100, prev + 5))} className="hover:text-white">+5%</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slider 4: CultureFit */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Ajuste Cultural SAM</span>
                      <span className="font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                        Rating: {overrideCulture}% • Peso: {cultureWeight}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={overrideCulture} 
                        onChange={(e) => setOverrideCulture(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-300/30 rounded-lg appearance-none accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Ponderar Prioridad:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setCultureWeight(prev => Math.max(0, prev - 5))} className="hover:text-white">-5%</button>
                          <span>{cultureWeight}%</span>
                          <button onClick={() => setCultureWeight(prev => Math.min(100, prev + 5))} className="hover:text-white">+5%</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slider 5: Problem Solving */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Resolución de Problemas</span>
                      <span className="font-mono bg-[#004a8f]/10 text-sky-400 px-2 py-0.5 rounded text-[10px]">
                        Rating: {overrideProblem}% • Peso: {problemWeight}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={overrideProblem} 
                        onChange={(e) => setOverrideProblem(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-300/30 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Ponderar Prioridad:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setProblemWeight(prev => Math.max(0, prev - 5))} className="hover:text-white">-5%</button>
                          <span>{problemWeight}%</span>
                          <button onClick={() => setProblemWeight(prev => Math.min(100, prev + 5))} className="hover:text-white">+5%</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score summary panel */}
                <div className={`p-4.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ajuste Dinámico del Candidato en BDP</h4>
                    <p className="text-xs text-slate-500">
                      Calculado dinámicamente mediante promedio ponderado de los 5 factores con los pesos establecidos.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500">PUNTAJE PONDERADO</span>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'}`}>{fitScoreCalculated}%</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200/20" />
                    <div className="text-left leading-normal">
                      <span className="text-[9px] font-mono text-slate-500">NIVEL RECOMENDADO</span>
                      <p className="text-xs font-bold text-emerald-400">
                        {fitScoreCalculated >= 85 ? "Contratación Altamente Recomendada" : fitScoreCalculated >= 70 ? "Admite Evaluación" : "No Recomendado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PARSED RESUME EXCERPT */}
          {activeTab === 'resume' && (
            <motion.div 
              key="resume-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Document Overview Excerpt panel */}
              <div className={`p-6 rounded-2xl border lg:col-span-8 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-200/20">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00b0d8]" />
                    <h3 className="text-sm font-bold tracking-tight text-white dark:text-white">
                      Extracto Extendido del Currículum Vitae
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Escaneado por motor de análisis
                  </span>
                </div>

                {/* Simulated CV sections */}
                <div className="space-y-6 text-xs leading-relaxed text-slate-300 dark:text-slate-300">
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#00b0d8] font-mono uppercase tracking-wider text-[10px]">
                      Pertenencia Profesional (Resumen Ejecutivo)
                    </h4>
                    <p className="bg-slate-300/5 p-3 rounded-lg border border-slate-200/10 text-slate-300">
                      {applicant.resumeSummary || "Candidato con amplia experiencia demostrada en roles de liderazgo tecnológico y analítico. Experto en estructuración de procesos, optimización de sistemas y alineamiento de objetivos operativos con metas financieras corporativas. Enfoque resoluto dirigido a la eficiencia de procesos dentro del sector y con alta adaptabilidad corporativa."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-[#00b0d8] font-mono uppercase tracking-wider text-[10px]">
                      Historial Profesional Reciente (Sincronizado)
                    </h4>
                    <div className="space-y-3 pl-2.5 border-l-2 border-[#004a8f]/40">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-slate-100 dark:text-white">
                          <span className="font-bold">Especialista de Operaciones Financieras Senior (BDP S.A.M.)</span>
                          <span className="font-mono text-[9px] text-slate-400">2023 - Presente</span>
                        </div>
                        <p className="text-slate-400">
                          Responsable del diseño e implementación de sistemas de control administrativo para portafolios regulados. Reducción medible del 14% en tiempos de aprobación operativa de carpetas de microcrédito productivo.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-slate-100 dark:text-white">
                          <span className="font-bold">Analista de Proyectos y Gestión de Riesgo (Banco Unión)</span>
                          <span className="font-mono text-[9px] text-slate-400">2020 - 2023</span>
                        </div>
                        <p className="text-slate-400">
                          Coordinador de auditorías de metodologías ágiles en banca de desarrollo regional. Estructuración y fiscalización de carteras para garantizar el cumplimiento normativo exigido por entes reguladores locales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-[#00b0d8] font-mono uppercase tracking-wider text-[10px]">
                      Formación Académica y Certificaciones
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li>
                        <strong className="text-slate-200">{applicant.education || "Licenciatura en Ingeniería Comercial o de Sistemas"}</strong> - Universidad Mayor de San Andrés (Mendoza, Bolivia). Graduado con honores en el top general de titulación.
                      </li>
                      <li>
                        Diplomado en Gestión e Innovación Financiera y Mitigación de Riesgos Corporativos.
                      </li>
                      <li>
                        Certificación Superior de Especialidad en Modelos de Decisión y Análisis Masivo de Datos en Entornos de Microfinanzas Institucionales.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills parsed and matched tag index database */}
              <div className={`p-6 rounded-2xl border lg:col-span-4 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                    Habilidades e Indexación de Aptitudes
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Filtro automático de concordancia de habilidades con respecto al perfil requerido del puesto de trabajo asignado.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Matching skills */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase block tracking-wider">
                      Habilidades Identificadas ({applicant.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all hover:scale-105 select-none ${
                            isDarkMode 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                          }`}
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing/Desirable Skills */}
                  <div className="space-y-2 border-t pt-4 border-slate-200/10">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase block tracking-wider">
                      Aptitudes Deseables Adicionales
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Riesgo Crediticio", "Sistemas ASFI", "Análisis Estadístico R", "Evaluación de Garantías Pymes"].map((skill, idx) => (
                        <span 
                          key={idx} 
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all opacity-70 hover:opacity-100 ${
                            isDarkMode 
                              ? 'bg-slate-900 text-slate-400 border-white/5' 
                              : 'bg-slate-100 text-slate-600 border-slate-250'
                          }`}
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[11px] text-slate-400 leading-normal">
                  <span className="font-bold text-cyan-300 block mb-1">Análisis de Reclutamiento:</span>
                  El candidato cumple con el {Math.round(applicant.skills.length * 15 + 40)}% de los requisitos técnicos explícitos indexados en la vacante de recursos corporativos.
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SELECTION HISTORIC TIMELINE */}
          {activeTab === 'timeline' && (
            <motion.div 
              key="timeline-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Event logging and Timeline view */}
              <div className={`p-6 rounded-2xl border lg:col-span-8 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold tracking-tight text-white dark:text-white">
                      Bitácora de Eventos de Selección (Línea de Tiempo)
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAddEventModal(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white cursor-pointer hover:shadow-md transition-all`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Hito Administrativo
                  </button>
                </div>

                {/* Timeline flow */}
                <div className="relative pl-6 space-y-6 border-l border-slate-200/20 py-2">
                  {timelineEvents.map((event, idx) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center border-cyan-400 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      </span>

                      <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/45 border-white/5 group-hover:border-white/10 group-hover:bg-slate-900/60' 
                          : 'bg-slate-50/50 border-slate-200 group-hover:border-slate-300'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-slate-200 dark:text-white text-xs">{event.stage}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {event.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal leading-relaxed">
                          {event.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruitment Pipeline Stages guide */}
              <div className={`p-6 rounded-2xl border lg:col-span-4 space-y-6 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                    Fases Generales del Proceso BDP
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    La institución aplica un esquema jerárquico de control compuesto por 5 etapas de filtro sucesivas.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "1. Registro de Postulación", desc: "Verificación de requisitos mínimos formalizados ante agencias externas homologadas." },
                    { title: "2. Pruebas de Filtro Psicotécnicas", desc: "Medición cuantitativa en resolución de conflictos, lógica y cultura." },
                    { title: "3. Entrevista Técnica Interna", desc: "Defensa presencial de conocimientos frente al líder del departamento." },
                    { title: "4. Evaluación por Comité Ampliado", desc: "Aprobación de solvencia operativa y niveles de cumplimiento por gerencia." },
                    { title: "5. Oferta e Inducción Oficial", desc: "Propuesta formalizada ante el postulante, firma de acta oficial y alta corporativa." }
                  ].map((stage, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <span className="font-bold text-slate-200 dark:text-white block">{stage.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{stage.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: COMMITTEE PORTAL & NOTES SUMMARY */}
          {activeTab === 'evaluation' && (
            <motion.div 
              key="evaluation-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Committee Feedbacks */}
              <div className={`p-6 rounded-2xl border lg:col-span-8 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-200/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold tracking-tight text-white dark:text-white">
                      Actas y Dictámenes del Comité de Selección S.A.M.
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Sesiones Reguladas por ASFI
                  </span>
                </div>

                {/* Voted members comments block */}
                <div className="space-y-4">
                  {votedMembers.map((member, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <strong className="text-slate-250 dark:text-white block">{member.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{member.position}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight font-mono ${
                          member.vote.includes("Aprobado") 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {member.vote}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-normal italic">
                        "{member.feedback}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Simulated add feedback form */}
                {!hasVoted ? (
                  <form onSubmit={handleAddFeedback} className="space-y-3.5 pt-4 border-t border-slate-200/10">
                    <label className="block text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">
                      Emitir tu Dictamen Oficial (Evaluación del Comité)
                    </label>
                    <div className="space-y-2">
                      <textarea
                        required
                        value={newFeedbackText}
                        onChange={(e) => setNewFeedbackText(e.target.value)}
                        placeholder="Escribe aquí tus comentarios, observaciones cualitativas y observaciones para el acta interna de contratación..."
                        className={`w-full min-h-[90px] p-3 text-xs bg-slate-950/40 border rounded-xl outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                          isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800'
                        }`}
                      />
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <span className="text-[10px] text-slate-500 leading-tight">
                          * Este dictamen se guardará temporalmente para consulta del jurado de personal.
                        </span>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#004a8f] text-white hover:bg-sky-700 hover:shadow-md rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Send className="w-3.5 h-3.5" /> Registrar Voto
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tu dictamen ha sido indexado exitosamente al acta del comité en esta sesión simulada.</span>
                  </div>
                )}
              </div>

              {/* Hiring sandbox risk and statuses adjust */}
              <div className={`p-6 rounded-2xl border lg:col-span-4 space-y-6 ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                    Ajuste Administrativo de Candidato
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Filtros cualitativos adicionales aplicados durante la auditoría del puesto de trabajo de la sucursal SAM.
                  </p>
                </div>

                <div className="space-y-5">
                  
                  {/* Status update selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      Estado de Reclutamiento
                    </label>
                    <select
                      value={pipelineStatus}
                      onChange={(e) => setPipelineStatus(e.target.value as Applicant['status'])}
                      className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                        isDarkMode ? 'bg-slate-900 border-white/10 text-white focus:bg-slate-950' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="New">Nuevo Registro</option>
                      <option value="Screening">Pre-filtrado (Psicometría)</option>
                      <option value="Interviewing">En Proceso de Entrevistas</option>
                      <option value="Shortlisted">Preseleccionado para Comité</option>
                      <option value="Offered">Ofertado Formalmente</option>
                      <option value="Rejected">No Seleccionado</option>
                      <option value="Archived">Archivado / Banco Elegibles</option>
                    </select>
                  </div>

                  {/* Level of risk indicators */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      Índice de Riesgo Cualitativo ASFI
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Low', 'Medium', 'High'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRiskAssessment(lvl as any)}
                          className={`py-2 px-1 rounded-lg border text-[10px] font-mono font-bold tracking-wide uppercase cursor-pointer transition-all ${
                            riskAssessment === lvl
                              ? lvl === 'Low'
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                                : lvl === 'Medium'
                                ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                                : 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-sm'
                              : isDarkMode ? 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {lvl === 'Low' ? "Bajo" : lvl === 'Medium' ? "Medio" : "Crítico"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation recommendations checklists */}
                  <div className="space-y-1.5 border-t border-slate-200/10 pt-4 text-xs space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Validación de Integridad Corporativa
                    </span>
                    <div className="space-y-1.5 text-slate-400 leading-normal text-[11px]">
                      <p className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Verificación de Antecedentes de ASFI</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Verificación de Solvencia Crediticia</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>Validación de Garantías y Contralorías</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Notes Editor Full Sandbox Section at the bottom */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-[#AAB9C2]/45'
        }`}>
          <div className="flex items-center gap-1.5 mb-3 border-b pb-2 border-slate-200/10">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">
              Anotaciones de la Mesa Evaluadora / Notas Generales
            </h3>
          </div>
          <div className="space-y-3">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Indique observaciones específicas aquí..."
              className={`w-full min-h-[100px] p-4 text-xs font-mono bg-slate-950/40 border rounded-xl outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                isDarkMode ? 'border-white/10 text-white' : 'border-slate-300 text-slate-800 shadow-inner'
              }`}
            />
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <span className="text-[10px] text-slate-500 font-mono">
                Modificado por última vez: {new Date(applicant.updatedAt).toLocaleString('es-BO')}
              </span>
              <button
                onClick={handleSaveAllChanges}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#004a8f] to-[#00b0d8] hover:from-[#005baa] text-white border border-white/10' 
                    : 'bg-[#004a8f] hover:bg-[#003d75] text-white'
                }`}
              >
                <Save className="w-4 h-4" /> Registrar Todo en Base de Datos
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: ADD TIMELINE EVENT DIALOG */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${
                isDarkMode ? 'bg-[#0b1220] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-4 border-b pb-2 border-slate-200/10">
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400">
                  Definir Nuevo Hito Administrativo
                </h4>
                <button 
                  onClick={() => setShowAddEventModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-200/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTimelineEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">
                    Etapa / Actividad
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventStage}
                    onChange={(e) => setNewEventStage(e.target.value)}
                    placeholder="Ej. Entrevista Psicotécnica Presencial"
                    className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-white focus:bg-slate-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">
                    Anotaciones sobre el Hito
                  </label>
                  <textarea
                    required
                    value={newEventNote}
                    onChange={(e) => setNewEventNote(e.target.value)}
                    placeholder="Detalla los pormenores, calificación, observaciones o salvedades encontradas..."
                    className={`w-full min-h-[90px] p-2.5 rounded-xl border outline-none text-xs ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-white focus:bg-slate-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                      isDarkMode ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004a8f] text-white hover:bg-sky-700 hover:shadow-md rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Confirmar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// Quick tiny X icon helper needed inside modal above
function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
