/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Applicant, QualificationMetrics } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Scale, SlidersHorizontal, Plus, AlertCircle, Trash2, ArrowUpRight, Zap, RefreshCw, X, Check, ArrowLeftRight, ChevronDown, Sparkles, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, ArrowLeft, ArrowRight, Maximize2, Minimize2, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareSectionProps {
  applicants: Applicant[];
  isDarkMode?: boolean;
  onViewProfile?: (id: string) => void;
  isFullScreen?: boolean;
  setIsFullScreen?: (val: boolean) => void;
}

// -------------------------------------------------------------
// MATRIX REAL GOOGLE SHEETS SCHEMAS DEFINITIONS
// -------------------------------------------------------------
const MATRIX_SECTIONS = [
  {
    title: "RESULTADOS DE EVALUACIÓN",
    icon: "📊",
    rows: [
      { id: "capScore", label: "Nota CAP", type: "score" },
      { id: "discScore", label: "Perfil DISC", type: "score" },
      { id: "curriculumScore", label: "Nota Curriculum", type: "score" },
      { id: "knowledgeScore", label: "Nota Conocimientos", type: "score" },
      { id: "competencyScore", label: "Nota Competencias", type: "score" },
      { id: "leadershipCompetency", label: "Nota Competencias: Potencial de liderazgo", type: "score" },
      { id: "strategicCompetency", label: "Nota Competencias: Pensamiento estratégico", type: "score" },
      { id: "effectiveCommCompetency", label: "Nota Competencias: Comunicación efectiva", type: "score" }
    ]
  },
  {
    title: "CONOCIMIENTOS TÉCNICOS",
    icon: "⚙️",
    rows: [
      { id: "technicalKnowledgeLevel", label: "Nota de los conocimientos Solicitados", type: "level" }
    ]
  },
  {
    title: "MANEJO DE HERRAMIENTAS U OTROS, aplicaciones, ofimática, idiomas",
    icon: "🛠️",
    rows: [
      { id: "toolsHandlingLevel", label: "Nivel de dominio de herramientas", type: "level" }
    ]
  },
  {
    title: "CONFIABILIDAD E INTEGRIDAD",
    icon: "🛡️",
    rows: [
      { id: "reliabilityAndIntegrity", label: "Nivel General de Confiabilidad", type: "reliability" },
      { id: "integrityLevel", label: "Nivel de Integridad", type: "level" },
      { id: "theftRiskLevel", label: "Nivel de Robo", type: "risk" },
      { id: "lyingRiskLevel", label: "Nivel de Riesgo de Mentira", type: "risk" }
    ]
  },
  {
    title: "OBSERVACIONES (Extraer Etiquetas de la celda correspondiente)",
    icon: "📝",
    rows: [
      { id: "observations", label: "Etiquetas Extraídas", type: "tags" }
    ]
  }
];

// -------------------------------------------------------------
// COMPACT MOCK DATA FOR OFICIAL DE CRÉDITOS
// -------------------------------------------------------------
const CREDIT_MOCK_NAMES = [
  { id: 'ale-ruiz', name: 'Alejandro Ruiz', role: 'Oficial de Créditos Senior (Finanzas)', exp: 12, sal: '$9,500 USD/mes', technical: 96, problemSolving: 92, cultureFit: 94 },
  { id: 'gab-men', name: 'Gabriela Mendoza', role: 'Oficial de Créditos Microfinanzas', exp: 8, sal: '$8,800 USD/mes', technical: 94, problemSolving: 90, cultureFit: 88 },
  { id: 'san-vil', name: 'Sandra Villamil', role: 'Oficial de Créditos Pymes', exp: 10, sal: '$9,000 USD/mes', technical: 91, problemSolving: 89, cultureFit: 90 },
  { id: 'luc-ber', name: 'Lucía Bermúdez', role: 'Coordinadora de Riesgo Crediticio', exp: 7, sal: '$8,500 USD/mes', technical: 89, problemSolving: 88, cultureFit: 84 },
  { id: 'car-gut', name: 'Carlos Gutiérrez', role: 'Oficial de Créditos Corporativos', exp: 9, sal: '$8,200 USD/mes', technical: 85, problemSolving: 82, cultureFit: 86 },
  { id: 'dan-veg', name: 'Danilo Vega', role: 'Oficial de Créditos Agroindustriales', exp: 6, sal: '$7,800 USD/mes', technical: 84, problemSolving: 85, cultureFit: 88 },
  { id: 'mar-ort', name: 'Marcela Ortiz', role: 'Oficial de Créditos Senior Consumo', exp: 8, sal: '$8,000 USD/mes', technical: 82, problemSolving: 85, cultureFit: 92 },
  { id: 'pat-ala', name: 'Patricia Alarcón', role: 'Oficial Junior de Créditos PYME', exp: 5, sal: '$7,500 USD/mes', technical: 78, problemSolving: 80, cultureFit: 84 },
  { id: 'est-roj', name: 'Esteban Rojas', role: 'Analista de Créditos Junior', exp: 6, sal: '$7,200 USD/mes', technical: 75, problemSolving: 78, cultureFit: 80 },
  { id: 'rob-fra', name: 'Roberto Franco', role: 'Oficial de Créditos Recuperaciones', exp: 10, sal: '$8,500 USD/mes', technical: 68, problemSolving: 72, cultureFit: 72 },
  { id: 'mau-per', name: 'Mauricio Peralta', role: 'Analista de Crédito Consumo', exp: 4, sal: '$6,800 USD/mes', technical: 65, problemSolving: 70, cultureFit: 78 },
  { id: 'cam-tor', name: 'Camila Torres', role: 'Asistente de Créditos Micro PYME', exp: 3, sal: '$6,200 USD/mes', technical: 63, problemSolving: 65, cultureFit: 84 }
];

