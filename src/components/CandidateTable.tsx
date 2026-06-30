/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Applicant } from '../types';
import Avatar from './Avatar';
import { Search, Filter, Trash2, Edit3, Eye, Plus, ArrowUpDown, Database, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface CandidateTableProps {
  applicants: Applicant[];
  selectedApplicantId: string | null;
  onSelectApplicant: (id: string) => void;
  onEditApplicant: (applicant: Applicant) => void;
  onDeleteApplicant: (id: string) => void;
  onAddApplicantTrigger: () => void;
  onExtractDBTrigger: () => void;
  extractionStatus: string;
  isExtracting: boolean;
  isDarkMode?: boolean;
  onViewProfile?: (id: string) => void;
  onUpdateApplicant?: (applicant: Applicant) => void;
}

type SortField = 'name' | 'agency' | 'role' | 'score' | 'experience';
type SortOrder = 'asc' | 'desc';

export default function CandidateTable({
  applicants,
  selectedApplicantId,
  onSelectApplicant,
  onEditApplicant,
  onDeleteApplicant,
  onAddApplicantTrigger,
  onExtractDBTrigger,
  extractionStatus,
  isExtracting,
  isDarkMode = true,
  onViewProfile,
  onUpdateApplicant,
}: CandidateTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Calculate Average Qualification Score for Sorting/Display
  const getAverageScore = (app: Applicant) => {
    const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
    return Math.round((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);
  };

  // Safe display label translation helper
  const getStatusLabelText = (status: Applicant['status']) => {
    switch (status) {
      case 'New': return 'Nuevo';
      case 'Screening': return 'Filtrado';
      case 'Interviewing': return 'En Entrevista';
      case 'Shortlisted': return 'Preseleccionado';
      case 'Offered': return 'Ofertado';
      case 'Rejected': return 'Rechazado';
      case 'Archived': return 'Archivado';
      default: return status;
    }
  };

  // Extract unique agencies for filter dropdown
  const agencies = Array.from(new Set(applicants.map(a => a.agency)));

  // Filter Applicants
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesAgency = agencyFilter === 'all' || app.agency === agencyFilter;
    return matchesSearch && matchesStatus && matchesAgency;
  });

  // Sort Applicants
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    let aValue: any = a[sortField as keyof Applicant] || '';
    let bValue: any = b[sortField as keyof Applicant] || '';

    if (sortField === 'score') {
      aValue = getAverageScore(a);
      bValue = getAverageScore(b);
    } else if (sortField === 'experience') {
      aValue = a.experienceYears;
      bValue = b.experienceYears;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Glass Badge styling helper for recruitment statuses
  const getStatusStyle = (status: Applicant['status']) => {
    switch (status) {
      case 'New':
        return isDarkMode 
          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
          : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm';
      case 'Screening':
        return isDarkMode 
          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
          : 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm';
      case 'Interviewing':
        return isDarkMode 
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      case 'Shortlisted':
        return isDarkMode 
          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
          : 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm';
      case 'Offered':
        return isDarkMode 
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      case 'Rejected':
        return isDarkMode 
          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
          : 'bg-rose-50 text-rose-700 border-rose-250 shadow-sm';
      case 'Archived':
      default:
        return isDarkMode 
          ? 'bg-slate-500/10 text-slate-300 border-slate-500/30'
          : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="candidates-table-section" className={`relative backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(10,15,30,0.4)]' 
        : 'bg-white/70 border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
    }`}>
      {/* Table Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="applicants-table-title" className={`text-xl font-medium tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Portal de Revisión de Candidatos
            <span className={`text-xs font-normal font-mono px-2.5 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' 
                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
            }`}>
              {applicants.length} perfiles sincronizados
            </span>
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Indicadores extraídos de agencias de reclutamiento. Haz clic en cualquier candidato para inspeccionar su puntuación completa.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Extract/Sync Button */}
          <button
            id="db-extract-button"
            onClick={onExtractDBTrigger}
            disabled={isExtracting}
            className={`cursor-pointer text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all border ${
              isExtracting 
                ? isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-100 text-amber-800 border-amber-200'
                : isDarkMode 
                  ? 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95' 
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Sincronizando Google Sheets...' : 'Sincronizar Google Sheets'}
          </button>

          {/* Add Applicant Button */}
          <button
            id="add-candidate-button"
            onClick={onAddApplicantTrigger}
            className="cursor-pointer text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004a8f] via-[#005baa] to-[#00b0d8] hover:opacity-95 text-white shadow-md transition-all flex items-center gap-1.5 active:scale-95 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            Agregar Candidato
          </button>
        </div>
      </div>

      {/* Sync Log bar if active */}
      {extractionStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 text-xs font-mono px-3.5 py-2.5 rounded-xl border flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-slate-950/45 border-white/5 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{extractionStatus}</span>
          <span className={`ml-auto text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Latency: 28ms</span>
        </motion.div>
      )}

      {/* Liquid Search & Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            id="candidate-search-input"
            type="text"
            placeholder="Buscar por nombre, etiquetas, puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full text-xs rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all ${
              isDarkMode 
                ? 'placeholder:text-slate-500 text-slate-100 bg-slate-950/30 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20' 
                : 'placeholder:text-slate-400 text-slate-800 bg-white border-slate-200 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20'
            }`}
          />
        </div>

        {/* Agency Filter */}
        <div className="relative">
          <Filter className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <select
            id="agency-filter"
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className={`w-full text-xs rounded-xl py-2.5 pl-9 pr-4 outline-none transition-all cursor-pointer appearance-none border ${
              isDarkMode 
                ? 'text-slate-200 bg-slate-950/30 border-white/10 focus:border-cyan-500/50' 
                : 'text-slate-800 bg-white border-slate-200 focus:border-cyan-500'
            }`}
          >
            <option value="all" className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>Todas las Agencias</option>
            {agencies.map(ag => (
              <option key={ag} value={ag} className={isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>{ag}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-slate-500/50" />
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full text-xs rounded-xl py-2.5 pl-9 pr-4 outline-none transition-all cursor-pointer appearance-none border ${
              isDarkMode 
                ? 'text-slate-200 bg-slate-950/30 border-white/10 focus:border-cyan-500/50' 
                : 'text-slate-800 bg-white border-slate-200 focus:border-cyan-500'
            }`}
          >
            <option value="all" className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>Todos los Estados</option>
            <option value="New" className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>Nuevo</option>
            <option value="Screening" className={isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}>Filtrado</option>
            <option value="Interviewing" className={isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}>En Entrevista</option>
            <option value="Shortlisted" className={isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}>Preseleccionado</option>
            <option value="Offered" className={isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}>Ofertado</option>
            <option value="Rejected" className={isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}>Rechazado</option>
          </select>
        </div>

        {/* Clear Filters indicator */}
        <div className="flex items-center justify-end">
          {(searchTerm || statusFilter !== 'all' || agencyFilter !== 'all') && (
            <button
              id="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAgencyFilter('all');
              }}
              className={`text-[11px] font-medium transition-all font-mono ${
                isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
              }`}
            >
              Reiniciar Filtros [×]
            </button>
          )}
        </div>
      </div>

      {/* Main Glass Table container */}
      <div className="overflow-x-auto w-full">
        <table id="applicants-data-table" className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-mono tracking-wider uppercase ${
              isDarkMode ? 'border-white/15 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
              <th 
                className={`py-3 px-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  Candidato
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th 
                className={`py-3 px-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                onClick={() => handleSort('agency')}
              >
                <div className="flex items-center gap-1.5">
                  Agencia
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th 
                className={`py-3 px-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-1.5">
                  Puesto de Interés
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th 
                className={`py-3 px-4 cursor-pointer transition-colors text-center ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                onClick={() => handleSort('experience')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Exp.
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th 
                className={`py-3 px-4 cursor-pointer transition-colors text-center ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Índice Calif.
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 pr-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-white/5' : 'divide-slate-200/60'}`}>
            {sortedApplicants.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                  Ningún candidato coincide con los parámetros de búsqueda.
                </td>
              </tr>
            ) : (
              sortedApplicants.map((app) => {
                const isSelected = selectedApplicantId === app.id;
                const averageScore = getAverageScore(app);

                // Rating gradient indicator color
                let indexColor = 'from-rose-500 to-orange-500';
                let indexText = 'text-rose-400';
                if (averageScore >= 88) {
                  indexColor = 'from-cyan-400 to-emerald-400';
                  indexText = 'text-emerald-400';
                } else if (averageScore >= 78) {
                  indexColor = 'from-indigo-400 to-cyan-400';
                  indexText = isDarkMode ? 'text-cyan-400 animate-pulse' : 'text-cyan-600 font-semibold';
                }

                                return (
                  <motion.tr
                    id={`row-${app.id}`}
                    key={app.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`group transition-all ${
                      isSelected 
                        ? isDarkMode 
                          ? 'bg-white/10 border-l-2 border-l-cyan-400 shadow-[inset_4px_0_12px_rgba(6,182,212,0.1)] font-medium' 
                          : 'bg-slate-100/80 border-l-2 border-l-cyan-500 shadow-[inset_4px_0_12px_rgba(6,182,212,0.03)] font-medium'
                        : isDarkMode
                          ? 'hover:bg-white/5'
                          : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Candidate Info */}
                    <td 
                      onClick={() => onViewProfile ? onViewProfile(app.id) : onSelectApplicant(app.id)}
                      className="py-3.5 px-4 cursor-pointer"
                      title="Ver Perfil Completo en Pantalla Completa"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={app.name} className="w-9 h-9 rounded-xl text-xs hover:scale-105 transition-transform" />
                        <div>
                          <p id={`candidate-name-${app.id}`} className={`font-medium transition-colors ${
                            isDarkMode ? 'text-slate-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'
                          }`}>{app.name}</p>
                          <p className={`text-[10px] tracking-tight font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{app.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Agency */}
                    <td 
                      onClick={() => onSelectApplicant(app.id)}
                      className={`py-3.5 px-4 font-mono font-medium cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      {app.agency}
                    </td>

                    {/* Role / Tech tags */}
                    <td 
                      onClick={() => onSelectApplicant(app.id)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{app.role}</p>
                        <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                          {app.skills.slice(0, 3).map((skill) => (
                            <span 
                              key={skill} 
                              className={`text-[9px] font-mono leading-none px-1.5 py-0.5 rounded border ${
                                isDarkMode 
                                  ? 'bg-slate-900/40 text-slate-400 border-white/5' 
                                  : 'bg-slate-100/90 text-slate-600 border-slate-200'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {app.skills.length > 3 && (
                            <span className="text-[8px] font-mono leading-none text-slate-500">
                              +{app.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Experience in Years */}
                    <td 
                      onClick={() => onSelectApplicant(app.id)}
                      className={`py-3.5 px-4 text-center cursor-pointer font-mono font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      {app.experienceYears} años
                    </td>

                    {/* Average score circular/pill indicator */}
                    <td 
                      onClick={() => onSelectApplicant(app.id)}
                      className="py-3.5 px-4 text-center cursor-pointer"
                    >
                      <div className="flex items-center justify-center flex-col gap-1">
                        <span className={`font-mono font-semibold text-sm ${indexText}`}>
                          {averageScore}%
                        </span>
                        {/* Progressive micro bar */}
                        <div className={`w-12 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-200'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${averageScore}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${indexColor}`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Recruitment Status Dropdown preview */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                          return statusMap[app.status] || 'Base de Datos';
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
                          if (onUpdateApplicant) {
                            onUpdateApplicant({ ...app, status: newEnStatus });
                          }
                        }}
                        className={`text-[10px] font-semibold tracking-wider font-mono px-2 py-1 rounded-xl border outline-none cursor-pointer transition-colors ${getStatusStyle(app.status)}`}
                      >
                        <option value="Base de Datos">Base de Datos</option>
                        <option value="Segunda Opción">Segunda Opción</option>
                        <option value="Selección">Selección</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </td>

                    {/* Row Quick Action Tools */}
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <motion.button
                          id={`btn-view-${app.id}`}
                          onClick={() => onSelectApplicant(app.id)}
                          title="Abrir espacio de evaluación"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-cyan-500/20 text-cyan-400' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-500/40 text-cyan-600 shadow-sm'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          id={`btn-edit-${app.id}`}
                          onClick={() => onEditApplicant(app)}
                          title="Editar calificaciones"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-indigo-500/20 text-indigo-400' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-500/40 text-indigo-600 shadow-sm'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          id={`btn-delete-${app.id}`}
                          onClick={() => onDeleteApplicant(app.id)}
                          title="Archivar / Descartar candidato"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/5 hover:bg-rose-500/20 border-white/10 hover:border-rose-500/20 text-rose-400' 
                              : 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-300 text-rose-600 shadow-sm'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
