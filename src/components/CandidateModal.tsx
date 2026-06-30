/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Applicant } from '../types';
import Avatar from './Avatar';
import { 
  X, Mail, Phone, Calendar, Briefcase, GraduationCap, DollarSign, 
  ChevronRight, Save, Clock, BookOpen, Sparkles, CheckCircle2, AlertTriangle, HelpCircle,
  Edit3, Trash2, Shield, Heart, MapPin, User, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CandidateModalProps {
  applicant: Applicant | null;
  onClose: () => void;
  onUpdateApplicant: (updated: Applicant) => void;
  isDarkMode?: boolean;
  onEditApplicant?: (applicant: Applicant) => void;
  onDeleteApplicant?: (id: string) => void;
}

export default function CandidateModal({
  applicant,
  onClose,
  onUpdateApplicant,
  isDarkMode = true,
  onEditApplicant,
  onDeleteApplicant,
}: CandidateModalProps) {
  const [editableNotes, setEditableNotes] = useState('');
  const [editableStatus, setEditableStatus] = useState<Applicant['status']>('New');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'timeline' | 'assessment'>('profile');

  // Synchronize state when selected applicant changes
  useEffect(() => {
    if (applicant) {
      setEditableNotes(applicant.notes);
      setEditableStatus(applicant.status);
    }
  }, [applicant]);

  if (!applicant) return null;

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateApplicant({
        ...applicant,
        notes: editableNotes,
        status: editableStatus,
        updatedAt: new Date().toISOString()
      });
      setIsSaving(false);
    }, 450); // Small realistic glass-sync latency simulation
  };

  const getTimelineBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return isDarkMode 
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          : 'bg-emerald-50 border-emerald-250 text-emerald-700 font-semibold';
      case 'current':
        return isDarkMode 
          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse'
          : 'bg-cyan-50 border-cyan-300 text-cyan-700 animate-pulse font-semibold';
      case 'rejected':
        return isDarkMode 
          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          : 'bg-rose-50 border-rose-200 text-rose-700 font-semibold';
      case 'upcoming':
      default:
        return isDarkMode 
          ? 'bg-slate-900/50 border-white/5 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimelineStatusLabel = (status: string) => {
    switch(status) {
      case 'current': return 'en curso';
      case 'completed': return 'completado';
      case 'rejected': return 'rechazado';
      default: return status;
    }
  };

  return (
    <div id="candidate-detailed-analysis-portal" className={`backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(10,15,30,0.4)]' 
        : 'bg-white/70 border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
    }`}>
      {/* Detail Panel Header */}
      <div className={`flex items-start justify-between border-b pb-4 mb-5 ${isDarkMode ? 'border-white/10' : 'border-slate-200/60'}`}>
        <div className="flex items-center gap-3">
          <Avatar name={applicant.name} className="w-12 h-12 rounded-2xl text-lg hover:scale-105 transition-transform" />
          <div>
            <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{applicant.name}</h3>
            <p className={`text-[11px] font-mono font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{applicant.role}</p>
          </div>
        </div>

        {/* Status Dropdown control in header */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Estado Interactivo</span>
          <select
            id="modal-status-selector"
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
              return statusMap[editableStatus] || 'Base de Datos';
            })()}
            onChange={(e) => {
              const val = e.target.value;
              const spToEn: Record<string, 'New' | 'Screening' | 'Interviewing' | 'Shortlisted' | 'Offered' | 'Archived' | 'Rejected'> = {
                'Base de Datos': 'Archived',
                'Segunda Opción': 'Shortlisted',
                'Selección': 'Interviewing',
                'Descartado': 'Rejected'
              };
              setEditableStatus(spToEn[val] || 'New');
            }}
            className={`text-xs border rounded-lg px-2 py-1 outline-none cursor-pointer transition-colors font-mono ${
              isDarkMode 
                ? 'bg-slate-950/60 border-white/10 text-slate-100 hover:border-cyan-500/35' 
                : 'bg-white border-slate-200 text-slate-800 hover:border-cyan-500/80 shadow-sm'
            }`}
          >
            <option value="Base de Datos">Base de Datos</option>
            <option value="Segunda Opción">Segunda Opción</option>
            <option value="Selección">Selección</option>
            <option value="Descartado">Descartado</option>
          </select>
        </div>
      </div>

      {/* Detail Tabs selector */}
      <div className={`flex border-b pb-3 mb-5 gap-4 ${isDarkMode ? 'border-white/5' : 'border-slate-200/50'}`}>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`cursor-pointer text-xs font-mono tracking-tight pb-1 relative transition-colors ${
            activeSubTab === 'profile' 
              ? isDarkMode ? 'text-white border-b-2 border-b-cyan-400' : 'text-slate-900 border-b-2 border-b-cyan-500 font-semibold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Detalles del Perfil
        </button>
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`cursor-pointer text-xs font-mono tracking-tight pb-1 relative transition-colors ${
            activeSubTab === 'timeline' 
              ? isDarkMode ? 'text-white border-b-2 border-b-cyan-400' : 'text-slate-900 border-b-2 border-b-cyan-500 font-semibold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Línea de Proceso
        </button>
        <button
          onClick={() => setActiveSubTab('assessment')}
          className={`cursor-pointer text-xs font-mono tracking-tight pb-1 relative transition-colors ${
            activeSubTab === 'assessment' 
              ? isDarkMode ? 'text-white border-b-2 border-b-cyan-400' : 'text-slate-900 border-b-2 border-b-cyan-500 font-semibold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Notas de Evaluadores
        </button>
      </div>

      {/* Sub tabs display views */}
      <div className="min-h-[17rem] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* SUBTAB 1: Profile details Grid */}
          {activeSubTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.16 }}
              className="space-y-4"
            >
              {/* Quick meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <Briefcase className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Experiencia Laboral</p>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{applicant.experienceYears} Años</p>
                  </div>
                </div>
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <GraduationCap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight overflow-hidden">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Formación / Carrera</p>
                    <p className={`text-xs font-semibold truncate max-w-[130px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={applicant.carrera || applicant.education || 'No especificada'}>
                      {applicant.carrera || applicant.education || 'No especificada'}
                    </p>
                  </div>
                </div>
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <DollarSign className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Pretensión Salarial</p>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{applicant.expectedSalary}</p>
                  </div>
                </div>
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Edad / Estado Civil</p>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {applicant.age || '—'} años / {applicant.maritalStatus || '—'}
                    </p>
                  </div>
                </div>
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight overflow-hidden">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Ubicación / Residencia</p>
                    <p className={`text-xs font-semibold truncate max-w-[130px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={`${applicant.departmentOfResidence || ''} ${applicant.localityOfResidence ? ' - ' + applicant.localityOfResidence : ''}`}>
                      {applicant.departmentOfResidence || 'La Paz'} {applicant.localityOfResidence ? `(${applicant.localityOfResidence})` : ''}
                    </p>
                  </div>
                </div>
                <div className={`border p-2.5 rounded-xl flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                  <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="leading-tight overflow-hidden">
                    <p className="text-[9px] text-slate-500 font-mono uppercase">Funcionario BDP</p>
                    <p className={`text-xs font-semibold truncate max-w-[130px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={applicant.trabaja_bdp === 'Sí' ? `Sí - ${applicant.cargo_bdp}` : 'No'}>
                      {applicant.trabaja_bdp === 'Sí' ? `Sí (${applicant.cargo_bdp})` : 'No trabaja en BDP'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Summary */}
              <div className={`border p-3 rounded-xl ${
                isDarkMode ? 'bg-slate-950/25 border-white/5' : 'bg-slate-100/40 border-slate-200/50'
              }`}>
                <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                  <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>Resumen Ejecutivo de CV</span>
                </div>
                <p className={`text-[11px] leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {applicant.resumeSummary}
                </p>
              </div>

              {/* Core Tech Stack */}
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Habilidades Técnicas ({applicant.skills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div className={`flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 text-[11px] font-mono border-t ${
                isDarkMode ? 'text-slate-400 border-white/5' : 'text-slate-500 border-slate-100'
              }`}>
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{applicant.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{applicant.phone}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 2: Hiring Pipeline Stage tracking */}
          {activeSubTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.16 }}
              className="space-y-4"
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Evaluaciones de Reclutamiento Activas</span>
              
              <div className={`relative border-l ml-2.5 pl-5 space-y-4 pt-1 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                {applicant.timeline.map((item, idx) => {
                  const isCurrent = item.status === 'current';
                  const isCompleted = item.status === 'completed';
                  const isRejected = item.status === 'rejected';

                  return (
                    <div id={`timeline-event-${item.id}`} key={item.id} className="relative group">
                      {/* Ring timeline marker */}
                      <span className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 ${
                        isDarkMode ? 'bg-[#0c1224]' : 'bg-white'
                      } ${
                        isCompleted ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        isCurrent ? 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse' :
                        isRejected ? 'border-rose-500 font-semibold' : 'border-slate-400'
                      }`} />

                      <div className="leading-tight">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.stage}</p>
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border leading-none font-semibold ${getTimelineBadgeClass(item.status)}`}>
                            {getTimelineStatusLabel(item.status)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono ml-auto">{item.date}</span>
                        </div>
                        <p className={`text-[10px] mt-1 pl-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SUBTAB 3: Sticky notes editor (Interactive) */}
          {activeSubTab === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase">Historial de Evaluación de Evaluadores</span>
              
              <div className="relative">
                <textarea
                  id="notes-ledger-textarea"
                  rows={5}
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  placeholder="Escribe notas de evaluación, retroalimentación o comentarios aquí..."
                  className={`w-full text-xs rounded-xl p-3 outline-none focus:ring-1 transition-all font-sans leading-relaxed ${
                    isDarkMode 
                      ? 'text-slate-100 placeholder:text-slate-600 bg-slate-950/40 border border-white/10 focus:border-cyan-500/40 focus:ring-cyan-500/10' 
                      : 'text-slate-800 placeholder:text-slate-400 bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10 shadow-sm'
                  }`}
                />
              </div>

              <div className={`border rounded-xl p-3 flex gap-2 ${
                isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200/50'
              }`}>
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Seguridad de Auditoría</p>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Guardar publica las modificaciones inmediatamente en la base local. Los cambios se sincronizan en tiempo real con los tableros y gráficas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save panel modifications footer */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 mt-5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-1.5">
          {onEditApplicant && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditApplicant(applicant)}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-indigo-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm'
              }`}
              title="Editar calificaciones completas"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </motion.button>
          )}
          {onDeleteApplicant && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm(`¿Está seguro de que desea eliminar a ${applicant.name}?`)) {
                  onDeleteApplicant(applicant.id);
                  onClose();
                }
              }}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 shadow-sm'
              }`}
              title="Eliminar este postulante de forma permanente"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </motion.button>
          )}
        </div>

        <button
          id="save-assessment-button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`cursor-pointer text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 ${
            isDarkMode 
              ? 'bg-slate-100 hover:bg-white text-slate-950 border border-white' 
              : 'bg-[#004a8f] hover:bg-[#005baa] text-white shadow-sm'
          }`}
        >
          <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