const CREDIT_MOCK_APPLICANTS: Applicant[] = CREDIT_MOCK_NAMES.map((n, i) => ({
  id: n.id,
  name: n.name,
  email: `${n.id.replace('-', '.')}@coop-credito.com`,
  phone: `+591 7${60 + i} 43210`,
  agency: i % 2 === 0 ? 'Nexus Talent' : 'Apex Careers',
  role: n.role,
  status: i < 4 ? 'Shortlisted' : (i < 8 ? 'Interviewing' : 'Screening'),
  metrics: {
    technical: n.technical,
    communication: 80 + (i % 3) * 5,
    leadership: 70 + (i % 4) * 6,
    cultureFit: n.cultureFit,
    experience: n.exp * 8,
    problemSolving: n.problemSolving
  },
  skills: ['Análisis de Riesgo', 'Evaluación', 'PYME'],
  resumeSummary: `Especialista en crédito y finanzas con ${n.exp} años de experiencia. Especialidad en gestión de carteras activas, colocación y control de mora de consumo y PYME.`,
  notes: '',
  avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 32154)}?auto=format&fit=crop&q=80&w=150`,
  experienceYears: n.exp,
  education: 'Licenciatura en Ingeniería Financiera / Finanzas',
  expectedSalary: n.sal,
  timeline: [],
  updatedAt: new Date().toISOString()
}));

const CREDIT_EVAL_PILLS: Record<string, Record<string, { risk: 'Alto' | 'Medio' | 'Bajo'; detail: string }>> = {
  'ale-ruiz': {
    dim1: { risk: 'Bajo', detail: '12 años administrando portafolios corporativos de hasta $15M con excelente salud.' },
    dim2: { risk: 'Bajo', detail: 'Superó las metas anuales entre 105% y 112% consecutivamente desde 2021.' },
    dim3: { risk: 'Bajo', detail: 'Incrementó de forma orgánica la cartera activa en un 22% interanual.' },
    dim4: { risk: 'Bajo', detail: 'Sobresaliente análisis cuantitativo de estados financieros y flujos proyectados.' },
    dim5: { risk: 'Bajo', detail: 'Mantuvo índice de mora (NPL) por debajo del 1.2% de forma consistente.' },
    dim6: { risk: 'Bajo', detail: 'Domina tableros BI y KPIs financieros semanales con alta precisión analítica.' },
    dim7: { risk: 'Bajo', detail: 'Lideró un equipo de 8 oficiales junior con metas del 100% cumplidas.' }
  },
  'gab-men': {
    dim1: { risk: 'Bajo', detail: 'Especialista en PYMEs agrícolas; cartera activa de 240 cuentas con baja mora.' },
    dim2: { risk: 'Bajo', detail: '98% de meta alcanzada en 2025 bajo condiciones complejas de mercado.' },
    dim3: { risk: 'Bajo', detail: 'Captó 55 nuevos clientes empresariales en el último periodo.' },
    dim4: { risk: 'Bajo', detail: 'Precisión milimétrica en cálculo de EBITDA y ratios de endeudamiento.' },
    dim5: { risk: 'Bajo', detail: 'Índice de mora histórico excelente de 1.5% en portafolios de consumo.' },
    dim6: { risk: 'Bajo', detail: 'Monitoreo automatizado de rentabilidad por cliente, optimizando la productividad.' },
    dim7: { risk: 'Medio', detail: 'Supervisó analistas de crédito de apoyo; formación técnica.' }
  },
  'san-vil': {
    dim1: { risk: 'Bajo', detail: 'Lidera actualmente cartera comercial de $8M con cero siniestros reportados.' },
    dim2: { risk: 'Bajo', detail: 'Consonante con metas corporativas; 108% de efectividad de desembolsos.' },
    dim3: { risk: 'Medio', detail: 'Incremento comercial del 10%; se mantuvo estable bajo volatilidad.' },
    dim4: { risk: 'Bajo', detail: 'Modelos predictivos de capacidad de pago aplicados con rigor técnico.' },
    dim5: { risk: 'Bajo', detail: 'Cero cartera vencida a más de 90 días; controles preventivos diarios.' },
    dim6: { risk: 'Bajo', detail: 'Toma de decisiones guiada por análisis de KPIs en tiempo real.' },
    dim7: { risk: 'Bajo', detail: 'Mentora de nuevos oficiales comerciales; incrementó la retención de personal.' }
  },
  'luc-ber': {
    dim1: { risk: 'Bajo', detail: 'Cartera actual de $12M en corporativos con rentabilidad neta del 18%.' },
    dim2: { risk: 'Bajo', detail: 'Alcanzó el 115% de colocación de cartera de crédito sindicado.' },
    dim3: { risk: 'Bajo', detail: 'Logró un crecimiento de cartera del 30% gracias a alianzas estratégicas.' },
    dim4: { risk: 'Bajo', detail: 'Especialista en estructuración de líneas de crédito multiactivos de alta complejidad.' },
    dim5: { risk: 'Bajo', detail: 'Efectividad de recuperación del 98.5% en créditos corporativos.' },
    dim6: { risk: 'Bajo', detail: 'Desarrolló indicador interno de rentabilidad de activos.' },
    dim7: { risk: 'Bajo', detail: 'Gerente interina con 15 personas a cargo; resultados impecables.' }
  },
  'car-gut': {
    dim1: { risk: 'Medio', detail: 'Experiencia sólida en banca corporativa, pero con transiciones frecuentes.' },
    dim2: { risk: 'Bajo', detail: 'Logró colocaciones récord de $4.5M en menos de 9 meses.' },
    dim3: { risk: 'Medio', detail: 'Crecimiento del 12% en volumen, alta dependencia de 3 grandes clientes.' },
    dim4: { risk: 'Bajo', detail: 'Analista crediticio sumamente riguroso, reduce provisiones.' },
    dim5: { risk: 'Medio', detail: 'Mora actual en 3.1%, dentro del límite pero con tendencia alcista.' },
    dim6: { risk: 'Bajo', detail: 'Uso avanzado de dashboards para detectar alertas tempranas de desviación.' },
    dim7: { risk: 'Medio', detail: 'Coordinó equipos en sucursales regionales de manera intermitente.' }
  },
  'dan-veg': {
    dim1: { risk: 'Bajo', detail: 'Administró cartera de $10M en sector manufactura con alta retención.' },
    dim2: { risk: 'Bajo', detail: '110% de meta comercial de colocación en sector servicios en 2025.' },
    dim3: { risk: 'Medio', detail: 'Crecimiento moderado del 8% enfocado en reestructuraciones eficaces.' },
    dim4: { risk: 'Medio', detail: 'Análisis de capacidad robusto, requiere afilar en créditos de gran escala.' },
    dim5: { risk: 'Bajo', detail: 'Mora controlada en 1.8% en sector agroindustrial.' },
    dim6: { risk: 'Bajo', detail: 'Sólido control de captaciones ligadas a desembolsos para balancear liquidez.' },
    dim7: { risk: 'Bajo', detail: 'Dirige equipo de 5 personas con rotación nula en 3 años.' }
  },
  'mar-ort': {
    dim1: { risk: 'Bajo', detail: 'Sólida base en microfinanzas; lideró portafolios de consumo con éxito.' },
    dim2: { risk: 'Medio', detail: 'Variación estacional: promedia el 92% de cumplimiento trimestral.' },
    dim3: { risk: 'Bajo', detail: 'Logró penetración de mercado de un 15% adicional en zona norte.' },
    dim4: { risk: 'Bajo', detail: 'Excelente estructuración de garantías reales y análisis de estrés financiero.' },
    dim5: { risk: 'Bajo', detail: 'Gestión proactiva que recuperó $450k en créditos previamente castigados.' },
    dim6: { risk: 'Medio', detail: 'Reportes estructurados mensuales; se beneficiaría de mayor frecuencia.' },
    dim7: { risk: 'Bajo', detail: 'Dirigió el comité de créditos de la sucursal con alto consenso.' }
  },
  'pat-ala': {
    dim1: { risk: 'Medio', detail: 'Enfoque principal en préstamos personales, requiere adaptación para corporativos.' },
    dim2: { risk: 'Bajo', detail: 'Cumplimiento sostenido del 104% en metas de crédito comercial.' },
    dim3: { risk: 'Bajo', detail: 'Incrementó la base de clientes PYME un 25% mediante referidos.' },
    dim4: { risk: 'Bajo', detail: 'Firme apego a las políticas de riesgo vigentes; dictámenes impecables.' },
    dim5: { risk: 'Medio', detail: 'Mora de 2.8% en cartera comercial, requiere seguimiento estrecho.' },
    dim6: { risk: 'Bajo', detail: 'Productividad comercial por encima del promedio de la sucursal.' },
    dim7: { risk: 'Medio', detail: 'Coordinó mesa de validación de garantías, capacidad de liderazgo sólida.' }
  },
  'est-roj': {
    dim1: { risk: 'Medio', detail: 'Cartera estable de $4M PYME, pero crecimiento lento en los últimos 2 años.' },
    dim2: { risk: 'Alto', detail: 'Cumplimiento del 82% debido a contracción de sector asignado.' },
    dim3: { risk: 'Bajo', detail: 'Apertura de 40 nuevas líneas de crédito comercial corporativo.' },
    dim4: { risk: 'Bajo', detail: 'Capacidad de análisis financiero avanzada de balances y pérdidas.' },
    dim5: { risk: 'Medio', detail: 'Mora en 2.5%; requiere optimizar estrategia de cobranza temprana.' },
    dim6: { risk: 'Bajo', detail: 'Monitoreo de indicadores de captación y reciprocidad.' },
    dim7: { risk: 'Medio', detail: 'Liderazgo de proyectos específicos; requiere más experiencia de mando.' }
  },
  'rob-fra': {
    dim1: { risk: 'Alto', detail: 'Cartera anterior mostró un incremento del 5% en créditos vencidos.' },
    dim2: { risk: 'Medio', detail: 'Nivel aceptable (94%) en metas de colocación de microcréditos.' },
    dim3: { risk: 'Bajo', detail: 'Exitoso plan de fidelización que aumentó el ticket promedio en 18%.' },
    dim4: { risk: 'Alto', detail: 'Reportes anteriores mostraron dos créditos aprobados con deudas.' },
    dim5: { risk: 'Alto', detail: 'Mora de 4.8% debido a deficiente acompañamiento post-desembolso.' },
    dim6: { risk: 'Medio', detail: 'Enfoque parcial en desembolsos, descuidando el balance de rentabilidad.' },
    dim7: { risk: 'Alto', detail: 'Reportes de clima laboral denotan fricciones en la gestión de personas.' }
  }
};

const PROCESSES_MAP = [
  {
    id: 'proc-oficial',
    title: 'Oficial de Créditos',
    department: 'Gerencia Financiera / Riesgo',
    agency: 'Agencia El Alto',
    isHighlighted: true,
    description: 'Evaluación y control de carteras PYME y corporativas, colocación de líneas mercantiles, auditoría de mora comercial y análisis de riesgo estructurado.',
    dimensions: [
      { id: 'dim1', name: 'Gestión y administración de cartera (clientes empresariales, PYME)' },
      { id: 'dim2', name: 'Meta de colocación alcanzada' },
      { id: 'dim3', name: 'Incremento de cartera o crecimiento comercial' },
      { id: 'dim4', name: 'Gestión de cartera y riesgo crediticio: evaluación crediticia, análisis de capacidad de pago' },
      { id: 'dim5', name: 'Meta de recuperación y/o mora' },
      { id: 'dim6', name: 'Monitorear indicadores de desempeño comercial (desembolsos, cartera activa, mora, captaciones, rentabilidad y productividad)' },
      { id: 'dim7', name: 'Supervisión de equipos' }
    ]
  },
  {
    id: 'proc-frontend',
    title: 'Arquitectura Frontend Lead',
    department: 'Ingeniería Web',
    agency: 'Agencia La Paz - Central',
    isHighlighted: false,
    description: 'Desarrollo de microestados interactivos, sistemas de diseño visualmente impactantes, animaciones Core Web Vitals en React.',
    dimensions: [
      { id: 'dim1', name: 'Alineación con sistemas de diseño y Figma tokens' },
      { id: 'dim2', name: 'Metas de entrega técnica de Core Web Vitals e inputs fluidos' },
      { id: 'dim3', name: 'Crecimiento comercial o reducción de deuda técnica en JSX' },
      { id: 'dim4', name: 'Análisis de estres de pruebas y performance con bundles pesados' },
      { id: 'dim5', name: 'Control de mora en parches o cuellos de botella de renderizado' },
      { id: 'dim6', name: 'Monitoreo de interfaces y animaciones de alta escala' },
      { id: 'dim7', name: 'Mentoría técnica y liderazgo de ingenieros de UI' }
    ]
  }
];

export default function CompareSection({ 
  applicants, 
  isDarkMode = true, 
  onViewProfile,
  isFullScreen: propIsFullScreen,
  setIsFullScreen: propSetIsFullScreen
}: CompareSectionProps) {
  // Mode selection: 'matrix' (Primary weight-based grid) vs 'radar' (Face-to-face Radar)
  const [activeModuleMode, setActiveModuleMode] = useState<'matrix' | 'radar'>('matrix');

  // Processes selection
  const [activeProcessId, setActiveProcessId] = useState<string>('proc-oficial');
  const activeProcess = useMemo(() => {
    return PROCESSES_MAP.find(p => p.id === activeProcessId) || PROCESSES_MAP[0];
  }, [activeProcessId]);

  // Dual mode radar selectors
  const [candidateAId, setCandidateAId] = useState<string>(applicants[0]?.id || 'app-001');
  const [candidateBId, setCandidateBId] = useState<string>(applicants[1]?.id || 'app-002');

  // Interactive custom Weights
  const [weights, setWeights] = useState({
    tech: 40,
    experience: 35,
    problemSolving: 25,
    cultureFit: 20,
    leadership: 15
  });

  // Manual selections
  const [manuallyAddedIds, setManuallyAddedIds] = useState<string[]>([]);
  
  // Helper to render customized graphical cells for Google Sheets applicants
  const renderCellValue = (cand: Applicant, rowId: string, rowType: string) => {
    if (rowType === "score") {
      const val = cand[rowId as keyof Applicant] as number | undefined;
      const score = val !== undefined ? val : 0;
      
      let colorClass = "";
      if (score >= 85) {
        colorClass = isDarkMode ? "text-emerald-400 font-bold" : "text-emerald-700 font-semibold";
      } else if (score >= 70) {
        colorClass = isDarkMode ? "text-amber-400 font-bold" : "text-amber-700 font-semibold";
      } else {
        colorClass = isDarkMode ? "text-rose-400 font-bold" : "text-rose-700 font-semibold";
      }

      return (
        <div className="flex flex-col items-center justify-center space-y-1 w-full py-1">
          <span className={`text-xs font-bold font-mono ${colorClass}`}>
            {score}%
          </span>
          <div className={`w-16 h-1 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      );
    }

    if (rowType === "level") {
      const strVal = cand[rowId as keyof Applicant] as string | undefined;
      const level = strVal || "Medio";
      
      let style = {
        bg: isDarkMode ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700",
        label: level
      };

      if (level === "Alto") {
        style = {
          bg: isDarkMode ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700",
          label: level
        };
      } else if (level === "Bajo") {
        style = {
          bg: isDarkMode ? "bg-rose-500/10 border-rose-500/25 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700",
          label: level
        };
      }

      return (
        <div className="flex justify-center w-full py-1">
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider font-extrabold ${style.bg}`}>
            {style.label}
          </span>
        </div>
      );
    }

    if (rowType === "reliability") {
      const strVal = cand[rowId as keyof Applicant] as string | undefined;
      const value = strVal || "Confiable";
      
      let style = {
        bg: isDarkMode ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700",
      };

      if (value === "No Confiable" || value === "Poco Confiable") {
        style = {
          bg: isDarkMode ? "bg-rose-500/10 border-rose-500/25 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700",
        };
      }

      return (
        <div className="flex justify-center w-full py-1">
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider font-extrabold ${style.bg}`}>
            {value}
          </span>
        </div>
      );
    }

    if (rowType === "risk") {
      const strVal = cand[rowId as keyof Applicant] as string | undefined;
      const risk = strVal || "Bajo";
      
      let style = {
        bg: isDarkMode ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700",
      };

      if (risk === "Alto") {
        style = {
          bg: isDarkMode ? "bg-rose-500/10 border-rose-500/25 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700",
        };
      } else if (risk === "Medio") {
        style = {
          bg: isDarkMode ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700",
        };
      }

      return (
        <div className="flex justify-center w-full py-1">
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider font-extrabold ${style.bg}`}>
            Riesgo {risk}
          </span>
        </div>
      );
    }

    if (rowType === "tags") {
      const list = cand[rowId as keyof Applicant] as string[] | undefined;
      const tags = list && list.length > 0 ? list : ["Evaluado"];
      
      return (
        <div className="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto py-1">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border truncate max-w-[120px] ${
                isDarkMode 
                  ? "bg-slate-900/50 border-white/5 text-cyan-400" 
                  : "bg-slate-50 border-slate-200 text-[#004a8f]"
              }`}
              title={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      );
    }

    return <span className="text-slate-400 font-mono">-</span>;
  };
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);
  const [isReorderEnabled, setIsReorderEnabled] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Full Screen States & Scroll Helpers
  const [localIsFullScreen, setLocalIsFullScreen] = useState(false);
  const isFullScreen = propIsFullScreen !== undefined ? propIsFullScreen : localIsFullScreen;
  const setIsFullScreen = propSetIsFullScreen || setLocalIsFullScreen;
  const fullScreenTableScrollRef = useRef<HTMLDivElement>(null);
  const [showFSLeftArrow, setShowFSLeftArrow] = useState(false);
  const [showFSRightArrow, setShowFSRightArrow] = useState(false);

  const checkFSScroll = () => {
    const el = fullScreenTableScrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowFSLeftArrow(scrollLeft > 5);
      setShowFSRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };



  // Quick close toast
  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Compile active candidates for selected process
  const processApplicants = useMemo(() => {
    return applicants;
  }, [applicants]);

  // Auto-populate manually added candidates once applicants load
  useEffect(() => {
    if (applicants && applicants.length > 0 && manuallyAddedIds.length === 0) {
      setManuallyAddedIds(applicants.slice(0, 4).map(a => a.id));
    }
  }, [applicants, manuallyAddedIds.length]);

  // Sync dual mode candidate selection with Google Sheet applicants
  useEffect(() => {
    if (applicants && applicants.length > 0) {
      if (!applicants.find(a => a.id === candidateAId)) {
        setCandidateAId(applicants[0].id);
      }
      if (!applicants.find(a => a.id === candidateBId) && applicants.length > 1) {
        setCandidateBId(applicants[1].id);
      }
    }
  }, [applicants, candidateAId, candidateBId]);

  // Compute calculated scores for each candidate
  const candidatesWithDynamicScores = useMemo(() => {
    const sumW = weights.tech + weights.experience + weights.problemSolving + weights.cultureFit + weights.leadership;
    const denominator = sumW === 0 ? 1 : sumW;

    return processApplicants.map(app => {
      // Map experience to a 1-100 metric
      const expMetric = Math.min(100, Math.max(30, app.experienceYears * 7 + 15));
      const calculatedScore = (
        app.metrics.technical * weights.tech +
        expMetric * weights.experience +
        app.metrics.problemSolving * weights.problemSolving +
        app.metrics.cultureFit * weights.cultureFit +
        app.metrics.leadership * weights.leadership
      ) / denominator;

      return {
        ...app,
        dynamicScore: Math.round(calculatedScore)
      };
    });
  }, [processApplicants, weights]);

  // Stable data helper functions
  const getInstitutionalId = (cand: Applicant) => {
    if (cand.institutionalId) return cand.institutionalId;
    let hash = 0;
    const str = cand.id + cand.name;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const part1 = Math.abs((hash * 127) % 9000000) + 1000000;
    const part2 = Math.abs((hash * 31) % 900) + 100;
    const part3 = 2026;
    return `${part1}-${part2}-${part3}`;
  };

  const getCandidateAge = (cand: Applicant) => {
    if (cand.age) return cand.age;
    let hash = 0;
    for (let i = 0; i < cand.id.length; i++) {
      hash += cand.id.charCodeAt(i);
    }
    return 23 + (hash % 15);
  };

  // Non-compared options (all candidates that can be added)
  const remainingCandidatesOptions = useMemo(() => {
    return candidatesWithDynamicScores.filter(c => !manuallyAddedIds.includes(c.id));
  }, [candidatesWithDynamicScores, manuallyAddedIds]);

  // Combined manual candidates in active columns in current custom dragging order
  const activeColumns = useMemo(() => {
    const result: typeof candidatesWithDynamicScores = [];
    manuallyAddedIds.forEach(id => {
      const match = candidatesWithDynamicScores.find(c => c.id === id);
      if (match) {
        result.push(match);
      }
    });
    return result;
  }, [manuallyAddedIds, candidatesWithDynamicScores]);

  useEffect(() => {
    const el = fullScreenTableScrollRef.current;
    if (el && isFullScreen) {
      checkFSScroll();
      const timer = setTimeout(checkFSScroll, 120);
      el.addEventListener('scroll', checkFSScroll);
      window.addEventListener('resize', checkFSScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkFSScroll);
        window.removeEventListener('resize', checkFSScroll);
      };
    }
  }, [activeColumns, isFullScreen]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set custom minimized preview
    const cand = activeColumns[index];
    if (cand) {
      const preview = document.getElementById(`drag-preview-${cand.id}`);
      if (preview) {
        // Center-offset the 180x62 card for the drag shadow
        e.dataTransfer.setDragImage(preview, 90, 31);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const nextIds = [...manuallyAddedIds];
    const [movedId] = nextIds.splice(draggedIndex, 1);
    nextIds.splice(targetIndex, 0, movedId);
    setManuallyAddedIds(nextIds);
    setDraggedIndex(null);
    setDragOverIndex(null);
    triggerToast(`🔄 Columnas reordenadas. El ranking se ha reajustado secuencialmente.`);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Helper to dynamically check table container horizontal scroll bounds
  const checkScroll = () => {
    const el = tableScrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = tableScrollRef.current;
    if (el) {
      checkScroll();
      // Wait slightly for any animations to settle
      const timer = setTimeout(checkScroll, 120);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [activeColumns, activeModuleMode]);

  // Handlers for manual additions
  const handleAddManualCandidate = (candidateId: string) => {
    if (manuallyAddedIds.includes(candidateId)) return;
    const candidate = candidatesWithDynamicScores.find(c => c.id === candidateId);
    if (candidate) {
      setManuallyAddedIds(prev => [...prev, candidateId]);
      triggerToast(`Sincronizado: ${candidate.name} agregado a la matriz comparativa.`);
    }
  };

  const handleRemoveManualCandidate = (candidateId: string) => {
    setManuallyAddedIds(prev => prev.filter(id => id !== candidateId));
  };

  // Grid background colors for Risk level cells
  const getRiskStyle = (risk: 'Alto' | 'Medio' | 'Bajo') => {
    switch (risk) {
      case 'Bajo':
        return {
          bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
          border: isDarkMode ? 'border-emerald-500/25' : 'border-emerald-100',
          text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700',
          pill: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'Medio':
        return {
          bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
          border: isDarkMode ? 'border-amber-500/25' : 'border-amber-100',
          text: isDarkMode ? 'text-amber-400' : 'text-amber-700',
          pill: 'bg-amber-500/20 text-amber-300'
        };
      case 'Alto':
        return {
          bg: isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50',
          border: isDarkMode ? 'border-rose-500/25' : 'border-rose-100',
          text: isDarkMode ? 'text-rose-400' : 'text-rose-700',
          pill: 'bg-rose-500/20 text-rose-300'
        };
    }
  };

  // Overlapping radar helper
  const oldRadarData = useMemo(() => {
    const candidateA = applicants.find(a => a.id === candidateAId) || applicants[0];
    const candidateB = applicants.find(a => a.id === candidateBId) || applicants[1];
    if (!candidateA || !candidateB) return [];
    return [
      { subject: 'Técnico', A: candidateA.metrics.technical, B: candidateB.metrics.technical },
      { subject: 'Comunicación', A: candidateA.metrics.communication, B: candidateB.metrics.communication },
      { subject: 'Liderazgo', A: candidateA.metrics.leadership, B: candidateB.metrics.leadership },
      { subject: 'Ajuste Cultural', A: candidateA.metrics.cultureFit, B: candidateB.metrics.cultureFit },
      { subject: 'Experiencia', A: candidateA.metrics.experience, B: candidateB.metrics.experience },
      { subject: 'Resolución Prov.', A: candidateA.metrics.problemSolving, B: candidateB.metrics.problemSolving },
    ];
  }, [applicants, candidateAId, candidateBId]);

  // Dynamic risk helper for columns
  const fetchRiskAndDetail = (candidateId: string, dimId: string) => {
    if (activeProcessId === 'proc-oficial' && CREDIT_EVAL_PILLS[candidateId]) {
      return CREDIT_EVAL_PILLS[candidateId][dimId] || { risk: 'Medio', detail: 'Evaluación de control estándar bajo revisión operativa.' };
    }
    // dynamic fallback calculation to support standard applicants
    const hash = (candidateId.charCodeAt(0) || 0) + (dimId.charCodeAt(3) || 5);
    const mockRisks: ('Bajo' | 'Medio' | 'Alto')[] = ['Bajo', 'Medio', 'Bajo', 'Medio', 'Alto'];
    const r = mockRisks[hash % mockRisks.length];
    const details = [
      'Trayectoria probada con bajo nivel de incidencias operativas destacable.',
      'Sujeto a controles estándar del departamento financiero trimestrales.',
      'Presenta alineación teórica fuerte; pendiente validación práctica de campo KPI.',
      'Requiere inducción inicial para homologación de flujos de capacidad de pago.'
    ];
    return {
      risk: r,
      detail: details[hash % details.length]
    };
  };

  return (
    <div className={`relative backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(10,15,30,0.4)]' 
        : 'bg-white/70 border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
    }`}>

      {/* Minimized Drag Previews (Hidden off-screen, used by HTML5 e.dataTransfer.setDragImage) */}
      <div className="fixed left-[-9999px] top-[-9999px] z-50 pointer-events-none">
        {activeColumns.map((cand) => (
          <div 
            key={`drag-preview-${cand.id}`} 
            id={`drag-preview-${cand.id}`} 
            className={`p-3 rounded-2xl border flex items-center gap-3 shadow-2xl ${
              isDarkMode 
                ? 'bg-[#0f172a] border-cyan-500/40 text-white shadow-cyan-500/20' 
                : 'bg-white border-[#004a8f]/30 text-[#004a8f] shadow-lg'
            }`}
            style={{ width: '180px', height: '62px' }}
          >
            <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-bold text-xs uppercase shrink-0 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900/60 border border-cyan-500/30 text-cyan-300' 
                : 'bg-gradient-to-b from-slate-50 to-indigo-50/20 border border-[#004a8f]/30 text-[#004a8f]'
            }`}>
              <span className="text-[10px] tracking-tight leading-none">{cand.capScore || cand.dynamicScore || 85}%</span>
              <span className="text-[5.5px] font-sans font-black tracking-wider uppercase opacity-80" style={{ fontSize: '5px' }}>CAP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] truncate leading-tight">{cand.name}</p>
              <p className="text-[8.5px] font-mono text-slate-500 truncate leading-none mt-1">{cand.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING STATUS TOAST */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] max-w-sm p-4 rounded-xl border shadow-xl bg-slate-900 border-indigo-500/30 text-white font-mono text-xs flex gap-3 items-start"
          >
            <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Notificación Táctica</p>
              <p className="text-slate-300 mt-0.5">{toastNotification}</p>
            </div>
            <button onClick={() => setToastNotification(null)} className="ml-auto text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION WITH DUAL MODE SWITCH */}
      {!isFullScreen && (
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b ${
          isDarkMode ? 'border-white/10' : 'border-[#AAB9C2]/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#004a8f]'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-semibold tracking-wide flex items-center flex-wrap gap-2 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                Matriz Comparativa de Talentos
                <span className={`text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded-md border ${
                  isDarkMode ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#005baa]'
                }`}>
                  Puntajes & Análisis de Riesgo
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
                Evaluación tridimensional cruzada de factores de riesgo, ponderación inteligente 1-100 y sincronización automática.
              </p>
            </div>
          </div>

          {/* MODAL TABS TOGGLE */}
          <div className={`flex p-0.5 rounded-xl border self-start lg:self-center ${
            isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-slate-100 border-[#AAB9C2]/40'
          }`}>
            <button
              onClick={() => setActiveModuleMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeModuleMode === 'matrix'
                  ? isDarkMode ? 'bg-indigo-500 text-white shadow-md' : 'bg-[#004a8f] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Matriz de Alineación
            </button>
            <button
              onClick={() => setActiveModuleMode('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeModuleMode === 'radar'
                  ? isDarkMode ? 'bg-indigo-500 text-white shadow-md' : 'bg-[#004a8f] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Radar Cara a Cara
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* VIEW 1: INTERACTIVE SELECTION MATRIX & WEIGHT COMPILER */}
        {activeModuleMode === 'matrix' && (
          <motion.div
            key="matrix-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {!isFullScreen && (
              <>
                {/* 1. PROCESS SELECTOR ROW CARDS */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 tracking-wider">
                    Seleccione el Proceso a Evaluar:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROCESSES_MAP.map(p => {
                  const isSel = p.id === activeProcessId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProcessId(p.id);
                        setManuallyAddedIds([]);
                        triggerToast(`Proceso cambiado: ${p.title}. Cargando dimensiones específicas de la posición.`);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${
                        isSel 
                          ? isDarkMode 
                            ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                            : 'bg-[#004a8f]/5 border-[#004a8f]/40 shadow-sm'
                          : isDarkMode 
                            ? 'bg-white/5 hover:bg-white/10 border-white/5'
                            : 'bg-white border-slate-200/60 hover:bg-slate-50'
                      }`}
                    >
                      {isSel && (
                        <span className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${isDarkMode ? 'bg-indigo-500' : 'bg-[#004a8f]'}`} />
                      )}
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold ${isSel ? isDarkMode ? 'text-indigo-400' : 'text-[#004a8f]' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {p.title}
                        </p>
                        {p.isHighlighted && (
                          <span className="text-[7.5px] font-mono leading-none tracking-wide bg-pink-500/20 text-pink-300 px-1 py-0.5 rounded border border-pink-500/20 uppercase font-semibold">
                            Modelo Oficial
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.department}</p>
                      <p className="text-[10px] leading-relaxed text-slate-500 line-clamp-2 mt-1.5 font-sans">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. CONTROL CENTER FOR SELECTION & DRAG-AND-DROP */}
            <div className={`p-4 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-950/60 border-white/5 shadow-lg shadow-indigo-500/5' 
                : 'bg-white border-[#AAB9C2]/40 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 mb-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(170,185,194,0.3)' }}>
                <div className="leading-tight">
                  <h4 className={`text-xs font-mono font-semibold uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                    Consola de Comparación y Reordenamiento Libre
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Habilite la selección manual y reordene columnas arrastrando con el ratón. El orden que defina determinará la jerarquía del ranking.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* CHECKLIST TOGGLE BUTTON */}
                  <button
                    onClick={() => {
                      setIsChecklistOpen(p => !p);
                      triggerToast(isChecklistOpen ? "Panel de selección colapsado." : "Panel de selección desplegado.");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2 transition-all cursor-pointer border ${
                      isChecklistOpen
                        ? isDarkMode ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-[#004a8f]/10 border-[#004a8f] text-[#004a8f] font-bold'
                        : isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isChecklistOpen ? 'Ocultar Panel Selección' : 'Mostrar Panel Selección'} ({manuallyAddedIds.length})
                  </button>

                  {/* DRAG & DROP TOGGLE BUTTON */}
                  <button
                    onClick={() => {
                      setIsReorderEnabled(p => !p);
                      triggerToast(isReorderEnabled ? "Reordenamiento manual bloqueado." : "Reordenamiento libre activo: Haz clic y arrastra las cabeceras de columnas!");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2 transition-all cursor-pointer border ${
                      isReorderEnabled
                        ? isDarkMode ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse' : 'bg-[#00b0d8]/15 border-[#00b0d8] text-[#005baa] font-bold'
                        : isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    {isReorderEnabled ? 'Desactivar Drag & Drop' : 'Activar Drag & Drop'}
                  </button>
                </div>
              </div>

              {/* INTEGRATED CANDIDATES CHECKLIST DRAWER */}
              <AnimatePresence>
                {isChecklistOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-3 rounded-lg border mb-3 ${isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200/60 font-medium'}`}>
                      <p className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                        <span>Listado de Candidatos Disponibles del Proceso:</span>
                        <span className="text-slate-400">({candidatesWithDynamicScores.length} en total)</span>
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                        {candidatesWithDynamicScores.map(cand => {
                          const isChecked = manuallyAddedIds.includes(cand.id);
                          return (
                            <label
                              key={cand.id}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                isChecked
                                  ? isDarkMode 
                                    ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 border-indigo-500/40 text-white' 
                                    : 'bg-[#004a8f]/5 border-[#004a8f]/40 text-[#004a8f] font-semibold'
                                  : isDarkMode 
                                    ? 'bg-slate-900/40 hover:bg-slate-900 border-white/5 text-slate-400 hover:text-slate-205 hover:text-slate-200' 
                                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    handleRemoveManualCandidate(cand.id);
                                  } else {
                                    handleAddManualCandidate(cand.id);
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer pointer-events-auto"
                              />
                              <div className="truncate flex-1">
                                <p className="font-semibold text-[11px] truncate flex items-center justify-between gap-1">
                                  <span>{cand.name}</span>
                                  <span className={`text-[8.5px] font-bold px-1 py-0.5 rounded ${
                                    isDarkMode ? 'bg-slate-800 text-cyan-300' : 'bg-[#00b0d8]/10 text-[#004a8f]'
                                  }`}>
                                    {cand.capScore || cand.dynamicScore}%
                                  </span>
                                </p>
                                <p className="text-[8.5px] font-mono text-slate-500 truncate mt-0.5">
                                  {cand.departmentOfResidence || 'La Paz'} • {cand.degree?.split(' ')[0] || 'Lic.'}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTIVE BULLET NOTICE ABOUT DND */}
              {isReorderEnabled && activeColumns.length > 0 && (
                <div className={`p-2 rounded-lg border font-mono text-[9px] flex items-center gap-2 animate-pulse ${
                  isDarkMode ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#004a8f]'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>MODO ORDENACIÓN LIBRE ACTIVO: Arrastre los perfiles de la tabla por su cabecera con el ratón de izquierda a derecha para alternar su posición del ranking.</span>
                </div>
              )}
            </div>
          </>
        )}

            {/* Empty State Notification or Compare Elements */}
            {activeColumns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center space-y-4 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950/40 border-dashed border-white/10 shadow-[inner_0_0_24px_rgba(99,102,241,0.03)]' 
                    : 'bg-slate-50 border-dashed border-slate-300/85'
                }`}
              >
                <div className={`p-4 rounded-full border ${
                  isDarkMode 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.15)]' 
                    : 'bg-white border-[#004a8f]/20 text-[#004a8f]'
                }`}>
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <div className="max-w-md space-y-2">
                  <h4 className={`text-base font-bold font-sans tracking-wide ${isDarkMode ? 'text-slate-100' : 'text-[#004a8f]'}`}>
                    Comparador Vacío - Iniciar Selección
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Para iniciar el análisis comparativo técnico de Oficiales de Créditos, seleccione candidatos en el checklist superior o use estos accesos directos rápidos:
                  </p>
                </div>

                {/* FAST ACCESS DIRECT SHORTCUT CHELF */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl pt-2">
                  {candidatesWithDynamicScores.slice(0, 3).map(cand => (
                    <button
                      key={cand.id}
                      onClick={() => handleAddManualCandidate(cand.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 cursor-pointer hover:scale-102 transition-all ${
                        isDarkMode
                          ? 'bg-slate-900 border-white/5 hover:border-indigo-500/30'
                          : 'bg-white border-slate-200 shadow-sm hover:border-[#004a8f]/40'
                      }`}
                    >
                      <div className={`p-1 text-[11px] font-bold font-mono rounded ${
                        isDarkMode ? 'bg-slate-800 text-cyan-300' : 'bg-[#00b0d8]/10 text-[#004a8f]'
                      }`}>
                        {cand.capScore || cand.dynamicScore}%
                      </div>
                      <div className="truncate flex-1">
                        <p className={`font-semibold text-xs truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{cand.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{cand.role}</p>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded select-none shrink-0">+ Añadir</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* BAR CHART OVERVIEW PREVIEW */}
                {!isFullScreen && (
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/20 border-white/5' : 'bg-white border-[#AAB9C2]/35 shadow-sm'} h-44`}>
                    <p className="text-[9px] font-mono uppercase text-slate-500 mb-2">Desempeño Comparado de Puntuación Táctica</p>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={activeColumns} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 8, fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: isDarkMode ? '#090e1a' : '#ffffff', 
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#AAB9C2', 
                            borderRadius: 8 
                          }}
                          labelStyle={{ color: isDarkMode ? '#94a3b8' : '#004a8f', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
                          itemStyle={{ color: '#005baa', fontSize: 10 }}
                        />
                        <Bar 
                          dataKey="dynamicScore" 
                          fill="url(#indigoCyanGrad)" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                        <defs>
                          <linearGradient id="indigoCyanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#004a8f" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#00b0d8" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

              {/* MATRIX SCROLLABLE OUTER */}
              <div className="relative group/table">
                {/* Horizontal scroll controller navigation buttons */}
                <AnimatePresence>
                  {showLeftArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        if (tableScrollRef.current) {
                          tableScrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
                        }
                      }}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full border shadow-xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50' 
                          : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                      }`}
                      title="Desplazar perfiles a la izquierda"
                    >
                      <ArrowLeft className="w-5 h-5 pointer-events-none" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showRightArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        if (tableScrollRef.current) {
                          tableScrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
                        }
                      }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full border shadow-xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50' 
                          : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                      }`}
                      title="Desplazar perfiles a la derecha"
                    >
                      <ArrowRight className="w-5 h-5 pointer-events-none" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div 
                  ref={tableScrollRef}
                  className={`overflow-auto rounded-xl border shadow-lg mask-scrollbar transition-all duration-300 ${
                    isFullScreen ? 'h-[calc(100vh-270px)] max-h-none' : 'max-h-[640px]'
                  } ${
                    isDarkMode ? 'border-white/10 bg-slate-950/40' : 'border-[#AAB9C2]/45 bg-white'
                  }`}
                >
                  <table className="w-full border-separate border-spacing-0 text-left text-xs min-w-[900px] relative">
                    {/* Column Group Headers */}
                    <thead>
                      <tr style={{ height: '142px' }} className={`border-b ${isDarkMode ? 'bg-slate-950/80 border-white/5 text-slate-400' : 'bg-slate-50 border-[#AAB9C2]/30 text-[#647786]'}`}>
                        <th className={`p-4 uppercase font-mono text-[10px] w-72 leading-tight sticky top-0 left-0 z-30 transition-all duration-300 ${
                          isDarkMode ? 'bg-[#0c1322] border-white/5' : 'bg-slate-100 border-[#AAB9C2]/30'
                        }`}>
                          Perfil del Postulante
                        </th>
                        <AnimatePresence>
                          {activeColumns.map((cand, i) => {
                            const instId = getInstitutionalId(cand);
                            const cap = cand.capScore || cand.dynamicScore || 85;
                            const isBeingDragged = draggedIndex === i;
                            const isDragOver = dragOverIndex === i;
                            
                            let shiftX = 0;
                            if (draggedIndex !== null && dragOverIndex !== null) {
                              if (dragOverIndex < draggedIndex) {
                                if (i >= dragOverIndex && i < draggedIndex) {
                                  shiftX = 215; // Shift right to make space
                                }
                              } else if (dragOverIndex > draggedIndex) {
                                if (i <= dragOverIndex && i > draggedIndex) {
                                  shiftX = -215; // Shift left to make space
                                }
                              }
                            }

                            return (
                              <motion.th 
                                key={cand.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                draggable={isReorderEnabled}
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDragOver={(e) => handleDragOver(e, i)}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragEnd={handleDragEnd}
                                className={`p-2 text-center border-l relative sticky top-0 z-20 ${
                                  isReorderEnabled ? 'cursor-move select-none hover:bg-indigo-500/5' : ''
                                } ${
                                  isDarkMode ? 'border-white/5 bg-[#090e1a]' : 'border-[#AAB9C2]/25 bg-white'
                                }`}
                                style={{ 
                                  transform: shiftX ? `translateX(${shiftX}px)` : 'none', 
                                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out, background-color 0.3s',
                                  opacity: isBeingDragged ? 0.3 : 1
                                }}
                              >
                                {/* Interactive Insertion Slot Indicator Line */}
                                {draggedIndex !== null && dragOverIndex === i && draggedIndex !== i && (
                                  <div 
                                    className={`absolute top-0 bottom-0 w-1.5 z-30 pointer-events-none bg-gradient-to-b from-cyan-400 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse ${
                                      dragOverIndex < draggedIndex ? 'left-0' : 'right-0'
                                    }`} 
                                  />
                                )}

                                <div 
                                  onClick={() => onViewProfile?.(cand.id)}
                                  title="Ver Perfil Completo"
                                  className="relative p-3.5 rounded-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group flex flex-col items-center overflow-hidden w-full select-none"
                                >
                                  {/* Sliding gradient outline glow behind on group hover */}
                                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#004a8f] via-[#00b0d8] to-[#005baa] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 p-[1.5px] bg-[length:200%_auto] animate-gradient-slow">
                                    <div className={`w-full h-full rounded-[10px] ${isDarkMode ? 'bg-[#0c1322]' : 'bg-white'}`} />
                                  </div>
                                  
                                  {/* Subtle shadow glow on select / hover */}
                                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_4px_25px_rgba(0,176,216,0.18)] -z-20 pointer-events-none" />

                                  {/* Positional Rank & Identifier Identifier Badge */}
                                  <span className="text-[10px] font-mono font-bold text-white bg-gradient-to-r from-[#004a8f] via-[#005baa] to-[#00b0d8] px-2.5 py-0.5 rounded-full shadow-md z-10 border border-white/20 whitespace-nowrap">
                                    Rank #{i+1} • {instId}
                                  </span>

                                  {/* Circular Custom Suitability CAP Score gauge (replaces avatar) */}
                                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border shadow-inner mt-4 mb-2.5 transition-all duration-300 group-hover:scale-105 ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border-cyan-500/35 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-slate-950' 
                                      : 'bg-gradient-to-b from-slate-50 to-indigo-50/20 border-[#004a8f]/35 text-[#004a8f] shadow-[0_2px_8px_rgba(0,74,143,0.05)] bg-slate-50'
                                  }`}>
                                    <span className="text-[14px] font-black font-mono tracking-tight leading-none">{cap}%</span>
                                    <span className="text-[7.5px] font-sans uppercase font-extrabold tracking-wider mt-0.5 text-slate-400 dark:text-cyan-400/80" style={{ fontSize: '6px' }}>CAP</span>
                                  </div>

                                  {/* Full Name + Age label */}
                                  <p className={`font-bold tracking-wide text-xs transition-colors duration-300 break-words line-clamp-2 max-w-[170px] text-center px-1 leading-tight h-8 flex items-center justify-center ${
                                    isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-[#004a8f] group-hover:text-[#005baa]'
                                  }`}>
                                    {cand.name}, {getCandidateAge(cand)}.
                                  </p>
                                  
                                  <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tight truncate max-w-[150px]">
                                    {cand.role}
                                  </p>

                                  {/* dense demographics metadata segment */}
                                  <div className="flex flex-col w-full space-y-1 mt-2.5 pt-2 text-[9.5px] font-sans border-t border-slate-200/45 dark:border-white/5 text-left text-slate-500 dark:text-slate-400">
                                    <div className="flex justify-between w-full">
                                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Dep. Residencia:</span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]" title={cand.departmentOfResidence || 'La Paz'}>
                                        {cand.departmentOfResidence || 'La Paz'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Localidad:</span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]" title={cand.localityOfResidence || 'Zona Sopocachi'}>
                                        {cand.localityOfResidence || 'Zona Sopocachi'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-full">
                                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Estado Civil:</span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {cand.maritalStatus || 'Soltero/a'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col w-full pt-1 border-t border-slate-100 dark:border-white/5">
                                      <span className="font-mono text-[7px] uppercase tracking-wider text-slate-400 text-center">Grado Académico:</span>
                                      <span className="font-medium text-slate-800 dark:text-slate-200 italic line-clamp-1 text-center mt-0.5 text-[9px] truncate" title={cand.degree || cand.education || 'Licenciatura'}>
                                        {cand.degree || cand.education || 'Licenciatura'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Pair of action buttons to remove or view profile */}
                                  <div className="flex w-full gap-2 mt-4 z-10">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveManualCandidate(cand.id);
                                        triggerToast(`Quitado: ${cand.name} fue retirado de la matriz.`);
                                      }}
                                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-mono transition-all border duration-200 cursor-pointer ${
                                        isDarkMode
                                          ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400'
                                          : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/80 hover:border-rose-300 shadow-sm'
                                      }`}
                                      title="Quitar este candidato de la matriz comparativa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                      <span>Quitar</span>
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onViewProfile?.(cand.id);
                                      }}
                                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-mono transition-all border duration-200 cursor-pointer ${
                                        isDarkMode
                                          ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 font-bold'
                                          : 'bg-[#004a8f]/5 border-[#004a8f]/20 text-[#004a8f] hover:bg-[#004a8f]/10 hover:border-[#004a8f]/30 font-bold shadow-sm'
                                      }`}
                                      title="Ver perfil completo del candidato"
                                    >
                                      <Eye className="w-3.5 h-3.5 shrink-0" />
                                      <span>Perfil</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.th>
                            );
                          })}
                        </AnimatePresence>
                      </tr>
                    </thead>

                    <tbody>
                      {MATRIX_SECTIONS.map((section, sIdx) => (
                        <React.Fragment key={`sec-${sIdx}`}>
                          {/* Segment Header Row */}
                          <tr className={isDarkMode ? 'bg-slate-900/60' : 'bg-slate-100/70'}>
                            <td 
                              colSpan={activeColumns.length + 1} 
                              className={`p-3 px-4 font-mono text-[9px] uppercase tracking-widest font-extrabold sticky left-0 z-10 border-b transition-all duration-300 ${
                                isDarkMode ? 'text-cyan-400 bg-[#0c1322] border-white/5' : 'text-[#004a8f] bg-slate-150 border-[#AAB9C2]/20'
                              }`}
                            >
                              <span className="mr-1.5">{section.icon}</span> {section.title}
                            </td>
                          </tr>

                          {/* Detail Field Rows */}
                          {section.rows.map((row, rIdx) => (
                            <tr 
                              key={`${section.title}-${row.id}`} 
                              className={`border-b transition-colors ${
                                rIdx % 2 === 0 
                                  ? isDarkMode ? 'bg-slate-950/10' : 'bg-slate-50/20' 
                                  : ''
                              } ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-[#AAB9C2]/20 hover:bg-slate-50'}`}
                            >
                              {/* Row metadata header sticky left */}
                              <td className={`p-3 font-medium leading-relaxed max-w-[280px] sticky left-0 z-10 border-r transition-all duration-300 ${
                                isDarkMode 
                                  ? rIdx % 2 === 0 ? 'bg-[#0c1322] border-white/5' : 'bg-slate-950 border-white/5'
                                  : rIdx % 2 === 0 ? 'bg-slate-50 border-[#AAB9C2]/20 text-slate-800 font-semibold' : 'bg-white border-[#AAB9C2]/20 text-slate-800 font-semibold'
                              }`}>
                                <div className="flex gap-2">
                                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">{rIdx + 1}.</span>
                                  <div className="leading-normal">
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Candidate values cells with reorder animation support */}
                              <AnimatePresence>
                                {activeColumns.map((cand, i) => {
                                  const isBeingDragged = draggedIndex === i;
                                  let shiftX = 0;
                                  if (draggedIndex !== null && dragOverIndex !== null) {
                                    if (dragOverIndex < draggedIndex) {
                                      if (i >= dragOverIndex && i < draggedIndex) {
                                        shiftX = 215;
                                      }
                                    } else if (dragOverIndex > draggedIndex) {
                                      if (i <= dragOverIndex && i > draggedIndex) {
                                        shiftX = -215;
                                      }
                                    }
                                  }

                                  return (
                                    <motion.td 
                                      key={cand.id} 
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                      onDragOver={(e) => isReorderEnabled && handleDragOver(e, i)}
                                      onDrop={(e) => isReorderEnabled && handleDrop(e, i)}
                                      className={`p-3 text-center border-l max-w-[210px] align-middle relative ${
                                        isDarkMode ? 'border-white/5' : 'border-[#AAB9C2]/20'
                                      }`}
                                      style={{ 
                                        transform: shiftX ? `translateX(${shiftX}px)` : 'none', 
                                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out, background-color 0.3s',
                                        opacity: isBeingDragged ? 0.35 : 1
                                      }}
                                    >
                                      {renderCellValue(cand, row.id, row.type)}
                                    </motion.td>
                                  );
                                })}
                              </AnimatePresence>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ANIMATED FULL-SCREEN TOGGLE BUTTON - BOTTOM LEFT */}
                <div className="absolute bottom-4 left-4 z-40">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: isDarkMode ? '0 0 20px rgba(6,182,212,0.35)' : '0 4px 15px rgba(0,74,143,0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsFullScreen(true);
                      triggerToast("Vista de pantalla completa activada.");
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-[11px] font-extrabold border shadow-xl cursor-pointer transition-all duration-300 backdrop-blur-md ${
                      isDarkMode 
                        ? 'bg-slate-900/95 text-cyan-400 border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:text-cyan-300 hover:border-cyan-400' 
                        : 'bg-white/95 text-[#004a8f] border-[#004a8f]/30 hover:border-[#004a8f] shadow-[#004a8f]/5'
                    }`}
                    title="Maximizar Tabla a Pantalla Completa"
                  >
                    <Maximize2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>PANTALLA COMPLETA</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        {/* VIEW 2: ORIGINAL RADAR FOCUS COMPARISON FEATURE */}
        {activeModuleMode === 'radar' && (
          <motion.div
            key="radar-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Selectors grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-[#647786]'}`}>Candidato Alfa</label>
                <select
                  id="compare-candidate-a-select"
                  value={candidateAId}
                  onChange={(e) => setCandidateAId(e.target.value)}
                  className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer appearance-none transition-colors border ${
                    isDarkMode 
                      ? 'text-cyan-300 bg-slate-950/45 border-cyan-500/20 focus:border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.05)]' 
                      : 'text-[#004a8f] bg-white border-[#AAB9C2] focus:border-[#004a8f] shadow-sm font-semibold'
                  }`}
                >
                  {processApplicants.map(app => (
                    <option 
                      key={app.id} 
                      value={app.id} 
                      disabled={app.id === candidateBId}
                      className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}
                    >
                      {app.name} ({app.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-[#647786]'}`}>Candidato Beta</label>
                <select
                  id="compare-candidate-b-select"
                  value={candidateBId}
                  onChange={(e) => setCandidateBId(e.target.value)}
                  className={`w-full text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer appearance-none transition-colors border ${
                    isDarkMode 
                      ? 'text-pink-300 bg-slate-950/45 border-pink-500/20 focus:border-pink-400/50 shadow-[0_0_12px_rgba(244,63,94,0.05)]' 
                      : 'text-[#00AB4E] bg-white border-[#AAB9C2] focus:border-[#00AB4E] shadow-sm font-semibold'
                  }`}
                >
                  {processApplicants.map(app => (
                    <option 
                      key={app.id} 
                      value={app.id} 
                      disabled={app.id === candidateAId}
                      className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-850 text-slate-800"}
                    >
                      {app.name} ({app.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Radar overlapping charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 h-[20rem] flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={oldRadarData}>
                    <PolarGrid stroke={isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 9, fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                      angle={45} 
                      domain={[0, 100]} 
                      tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 7 }} 
                    />
                    <Radar
                      name="Alfa"
                      dataKey="A"
                      stroke={isDarkMode ? "#06b6d4" : "#004a8f"}
                      fill={isDarkMode ? "rgba(6, 182, 212, 0.12)" : "rgba(0, 74, 143, 0.1)"}
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Beta"
                      dataKey="B"
                      stroke={isDarkMode ? "#ec4899" : "#00AB4E"}
                      fill={isDarkMode ? "rgba(236, 72, 153, 0.12)" : "rgba(0, 171, 78, 0.1)"}
                      fillOpacity={0.5}
                    />
                    <Legend tick={{ fill: isDarkMode ? '#64748b' : '#647786', fontSize: 9 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Stat rows for face to face compare */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className={`grid grid-cols-3 text-center text-[10px] font-mono pb-2 border-b ${
                  isDarkMode ? 'border-white/10 text-slate-400' : 'border-[#AAB9C2]/40 text-[#647786]'
                }`}>
                  <span>METRICAS ANALÍTICAS</span>
                  <span className={`${isDarkMode ? 'text-cyan-400' : 'text-[#004a8f]'} font-bold truncate`}>Alfa</span>
                  <span className={`${isDarkMode ? 'text-pink-400' : 'text-[#00AB4E]'} font-bold truncate`}>Beta</span>
                </div>

                {[
                  { label: 'Habilidad Técnico-Operativa', key: 'technical' },
                  { label: 'Resolución de Problemas', key: 'problemSolving' },
                  { label: 'Estilo de Comunicación', key: 'communication' },
                  { label: 'Instinto de Liderazgo', key: 'leadership' },
                  { label: 'Ajuste Cultural Activo', key: 'cultureFit' },
                ].map(row => {
                  const valA = (processApplicants.find(a => a.id === candidateAId) || processApplicants[0])?.metrics[row.key as keyof QualificationMetrics] || 0;
                  const valB = (processApplicants.find(a => a.id === candidateBId) || processApplicants[1])?.metrics[row.key as keyof QualificationMetrics] || 0;
                  const isAGreater = valA >= valB;
                  const isBGreater = valB >= valA;
                  return (
                    <div key={row.key} className={`grid grid-cols-3 items-center text-center py-1.5 border-b last:border-0 rounded-lg px-2 transition-colors ${
                      isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <span className={`text-[11px] font-medium text-left ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</span>
                      <span className={`text-xs font-mono font-bold ${
                        isAGreater 
                          ? isDarkMode ? 'text-cyan-400 font-extrabold' : 'text-[#004a8f] font-extrabold' 
                          : 'text-slate-500'
                      }`}>{valA}%</span>
                      <span className={`text-xs font-mono font-bold ${
                        isBGreater 
                          ? isDarkMode ? 'text-pink-400 font-extrabold' : 'text-[#00AB4E] font-extrabold' 
                          : 'text-slate-500'
                      }`}>{valB}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT FULL-SCREEN MODAL OVERLAY */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed inset-0 z-[999] flex flex-col p-0 overflow-hidden ${
              isDarkMode 
                ? 'bg-[#060913] text-slate-100' 
                : 'bg-white text-slate-800'
            }`}
          >
            {/* FULL-SCREEN GLASS BACKGROUND BLOBS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
              <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />
              <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            {/* HEADER BAR */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-5 pb-4 mb-0 border-b ${
              isDarkMode ? 'border-white/10' : 'border-[#AAB9C2]/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#004a8f]'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm md:text-base font-black tracking-wider uppercase flex items-center flex-wrap gap-2 ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                    MATRIZ COMPARATIVA DE CANDIDATOS
                    <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border bg-cyan-500/15 border-cyan-500/25 text-cyan-300">
                      {activeProcess.agency} • {activeProcess.title}
                    </span>
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-500">
                    Notas e indicadores de evaluación, conocimientos, competencias y observaciones presentadas por postulante
                  </p>
                </div>
              </div>

              {/* ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Drag and Drop interactive state */}
                <button
                  onClick={() => setIsReorderEnabled(!isReorderEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono leading-none border transition-all cursor-pointer ${
                    isReorderEnabled
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                      : isDarkMode
                        ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                        : 'bg-white border-slate-300 text-slate-600 hover:text-slate-800'
                  }`}
                  title="Permitir o deshabilitar reordenamiento arrastrando columnas"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Configuración: {isReorderEnabled ? 'Reordenamiento Sí' : 'Reordenamiento No'}</span>
                </button>

                {/* Minimizer Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsFullScreen(false);
                    triggerToast("Retornando a la vista de panel estándar.");
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-black border tracking-wider cursor-pointer shadow-lg transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-slate-900 border-rose-500/30 text-rose-400 hover:bg-rose-505 hover:border-rose-405'
                      : 'bg-white border-rose-400 text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>CERRAR PANTALLA COMPLETA</span>
                </motion.button>
              </div>
            </div>

            {/* FULL SCREEN MATRIX SCROLLABLE OUTER */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col group/fstable">
              {/* Horizontal scroll controller navigation buttons */}
              <AnimatePresence>
                {showFSLeftArrow && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      if (fullScreenTableScrollRef.current) {
                        fullScreenTableScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
                      }
                    }}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full border shadow-2xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50 shadow-cyan-500/10' 
                        : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                    }`}
                    title="Desplazar perfiles a la izquierda"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showFSRightArrow && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      if (fullScreenTableScrollRef.current) {
                        fullScreenTableScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
                      }
                    }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full border shadow-2xl hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-slate-900/95 border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50 shadow-cyan-500/10' 
                        : 'bg-white/95 border-[#AAB9C2] text-[#004a8f] shadow-lg hover:bg-slate-50 hover:border-[#004a8f]'
                    }`}
                    title="Desplazar perfiles a la derecha"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <div 
                ref={fullScreenTableScrollRef}
                className={`overflow-auto flex-1 mask-scrollbar h-full w-full transition-all duration-300 relative ${
                  isDarkMode ? 'border-white/10 bg-[#070b14]' : 'border-[#AAB9C2]/45 bg-white'
                }`}
              >
                <table className="w-full min-h-full border-separate border-spacing-0 text-left text-xs min-w-[950px] relative">
                  {/* Column Group Headers */}
                  <thead>
                    <tr style={{ height: '142px' }} className={`border-b ${isDarkMode ? 'bg-[#090e1a] border-white/5 text-slate-400' : 'bg-slate-50 border-[#AAB9C2]/30 text-[#647786]'}`}>
                      <th className={`p-4 uppercase font-mono text-[10px] w-72 leading-tight sticky top-0 left-0 z-30 transition-all duration-300 ${
                        isDarkMode ? 'bg-[#090e1a] border-white/5' : 'bg-slate-100 border-[#AAB9C2]/30'
                      }`}>
                        Perfil del Postulante
                      </th>
                      <AnimatePresence>
                        {activeColumns.map((cand, i) => {
                          const instId = getInstitutionalId(cand);
                          const cap = cand.capScore || cand.dynamicScore || 85;
                          const isBeingDragged = draggedIndex === i;
                          const isDragOver = dragOverIndex === i;
                          
                          let shiftX = 0;
                          if (draggedIndex !== null && dragOverIndex !== null) {
                            if (dragOverIndex < draggedIndex) {
                              if (i >= dragOverIndex && i < draggedIndex) {
                                shiftX = 235; // Shift right to make space (full screen col is slightly wider)
                              }
                            } else if (dragOverIndex > draggedIndex) {
                              if (i <= dragOverIndex && i > draggedIndex) {
                                shiftX = -235; // Shift left to make space
                              }
                            }
                          }

                          return (
                            <motion.th 
                              key={cand.id} 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 320, damping: 28 }}
                              draggable={isReorderEnabled}
                              onDragStart={(e) => handleDragStart(e, i)}
                              onDragOver={(e) => handleDragOver(e, i)}
                              onDrop={(e) => handleDrop(e, i)}
                              onDragEnd={handleDragEnd}
                              className={`p-2 text-center border-l relative sticky top-0 z-20 ${
                                isReorderEnabled ? 'cursor-move select-none hover:bg-indigo-500/5' : ''
                              } ${
                                isDarkMode ? 'border-white/5 bg-[#0c1322]' : 'border-[#AAB9C2]/25 bg-white'
                              }`}
                              style={{ 
                                transform: shiftX ? `translateX(${shiftX}px)` : 'none', 
                                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out, background-color 0.3s',
                                opacity: isBeingDragged ? 0.3 : 1
                              }}
                            >
                              {/* Interactive Insertion Slot Indicator Line */}
                              {draggedIndex !== null && dragOverIndex === i && draggedIndex !== i && (
                                <div 
                                  className={`absolute top-0 bottom-0 w-1.5 z-30 pointer-events-none bg-gradient-to-b from-cyan-400 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse ${
                                    dragOverIndex < draggedIndex ? 'left-0' : 'right-0'
                                  }`} 
                                />
                              )}

                              <div 
                                onClick={() => {
                                  onViewProfile?.(cand.id);
                                  setIsFullScreen(false);
                                }}
                                title="Ver Perfil Completo"
                                className="relative p-3.5 rounded-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group flex flex-col items-center overflow-hidden w-full select-none"
                              >
                                {/* Sliding gradient outline glow behind on group hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#004a8f] via-[#00b0d8] to-[#005baa] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 p-[1.5px] bg-[length:200%_auto] animate-gradient-slow">
                                  <div className={`w-full h-full rounded-[10px] ${isDarkMode ? 'bg-[#0c1322]' : 'bg-white'}`} />
                                </div>
                                
                                {/* Subtle shadow glow on select / hover */}
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_4px_25px_rgba(0,176,216,0.18)] -z-20 pointer-events-none" />

                                {/* Positional Rank & Identifier Badge */}
                                <span className="text-[10px] font-mono font-bold text-white bg-gradient-to-r from-[#004a8f] via-[#005baa] to-[#00b0d8] px-2.5 py-0.5 rounded-full shadow-md z-10 border border-white/20 whitespace-nowrap">
                                  Rank #{i+1} • {instId}
                                </span>

                                {/* Circular Custom Suitability CAP Score gauge */}
                                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border shadow-inner mt-4 mb-2.5 transition-all duration-300 group-hover:scale-105 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border-cyan-500/35 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-slate-950' 
                                    : 'bg-gradient-to-b from-slate-50 to-indigo-50/20 border-[#004a8f]/35 text-[#004a8f] shadow-[0_2px_8px_rgba(0,74,143,0.05)] bg-slate-50'
                                }`}>
                                  <span className="text-[14px] font-black font-mono tracking-tight leading-none">{cap}%</span>
                                  <span className="text-[7.5px] font-sans uppercase font-extrabold tracking-wider mt-0.5 text-slate-400 dark:text-cyan-400/80" style={{ fontSize: '6px' }}>CAP</span>
                                </div>

                                {/* Full Name + Age label */}
                                <p className={`font-bold tracking-wide text-xs transition-colors duration-300 break-words line-clamp-2 max-w-[170px] text-center px-1 leading-tight h-8 flex items-center justify-center ${
                                  isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-[#004a8f] group-hover:text-[#005baa]'
                                }`}>
                                  {cand.name}, {getCandidateAge(cand)}.
                                </p>
                                
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-tight truncate max-w-[150px]">
                                  {cand.role}
                                </p>

                                {/* demographics metadata */}
                                <div className="flex flex-col w-full space-y-1 mt-2.5 pt-2 text-[9.5px] font-sans border-t border-slate-200/45 dark:border-white/5 text-left text-slate-500 dark:text-slate-400">
                                  <div className="flex justify-between w-full">
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Dep. Residencia:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]" title={cand.departmentOfResidence || 'La Paz'}>
                                      {cand.departmentOfResidence || 'La Paz'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Localidad:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[95px]" title={cand.localityOfResidence || 'Zona Sopocachi'}>
                                      {cand.localityOfResidence || 'Zona Sopocachi'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">Estado Civil:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                      {cand.maritalStatus || 'Soltero/a'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col w-full pt-1 border-t border-slate-100 dark:border-white/5">
                                    <span className="font-mono text-[7px] uppercase tracking-wider text-slate-400 text-center">Grado Académico:</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 italic line-clamp-1 text-center mt-0.5 text-[9px] truncate" title={cand.degree || cand.education || 'Licenciatura'}>
                                      {cand.degree || cand.education || 'Licenciatura'}
                                    </span>
                                  </div>
                                </div>

                                {/* Pair of action buttons to remove or view profile */}
                                <div className="flex w-full gap-2 mt-4 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveManualCandidate(cand.id);
                                      triggerToast(`Quitado: ${cand.name} fue retirado de la matriz.`);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-mono transition-all border duration-200 cursor-pointer ${
                                      isDarkMode
                                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400'
                                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/80 hover:border-rose-300 shadow-sm'
                                    }`}
                                    title="Quitar este candidato de la matriz comparativa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Quitar</span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewProfile?.(cand.id);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-mono transition-all border duration-200 cursor-pointer ${
                                      isDarkMode
                                        ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 font-bold'
                                        : 'bg-[#004a8f]/5 border-[#004a8f]/20 text-[#004a8f] hover:bg-[#004a8f]/10 hover:border-[#004a8f]/30 font-bold shadow-sm'
                                    }`}
                                    title="Ver perfil completo"
                                  >
                                    <Eye className="w-3.5 h-3.5 shrink-0" />
                                    <span>Perfil</span>
                                  </button>
                                </div>
                              </div>
                            </motion.th>
                          );
                        })}
                      </AnimatePresence>
                    </tr>
                  </thead>

                  <tbody>
                    {MATRIX_SECTIONS.map((section, sIdx) => (
                      <React.Fragment key={`sec-fs-${sIdx}`}>
                        {/* Segment Header Row */}
                        <tr className={isDarkMode ? 'bg-slate-900/60' : 'bg-slate-100/70'}>
                          <td 
                            colSpan={activeColumns.length + 1} 
                            className={`p-3 px-4 font-mono text-[9px] uppercase tracking-widest font-extrabold sticky left-0 z-10 border-b transition-all duration-300 ${
                              isDarkMode ? 'text-cyan-400 bg-[#090e1a] border-white/5' : 'text-[#004a8f] bg-slate-100 border-[#AAB9C2]/20'
                            }`}
                          >
                            <span className="mr-1.5">{section.icon}</span> {section.title}
                          </td>
                        </tr>

                        {/* Detail Field Rows */}
                        {section.rows.map((row, rIdx) => (
                          <tr 
                            key={`fs-${section.title}-${row.id}`} 
                            className={`border-b transition-colors ${
                              rIdx % 2 === 0 
                                ? isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/20' 
                                : ''
                            } ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-[#AAB9C2]/20 hover:bg-slate-50'}`}
                          >
                            {/* Row metadata header sticky left */}
                            <td className={`p-3 font-medium leading-relaxed max-w-[280px] sticky left-0 z-10 border-r transition-all duration-300 ${
                              isDarkMode 
                                ? rIdx % 2 === 0 ? 'bg-[#0c1322] border-white/5' : 'bg-slate-950 border-white/5'
                                : rIdx % 2 === 0 ? 'bg-slate-50 border-[#AAB9C2]/20 text-slate-800 font-semibold' : 'bg-white border-[#AAB9C2]/20 text-slate-800 font-semibold'
                            }`}>
                              <div className="flex gap-2">
                                <span className="text-[10px] font-mono text-slate-500 mt-0.5">{rIdx + 1}.</span>
                                <div className="leading-normal">
                                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</p>
                                </div>
                              </div>
                            </td>

                            {/* Candidate values cells with reorder animation support */}
                            <AnimatePresence>
                              {activeColumns.map((cand, i) => {
                                const isBeingDragged = draggedIndex === i;
                                let shiftX = 0;
                                if (draggedIndex !== null && dragOverIndex !== null) {
                                  if (dragOverIndex < draggedIndex) {
                                    if (i >= dragOverIndex && i < draggedIndex) {
                                      shiftX = 235; // FS is wider
                                    }
                                  } else if (dragOverIndex > draggedIndex) {
                                    if (i <= dragOverIndex && i > draggedIndex) {
                                      shiftX = -235;
                                    }
                                  }
                                }

                                return (
                                  <motion.td 
                                    key={cand.id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                    onDragOver={(e) => isReorderEnabled && handleDragOver(e, i)}
                                    onDrop={(e) => isReorderEnabled && handleDrop(e, i)}
                                    className={`p-3 text-center border-l max-w-[240px] align-middle relative ${
                                      isDarkMode ? 'border-white/5' : 'border-[#AAB9C2]/20'
                                    }`}
                                    style={{ 
                                      transform: shiftX ? `translateX(${shiftX}px)` : 'none', 
                                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out, background-color 0.3s',
                                      opacity: isBeingDragged ? 0.35 : 1
                                    }}
                                  >
                                    {renderCellValue(cand, row.id, row.type)}
                                  </motion.td>
                                );
                              })}
                            </AnimatePresence>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
