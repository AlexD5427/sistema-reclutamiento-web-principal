/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Applicant, AgencyStats } from '../types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ComposedChart,
  Line,
  Area,
} from 'recharts';
import { Award, TrendingUp, BarChart3, Users, Network } from 'lucide-react';

interface ChartsSectionProps {
  selectedApplicant: Applicant | null;
  allApplicants: Applicant[];
  agencyStats: AgencyStats[];
  isDarkMode?: boolean;
}

export default function ChartsSection({
  selectedApplicant,
  allApplicants,
  agencyStats,
  isDarkMode = true,
}: ChartsSectionProps) {
  const [activeChartTab, setActiveChartTab] = useState<'individual' | 'agency' | 'distribution'>('individual');

  // 1. Individual metrics formatting for Radar Chart
  const getRadarData = (app: Applicant) => {
    return [
      { subject: 'Técnico', value: app.metrics.technical, fullMark: 100 },
      { subject: 'Comunicación', value: app.metrics.communication, fullMark: 100 },
      { subject: 'Liderazgo', value: app.metrics.leadership, fullMark: 100 },
      { subject: 'Ajuste Cultural', value: app.metrics.cultureFit, fullMark: 100 },
      { subject: 'Experiencia', value: app.metrics.experience, fullMark: 100 },
      { subject: 'Resolución de Prob.', value: app.metrics.problemSolving, fullMark: 100 },
    ];
  };

  const currentRadarData = selectedApplicant ? getRadarData(selectedApplicant) : [];

  // 2. Score distribution calculation
  const getDistributionData = () => {
    const bins = [
      { range: '60-69', count: 0 },
      { range: '70-79', count: 0 },
      { range: '80-89', count: 0 },
      { range: '90-100', count: 0 },
    ];

    allApplicants.forEach(app => {
      const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
      const avg = (technical + communication + leadership + cultureFit + experience + problemSolving) / 6;
      if (avg >= 90) bins[3].count++;
      else if (avg >= 80) bins[2].count++;
      else if (avg >= 70) bins[1].count++;
      else if (avg >= 60) bins[0].count++;
    });

    return bins;
  };

  // Custom tooltips coded to keep Liquid Glass branding theme consistent
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`backdrop-blur-xl p-2 text-xs font-mono rounded-lg shadow-xl border ${
          isDarkMode ? 'bg-slate-950/80 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <p className={`${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} font-bold`}>{payload[0].name}</p>
          <p>{payload[0].payload.subject}: <span className="font-semibold text-indigo-500">{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomDashboardTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`backdrop-blur-xl p-3 text-xs font-mono rounded-xl shadow-xl border ${
          isDarkMode ? 'bg-slate-950/85 border-white/10 text-white' : 'bg-white border-slate-250 text-slate-900'
        }`}>
          <p className={`font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: isDarkMode ? (item.color || '#fff') : (item.color === '#eaeaea' ? '#333' : item.color) }} className="my-0.5">
              {item.name}: <span className="font-semibold">{item.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="hr-metrics-visualizer" className={`relative backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(10,15,30,0.4)]' 
        : 'bg-white/70 border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
    }`}>
      {/* Visualizer header tabs */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b pb-4 ${
        isDarkMode ? 'border-white/10' : 'border-[#AAB9C2]/30'
      }`}>
        <div>
          <h3 className={`text-lg font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
            <Award className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-[#00b0d8]'}`} />
            Motor de Métricas de Calificación
          </h3>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
            Evalúe la alineación de habilidades, el rendimiento por agencia y las curvas de distribución al instante.
          </p>
        </div>

        {/* Tab Controls */}
        <div className={`flex p-0.5 rounded-xl border self-stretch sm:self-auto ${
          isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-slate-100 border-[#AAB9C2]/40'
        }`}>
          <button
            onClick={() => setActiveChartTab('individual')}
            className={`flex-1 sm:flex-none cursor-pointer text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'individual'
                ? isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-600/25 text-cyan-300 border border-cyan-500/30'
                  : 'bg-[#004a8f] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:text-[#004a8f] border border-transparent'
            }`}
          >
            Radar de Candidato
          </button>
          <button
            onClick={() => setActiveChartTab('distribution')}
            className={`flex-1 sm:flex-none cursor-pointer text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'distribution'
                ? isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-600/25 text-cyan-300 border border-cyan-500/30'
                  : 'bg-[#004a8f] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:text-[#004a8f] border border-transparent'
            }`}
          >
            Curva de Calificación
          </button>
          <button
            onClick={() => setActiveChartTab('agency')}
            className={`flex-1 sm:flex-none cursor-pointer text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
              activeChartTab === 'agency'
                ? isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-600/25 text-cyan-300 border border-cyan-500/30'
                  : 'bg-[#004a8f] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:text-[#004a8f] border border-transparent'
            }`}
          >
            Análisis de Agencias
          </button>
        </div>
      </div>

      {/* Responsive interactive chart container */}
      <div className="h-[28rem] relative w-full flex items-center justify-center">
        {/* TAB 1: Individual Applicant Radar */}
        {activeChartTab === 'individual' && (
          <div className="w-full h-full flex flex-col justify-between">
            {selectedApplicant ? (
              <>
                <div className="text-center mb-1">
                  <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-cyan-400 font-semibold' : 'text-cyan-600 font-bold'}`}>Atributos del Candidato Seleccionado</span>
                  <h4 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedApplicant.name} • {selectedApplicant.role}</h4>
                </div>
                <div className="flex-1 w-full min-h-0 text-slate-800">
                  <ResponsiveContainer width="100%" height="95%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentRadarData}>
                      <PolarGrid stroke={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"} />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 8 }} 
                      />
                      <Radar
                        name={selectedApplicant.name}
                        dataKey="value"
                        stroke={isDarkMode ? "#06b6d4" : "#0891b2"}
                        fill={isDarkMode ? "rgba(6, 182, 212, 0.2)" : "rgba(8, 145, 178, 0.15)"}
                        fillOpacity={0.65}
                      />
                      <Tooltip content={<CustomRadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className={`border rounded-xl p-2.5 text-center ${
                    isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-50 border-slate-200/50'
                  }`}>
                    <p className="text-[10px] text-slate-500 font-mono">TÉCNICO</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedApplicant.metrics.technical}%</p>
                  </div>
                  <div className={`border rounded-xl p-2.5 text-center ${
                    isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-50 border-slate-200/50'
                  }`}>
                    <p className="text-[10px] text-slate-500 font-mono">RESOLUCIÓN DE PROB.</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedApplicant.metrics.problemSolving}%</p>
                  </div>
                  <div className={`border rounded-xl p-2.5 text-center ${
                    isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-slate-50 border-slate-200/50'
                  }`}>
                    <p className="text-[10px] text-slate-500 font-mono">AJUSTE CULTURAL</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedApplicant.metrics.cultureFit}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed ${
                isDarkMode ? 'bg-slate-950/15 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <Users className="w-10 h-10 text-slate-500 mb-2.5 animate-pulse" />
                <p className={`text-sm font-semibold font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ningún Candidato Seleccionado</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Seleccione un candidato en la tabla para graficar su radar interactivo de aptitudes profesionales de forma inmediata.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Distribution Index Score Curve */}
        {activeChartTab === 'distribution' && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="text-center mb-3">
              <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Análisis de Volumen del Grupo</span>
              <h4 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Distribución de Índice del Promedio de Calificación</h4>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={getDistributionData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)"} />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#090d16' : '#ffffff', 
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      color: isDarkMode ? '#ffffff' : '#1e293b' 
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Candidatos" 
                    fill="url(#indigoCyanGrad)" 
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="indigoCyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDarkMode ? "#06b6d4" : "#0891b2"} />
                      <stop offset="100%" stopColor={isDarkMode ? "#4f46e5" : "#4338ca"} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-center text-slate-500 font-mono mt-1">
              Refleja que la mayoría de los candidatos filtrados se encuentran entre el umbral del 80% y 100%.
            </p>
          </div>
        )}

        {/* TAB 3: Agency Benchmarking Compare */}
        {activeChartTab === 'agency' && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="text-center mb-1">
              <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Indicadores de Socios</span>
              <h4 className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Métricas por Agencia y Tasa de Contratación</h4>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={agencyStats} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)"} />
                  <XAxis 
                    dataKey="agencyName" 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomDashboardTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 10 }}
                    verticalAlign="bottom"
                  />
                  <Bar 
                    dataKey="averageScore" 
                    name="Puntaje Promedio del Candidato %" 
                    fill="#3b82f6" 
                    opacity={isDarkMode ? 0.3 : 0.4} 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="placementRate" 
                    name="Tasa de Contratación %" 
                    fill="url(#glassGreenArea)" 
                    stroke={isDarkMode ? "#10b981" : "#059669"} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rejectionRate" 
                    name="Tasa de Rechazo Prematuro %" 
                    stroke="#f43f5e" 
                    strokeWidth={2} 
                    dot={{ fill: isDarkMode ? '#eaeaea' : '#e11d48' }}
                  />
                  <defs>
                    <linearGradient id="glassGreenArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-around text-center mt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Network className={`w-3 h-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span>Proveedor Principal: Nexus Talent</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <TrendingUp className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>Promedio Líder: Índice de 88.5%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
