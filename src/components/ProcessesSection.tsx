/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Applicant, HiringProcess } from '../types';
import Avatar from './Avatar';
import { 
  Briefcase, Users, Award, Sparkles, Clock, ChevronRight, 
  ArrowLeft, CheckCircle, AlertCircle, Calendar, Building, 
  Plus, Search, Trash2, SlidersHorizontal, ArrowUpRight, 
  Check, X, Inbox, User, ThumbsUp, Tag, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProcessesSectionProps {
  applicants: Applicant[];
  onUpdateApplicant: (updated: Applicant) => void;
  isDarkMode?: boolean;
  onSelectApplicantInDashboard: (id: string) => void;
}

const DEFAULT_PROCESSES: HiringProcess[] = [
  {
    id: "proc-001",
    title: "Sistemas de Diseño y Arquitectura de Clientes",
    targetRoles: ["Arquitecto Frontend Principal", "Ingeniero de UI Creativo"],
    agency: "Nexus Talent",
    department: "Ingeniería",
    description: "Desarrollo de sistemas de diseño con efecto de vidrio esmerilado dinámico y microinteracciones optimizadas en React. Enfoque en rendimiento web avanzado, métricas Web Vitals y arquitecturas visuales reutilizables.",
    targetHires: 2,
    priority: "High",
    status: "Active",
    openDate: "2026-05-15"
  },
  {
    id: "proc-002",
    title: "Soluciones y Escalabilidad Cloud Native",
    targetRoles: ["Arquitecto de Soluciones Principal", "Ingeniero DevOps Senior"],
    agency: "Apex Careers",
    department: "Infraestructura",
    description: "Arquitectura de sistemas distribuidos a gran escala, balanceo de carga de bases de datos, conmutación por error multirregión y aprovisionamiento de infraestructura inmutable con Terraform.",
    targetHires: 1,
    priority: "Critical",
    status: "Active",
    openDate: "2026-05-20"
  },
  {
    id: "proc-003",
    title: "Orquestación de Telemetría y Producto SaaS",
    targetRoles: ["Gerente de Producto Técnico"],
    agency: "Nexus Talent",
    department: "Producto",
    description: "Formulación de hojas de ruta de ciclo de vida del producto, análisis de interacciones de usuario principales, pruebas A/B de matrices y conversión de comentarios en incidentes de desarrollo.",
    targetHires: 2,
    priority: "Medium",
    status: "Active",
    openDate: "2026-05-22"
  },
  {
    id: "proc-004",
    title: "Almacenamiento de Big Data y ETL Spark",
    targetRoles: ["Ingeniero de Infraestructura de Datos"],
    agency: "Quantum Recruiting",
    department: "Datos y BI",
    description: "Construcción de canalizaciones ETL estables y de alto rendimiento en Apache Spark, modelado de almacenes de datos con dbt y escalabilidad de sistemas de análisis SQL en tiempo real.",
    targetHires: 1,
    priority: "High",
    status: "Active",
    openDate: "2026-05-24"
  },
  {
    id: "proc-005",
    title: "Entrega Full-Stack en Tiempo Real",
    targetRoles: ["Ingeniero Full Stack Senior"],
    agency: "Quantum Recruiting",
    department: "Ingeniería",
    description: "Implementación de canalizaciones de aplicaciones en tiempo real mediante clústeres de WebSockets seguros, diseño de arquitectura de servidores en Node.js y reconciliación de microestados.",
    targetHires: 2,
    priority: "Critical",
    status: "Active",
    openDate: "2026-05-14"
  }
];

export default function ProcessesSection({
  applicants,
  onUpdateApplicant,
  isDarkMode = true,
  onSelectApplicantInDashboard,
}: ProcessesSectionProps) {
  // State for pipelines
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form Creation state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newAgency, setNewAgency] = useState('Nexus Talent');
  const [newTargetRolesText, setNewTargetRolesText] = useState('');
  const [newTargetHires, setNewTargetHires] = useState(1);
  const [newPriority, setNewPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [newDescription, setNewDescription] = useState('');

  // Persist load
  useEffect(() => {
    const stored = localStorage.getItem('candidate_dashboard_processes');
    if (stored) {
      setProcesses(JSON.parse(stored));
    } else {
      setProcesses(DEFAULT_PROCESSES);
      localStorage.setItem('candidate_dashboard_processes', JSON.stringify(DEFAULT_PROCESSES));
    }
  }, []);

  const saveProcessesLocal = (list: HiringProcess[]) => {
    setProcesses(list);
    localStorage.setItem('candidate_dashboard_processes', JSON.stringify(list));
  };

  // Associate candidates to hiring processes
  // Computes which candidate belongs to which process dynamically based on their role
  const processCandidateSync = useMemo(() => {
    const map: Record<string, Applicant[]> = {};
    processes.forEach(proc => {
      map[proc.id] = applicants.filter(app => {
        return proc.targetRoles.some(role => 
          app.role.toLowerCase().includes(role.toLowerCase()) || 
          role.toLowerCase().includes(app.role.toLowerCase())
        );
      });
    });
    return map;
  }, [processes, applicants]);

  // Selected Process Entity
  const selectedProcess = useMemo(() => {
    return processes.find(p => p.id === selectedProcessId) || null;
  }, [processes, selectedProcessId]);

  // Candidates in the active selected process
  const selectedProcessCandidates = useMemo(() => {
    if (!selectedProcessId) return [];
    return processCandidateSync[selectedProcessId] || [];
  }, [selectedProcessId, processCandidateSync]);

  // Find other candidates not associated with this process to offer reassignment
  const unassignedApplicants = useMemo(() => {
    if (!selectedProcess) return [];
    const assignedIds = new Set(selectedProcessCandidates.map(c => c.id));
    return applicants.filter(app => !assignedIds.has(app.id));
  }, [selectedProcess, selectedProcessCandidates, applicants]);

  // Calculate Overall Processes Stats
  const stats = useMemo(() => {
    const totalCount = processes.length;
    const activeCount = processes.filter(p => p.status === 'Active').length;
    const totalTargetHires = processes.reduce((acc, p) => acc + (p.status === 'Active' ? p.targetHires : 0), 0);
    
    // Find count of unique applicants assigned to any process
    const assignedApplicantIds = new Set<string>();
    processes.forEach(proc => {
      const list = processCandidateSync[proc.id] || [];
      list.forEach(item => assignedApplicantIds.add(item.id));
    });

    const averageScoresAcrossPipelines = processes.flatMap(proc => processCandidateSync[proc.id] || []);
    const sumScore = averageScoresAcrossPipelines.reduce((acc, app) => {
      const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
      return acc + ((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);
    }, 0);
    const avgScore = averageScoresAcrossPipelines.length > 0 
      ? Math.round(sumScore / averageScoresAcrossPipelines.length) 
      : 85;

    return {
      totalCount,
      activeCount,
      totalTargetHires,
      candidatesInPipelines: assignedApplicantIds.size,
      avgScore
    };
  }, [processes, processCandidateSync]);

  // List of distinct Departments for filtering
  const departments = useMemo(() => {
    const list = new Set(processes.map(p => p.department));
    return ['All', ...Array.from(list)];
  }, [processes]);

  // Filtered Processes list
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetRoles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDept = deptFilter === 'All' || p.department === deptFilter;
      const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesDept && matchesPriority && matchesStatus;
    });
  }, [processes, searchQuery, deptFilter, priorityFilter, statusFilter]);

  // Handle Create Submit
  const handleAddNewProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTargetRolesText) return;

    const parsedRoles = newTargetRolesText.split(',').map(r => r.trim()).filter(Boolean);
    const newProc: HiringProcess = {
      id: `proc-${Date.now()}`,
      title: newTitle,
      targetRoles: parsedRoles,
      agency: newAgency,
      department: newDepartment,
      description: newDescription || `Custom optimized candidate sourcing funnel for ${newTitle} and corresponding sub-modules.`,
      targetHires: Number(newTargetHires),
      priority: newPriority,
      status: 'Active',
      openDate: new Date().toISOString().split('T')[0]
    };

    const list = [...processes, newProc];
    saveProcessesLocal(list);

    // Reset Form
    setNewTitle('');
    setNewTargetRolesText('');
    setNewDescription('');
    setNewTargetHires(1);
    setNewPriority('Medium');
    setIsFormOpen(false);
  };

  // Delete Process Pipeline
  const handleDeleteProcess = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting process card
    const list = processes.filter(p => p.id !== id);
    saveProcessesLocal(list);
    if (selectedProcessId === id) {
      setSelectedProcessId(null);
    }
  };

  // Toggle status of a candidate in the active process
  const handleCandidateStatusChange = (applicantId: string, nextStatus: Applicant['status']) => {
    const candidate = applicants.find(a => a.id === applicantId);
    if (!candidate) return;

    const updatedTimeline = [...candidate.timeline];
    updatedTimeline.push({
      id: `e-${Date.now()}`,
      stage: `Estado actualizado en el canal: ${nextStatus}`,
      date: new Date().toISOString().split('T')[0],
      status: nextStatus === 'Rejected' ? 'rejected' : 'completed',
      note: `Transición de candidato realizada con éxito.`
    });

    onUpdateApplicant({
      ...candidate,
      status: nextStatus,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    });
  };

  // Quick reassign a candidate into this process
  // Adjusts their 'role' to match of the process' targetRoles so that dynamic sync captures them!
  const handleAssignCandidateToProcess = (applicant: Applicant) => {
    if (!selectedProcess) return;
    const destinationRole = selectedProcess.targetRoles[0] || applicant.role;
    
    const updatedTimeline = [...applicant.timeline];
    updatedTimeline.push({
      id: `e-${Date.now()}`,
      stage: `Reasignación de Canal`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      note: `Candidato alineado con la vacante de ${selectedProcess.title}.`
    });

    onUpdateApplicant({
      ...applicant,
      role: destinationRole,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div id="processes-dashboard-layout" className="w-full space-y-8 pb-10">
      {/* Overview Statistics banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`backdrop-blur-xl border rounded-2xl p-4.5 transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-[#AAB9C2]/45 shadow-[0_4px_20px_rgba(15,23,42,0.02)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Canales Activos</span>
              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeCount} <span className="text-xs font-normal text-slate-500">de {stats.totalCount} total</span></span>
            </div>
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-2xl p-4.5 transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-[#AAB9C2]/45 shadow-[0_4px_20px_rgba(15,23,42,0.02)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Meta de Contratación</span>
              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalTargetHires} Vacantes</span>
            </div>
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-2xl p-4.5 transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-[#AAB9C2]/45 shadow-[0_4px_20px_rgba(15,23,42,0.02)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Talento Sincronizado</span>
              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.candidatesInPipelines} Asignados</span>
            </div>
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-2xl p-4.5 transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white border-[#AAB9C2]/45 shadow-[0_4px_20px_rgba(15,23,42,0.02)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              <Percent className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Promedio de Cartera</span>
              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.avgScore}% de Coincidencia</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedProcessId ? (
          /* LIST VIEW SCREEN */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Control Bar: Search & Filter & CTA */}
            <div className={`relative backdrop-blur-xl border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
                {/* Search query box */}
                <div className={`relative px-3.5 py-2 border rounded-xl flex items-center gap-2 w-full sm:w-64 transition-all ${
                  isDarkMode ? 'bg-slate-950/40 border-white/10 focus-within:border-cyan-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-cyan-500 focus-within:bg-white'
                }`}>
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar requisiciones o roles..."
                    className="bg-transparent text-xs outline-none w-full border-none p-0 text-slate-200 placeholder-slate-500 focus:ring-0 focus:border-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-0.5 rounded-full hover:bg-white/15 cursor-pointer">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Dept Filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className={`text-xs border rounded-xl px-3 py-2 cursor-pointer outline-none transition-all ${
                    isDarkMode ? 'bg-slate-950/40 border-white/10 text-slate-300 focus:border-cyan-500/50' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="All">Todos los Departamentos</option>
                  {departments.filter(d => d !== 'All').map(dept => (
                    <option key={dept} value={dept}>{dept === 'Engineering' ? 'Ingeniería' : dept === 'Infrastructure' ? 'Infraestructura' : dept === 'Product' ? 'Producto' : dept === 'Data & BI' ? 'Datos y BI' : dept}</option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={`text-xs border rounded-xl px-3 py-2 cursor-pointer outline-none transition-all ${
                    isDarkMode ? 'bg-slate-950/40 border-white/10 text-slate-300 focus:border-cyan-500/50' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="All">Todas las Prioridades</option>
                  <option value="Critical">Crítica</option>
                  <option value="High">Alta</option>
                  <option value="Medium">Media</option>
                  <option value="Low">Baja</option>
                </select>
              </div>

              {/* Add process requisition CTA Button */}
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="cursor-pointer text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
              >
                {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isFormOpen ? 'Cancelar Creación' : 'Nueva Requisición de Sourcing'}
              </button>
            </div>

            {/* Pipeline creation dropdown block */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleAddNewProcess} className={`border rounded-2xl p-5 space-y-4 shadow-md transition-all duration-300 ${
                    isDarkMode ? 'bg-slate-900/60 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2.5 border-dashed border-slate-700/30">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        Configurar Nuevo Canal de Sourcing Interactivo
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setIsFormOpen(false)}
                        className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-white/15 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Título de la Requisición *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="ej. Operaciones Cloud Serverless y Seguridad"
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Departamento Principal *</label>
                        <select
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        >
                          <option value="Engineering">Ingeniería</option>
                          <option value="Infrastructure">Infraestructura</option>
                          <option value="Product">Producto</option>
                          <option value="Design Engineering">Ingeniería de Diseño</option>
                          <option value="Data & BI">Datos y BI</option>
                          <option value="Operations">Operaciones</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Roles del Candidato Objetivo * <span className="text-[9px] text-slate-500 font-normal">(Separados por comas para emparejamiento dinámico)</span></label>
                        <input
                          type="text"
                          required
                          value={newTargetRolesText}
                          onChange={(e) => setNewTargetRolesText(e.target.value)}
                          placeholder="ej. Ingeniero DevOps Senior, Líder de Infraestructura"
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Vacantes Objetivo</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newTargetHires}
                          onChange={(e) => setNewTargetHires(Number(e.target.value))}
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Prioridad de Sourcing</label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value as any)}
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        >
                          <option value="Critical">🔴 Prioridad Crítica</option>
                          <option value="High">🟠 Prioridad Alta</option>
                          <option value="Medium">🟡 Prioridad Media</option>
                          <option value="Low">🟢 Prioridad Baja</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Descripción Breve del Canal</label>
                        <input
                          type="text"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Resumen de responsabilidades y métricas de alineación objetivo..."
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] uppercase font-mono block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Socio de Agencia Principal</label>
                        <select
                          value={newAgency}
                          onChange={(e) => setNewAgency(e.target.value)}
                          className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:ring-1 transition-all ${
                            isDarkMode 
                              ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500' 
                              : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white'
                          }`}
                        >
                          <option value="Nexus Talent">Nexus Talent</option>
                          <option value="Quantum Recruiting">Quantum Recruiting</option>
                          <option value="Apex Careers">Apex Careers</option>
                          <option value="Global Workforce">Global Workforce</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 border-t border-slate-700/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'text-slate-300 hover:text-white bg-slate-950/20 border-white/5 hover:bg-slate-900/40' 
                            : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200/50'
                        }`}
                      >
                        Abandonar
                      </button>
                      <button
                        type="submit"
                        className="cursor-pointer text-xs font-bold px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white shadow-sm transition-all"
                      >
                        Agregar Canal de Sourcing
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid of Large Selectable Requisition Boxes */}
            {filteredProcesses.length === 0 ? (
              <div className={`border rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
                isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'
              }`}>
                <Inbox className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
                <h5 className={`text-base font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>No se encontraron canales de sourcing</h5>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">
                  Ajuste los filtros o presione "Nueva Requisición de Sourcing" para construir canales personalizados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProcesses.map((proc) => {
                  const correlatedCandidates = processCandidateSync[proc.id] || [];
                  const activeCandidateCount = correlatedCandidates.length;

                  // Average index score of candidates currently linked
                  const sumScore = correlatedCandidates.reduce((acc, app) => {
                     const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
                     return acc + ((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);
                  }, 0);
                  const dynamicAvgMatch = activeCandidateCount > 0 
                    ? Math.round(sumScore / activeCandidateCount) 
                    : 0;

                  // Priority style picker
                  const priorityMeta = {
                    Critical: { bg: 'bg-rose-500/10 text-rose-450 border-rose-500/20 text-rose-500', dots: 'bg-rose-500', name: 'Crítica' },
                    High: { bg: 'bg-amber-500/10 text-amber-450 border-amber-500/20 text-amber-600', dots: 'bg-amber-500', name: 'Alta' },
                    Medium: { bg: 'bg-cyan-500/10 text-cyan-450 border-cyan-500/20 text-cyan-600', dots: 'bg-cyan-500', name: 'Media' },
                    Low: { bg: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-emerald-600', dots: 'bg-emerald-500', name: 'Baja' }
                  }[proc.priority] || { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20 text-slate-600', dots: 'bg-slate-400', name: proc.priority };

                  return (
                    <motion.div
                      key={proc.id}
                      onClick={() => setSelectedProcessId(proc.id)}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`group relative backdrop-blur-xl border rounded-2xl p-5 flex flex-col justify-between cursor-pointer min-h-[220px] transition-all duration-300 shadow-sm hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/5 hover:border-white/15' 
                          : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top metadata tags */}
                      <div className="flex items-start justify-between gap-2 mb-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityMeta.bg}`}>
                            {priorityMeta.name}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isDarkMode ? 'bg-slate-900 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {proc.department === 'Engineering' ? 'Ingeniería' : proc.department === 'Infrastructure' ? 'Infraestructura' : proc.department === 'Product' ? 'Producto' : proc.department === 'Data & BI' ? 'Datos y BI' : proc.department}
                          </span>
                        </div>
                        
                        {/* Delete action */}
                        <button
                          onClick={(e) => handleDeleteProcess(proc.id, e)}
                          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-rose-500 cursor-pointer ${
                            isDarkMode ? 'text-slate-500 hover:bg-white/10' : 'text-slate-405 text-slate-450 hover:bg-slate-100'
                          }`}
                          title="Archivar Requisición"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5 flex-1 select-none">
                        <h4 className={`text-sm font-semibold leading-tight group-hover:text-cyan-500 tracking-wide transition-colors ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {proc.title}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-3">
                          {proc.description}
                        </p>
                      </div>

                      {/* Custom visual progress bar or metric alignment */}
                      <div className="my-3.5 space-y-1 select-none">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 text-slate-500">
                          <span>Progreso del canal:</span>
                          <span className="font-bold">
                            {activeCandidateCount} / {proc.targetHires} contrataciones
                          </span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <div 
                            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((activeCandidateCount / proc.targetHires) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Quick attributes */}
                      <div className={`mt-2 border-t pt-3 flex items-center justify-between text-[11px] font-mono ${
                        isDarkMode ? 'border-white/5' : 'border-slate-100'
                      }`}>
                        <div className="flex items-center gap-1 text-slate-500 leading-none">
                          <Building className="w-3 h-3 text-cyan-500" />
                          <span className="truncate max-w-[110px]">{proc.agency}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {dynamicAvgMatch > 0 && (
                            <div className="flex items-center gap-0.5" title="Calificación promedio del candidato">
                              <span className={`font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{dynamicAvgMatch}%</span>
                              <span className="text-[9px] text-slate-500">promedio</span>
                            </div>
                          )}
                          <div className={`p-1 rounded-lg backdrop-blur-md flex items-center justify-center ${
                            isDarkMode ? 'bg-white/5 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-400' : 'bg-slate-100 group-hover:bg-cyan-50 text-slate-500 group-hover:text-cyan-600'
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* DETAILS SCREEN (Clicking on a process loads this section details) */
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header / Navigation bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dashed pb-5 border-slate-700/30">
              <button
                onClick={() => setSelectedProcessId(null)}
                className={`cursor-pointer group flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'text-slate-300 hover:text-cyan-400 bg-slate-900/60 border-white/10 hover:border-cyan-500/30' 
                    : 'text-slate-700 hover:text-cyan-600 bg-white border-slate-200 shadow-sm'
                }`}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Regresar al Panel de Requisiciones
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-lg uppercase border font-semibold ${
                  isDarkMode ? 'bg-slate-900 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  ID del Canal: {selectedProcess?.id}
                </span>
                <span className={`text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-lg uppercase border font-semibold ${
                  isDarkMode ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}>
                  Fecha de Apertura: {selectedProcess?.openDate}
                </span>
              </div>
            </div>

            {/* Core split section: Requisition Profile card vs Candidates Pipeline lists */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Requisition Specifications (4/12 width) */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`backdrop-blur-xl border rounded-2xl p-5 space-y-4 shadow-sm transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
                }`}>
                  <div>
                    <span className="text-[9px] font-mono text-cyan-500 font-bold uppercase tracking-wider block">Requisitos de Requisición Objetivo</span>
                    <h3 className={`text-base font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProcess?.title}</h3>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {selectedProcess?.description}
                  </p>

                  <div className={`border-t pt-3.5 space-y-2.5 text-[11px] ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Agencia de Conexión:</span>
                      <span className={`font-semibold flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Building className="w-3.5 h-3.5 text-cyan-400" /> {selectedProcess?.agency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Departamento Asociado:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedProcess?.department === 'Engineering' ? 'Ingeniería' : selectedProcess?.department === 'Infrastructure' ? 'Infraestructura' : selectedProcess?.department === 'Product' ? 'Producto' : selectedProcess?.department === 'Data & BI' ? 'Datos y BI' : selectedProcess?.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Puestos de Enfoque:</span>
                      <span className={`font-semibold text-right ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {selectedProcess?.targetRoles.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Factor de Prioridad:</span>
                      <span className={`font-bold uppercase ${selectedProcess?.priority === 'Critical' ? 'text-rose-500' : selectedProcess?.priority === 'High' ? 'text-amber-500' : 'text-cyan-500'}`}>{selectedProcess?.priority === 'Critical' ? 'Crítica' : selectedProcess?.priority === 'High' ? 'Alta' : selectedProcess?.priority === 'Medium' ? 'Media' : 'Baja'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Total de Vacantes Abiertas:</span>
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{selectedProcess?.targetHires} vacantes</span>
                    </div>
                  </div>

                  {/* Skills Tag block based on Roles list */}
                  <div className={`border-t pt-3.5 space-y-1.5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Palabras Clave de Competencias</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProcess?.targetRoles.map((role) => (
                        <span key={role} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isDarkMode ? 'bg-slate-950 text-cyan-300 border border-cyan-500/10' : 'bg-cyan-50/50 text-cyan-700 border border-cyan-200/50'
                        }`}>
                          {role}
                        </span>
                      ))}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-950 text-purple-300 border border-purple-500/10' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>Resultado de Evaluación &gt; 80%</span>
                    </div>
                  </div>
                </div>

                {/* Unassigned Applicants Matcher panel */}
                <div className={`backdrop-blur-xl border rounded-2xl p-5 space-y-3 shadow-sm transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="text-indigo-400 w-4 h-4" />
                    Herramienta de Búsqueda de Candidatos
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Reasigne instantáneamente a cualquier candidato archivado o perfil no vinculado a este canal.
                  </p>

                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
                    {unassignedApplicants.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-4">No se encontraron candidatos libres</p>
                    ) : (
                      unassignedApplicants.map(app => (
                        <div 
                          key={app.id} 
                          className={`flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all ${
                            isDarkMode ? 'bg-slate-950/40 border-white/5 hover:bg-slate-950' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="leading-tight truncate max-w-[140px]">
                            <p className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{app.name}</p>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">{app.role} ({app.agency})</p>
                          </div>
                          <button
                            onClick={() => handleAssignCandidateToProcess(app)}
                            className="text-[9px] font-bold px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500 hover:text-white rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0 cursor-pointer transition-colors"
                          >
                            Vincular Canal
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Candidates in Pipeline Stages (8/12 width) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Kanban Stages distribution overview */}
                <div className={`backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h4 className={`text-xs font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Etapas del Canal de Sourcing</h4>
                  
                  {/* Kanban horizontal columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { title: 'Nueva Evaluación', statusList: ['New', 'Screening'], color: 'from-cyan-500 to-cyan-600' },
                      { title: 'Entrevistando', statusList: ['Interviewing'], color: 'from-indigo-500 to-indigo-600' },
                      { title: 'Preseleccionado', statusList: ['Shortlisted'], color: 'from-fuchsia-500 to-fuchsia-600' },
                      { title: 'Ofertado', statusList: ['Offered'], color: 'from-emerald-500 to-emerald-600' },
                      { title: 'Archivado', statusList: ['Rejected', 'Archived'], color: 'from-slate-500 to-slate-650' }
                    ].map((col) => {
                      const count = selectedProcessCandidates.filter(c => col.statusList.includes(c.status)).length;
                      return (
                        <div key={col.title} className={`p-2.5 rounded-xl border text-center ${
                          isDarkMode ? 'bg-slate-950/30 border-white/5' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <p className="text-[9px] font-mono text-slate-500 uppercase">{col.title}</p>
                          <p className={`text-lg font-bold mt-1.5 ${count > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>{count}</p>
                          {count > 0 && (
                            <div className={`w-6 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r ${col.color}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate list items */}
                <div className={`backdrop-blur-xl border rounded-2xl p-5 space-y-4 shadow-sm transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-202 border-slate-200/80 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5">
                      <Users className="text-cyan-400 w-4 h-4" />
                      Candidatos Activos Asociados ({selectedProcessCandidates.length})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Coincidencias dinámicas de contratación</span>
                  </div>

                  {selectedProcessCandidates.length === 0 ? (
                    <div className="text-center py-10 space-y-1 select-none">
                      <Users className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
                      <p className="text-[11px] font-semibold text-slate-400">Canal de Sourcing Vacío</p>
                      <p className="text-[10px] text-slate-500">
                        No hay candidatos asignados a este proceso actualmente. ¡Vincule candidatos libres desde el panel izquierdo!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProcessCandidates.map((cand) => {
                        // Calculate score
                        const { technical, communication, leadership, cultureFit, experience, problemSolving } = cand.metrics;
                        const avgIndex = Math.round((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);

                        // Status pill select styles
                        const statusColors: Record<Applicant['status'], string> = {
                          New: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-cyan-600',
                          Screening: 'bg-sky-500/10 text-sky-400 border-sky-500/20 text-sky-600',
                          Interviewing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-indigo-600',
                          Shortlisted: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 text-fuchsia-600',
                          Offered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-emerald-600',
                          Archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20 text-slate-600',
                          Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20 text-rose-600'
                        };

                        return (
                          <div 
                            key={cand.id} 
                            className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                              isDarkMode 
                                ? 'bg-slate-950/25 border-white/5 hover:border-white/10 hover:bg-slate-950/50' 
                                : 'bg-slate-50/50 border-slate-150 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar name={cand.name} className="w-10 h-10 rounded-xl text-xs hover:scale-105 transition-transform" />
                              <div className="leading-tight">
                                <div className="flex items-center gap-2">
                                  <h5 className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{cand.name}</h5>
                                  <span className="text-[9px] text-slate-500 font-mono">Reclutado por {cand.agency}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">{cand.role} • {cand.experienceYears} {cand.experienceYears === 1 ? 'año' : 'años'} de experiencia</p>
                              </div>
                            </div>

                            {/* Score & Controls block */}
                            <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto justify-between md:justify-end">
                              {/* Average evaluation indicator */}
                              <div className="flex items-center gap-1.5 bg-slate-950/15 border border-white/5 px-2.5 py-1 rounded-lg">
                                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Eval:</span>
                                <span className={`text-xs font-bold ${avgIndex >= 85 ? 'text-emerald-400' : 'text-indigo-400'}`}>{avgIndex}%</span>
                              </div>

                              {/* Interactive Kanban state manager dropdown */}
                              <div className="flex items-center gap-2">
                                <label className="text-[9px] uppercase font-mono text-slate-500 shrink-0">Etapa:</label>
                                <select
                                  value={cand.status}
                                  onChange={(e) => handleCandidateStatusChange(cand.id, e.target.value as Applicant['status'])}
                                  className={`text-xs rounded-lg px-2.5 py-1.5 cursor-pointer outline-none transition-all font-semibold ${
                                    isDarkMode 
                                      ? 'bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-500/50' 
                                      : 'bg-white border border-slate-200 text-slate-700 shadow-sm focus:border-cyan-500'
                                  }`}
                                >
                                  <option value="New">Nueva Evaluación</option>
                                  <option value="Screening">Primer Filtro RH</option>
                                  <option value="Interviewing">Entrevista en Vivo</option>
                                  <option value="Shortlisted">Preseleccionado</option>
                                  <option value="Offered">Oferta Extendida</option>
                                  <option value="Archived">Archivado</option>
                                  <option value="Rejected">Declinado</option>
                                </select>
                              </div>

                              {/* Target details redirect */}
                              <button
                                onClick={() => onSelectApplicantInDashboard(cand.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                  isDarkMode 
                                    ? 'bg-white/5 border-white/5 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 text-slate-300' 
                                    : 'bg-white border-slate-200 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 shadow-sm'
                                }`}
                                title="Ver Ficha de Evaluación Completa"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
