/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QualificationMetrics {
  technical: number;       // 1 - 100
  communication: number;   // 1 - 100
  leadership: number;      // 1 - 100
  cultureFit: number;      // 1 - 100
  experience: number;      // 1 - 100
  problemSolving: number;  // 1 - 100
}

export interface TimelineEvent {
  id: string;
  stage: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
  note: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  role: string;
  status: 'New' | 'Screening' | 'Interviewing' | 'Shortlisted' | 'Offered' | 'Archived' | 'Rejected';
  metrics: QualificationMetrics;
  skills: string[];
  resumeSummary: string;
  notes: string;
  avatarUrl?: string;
  experienceYears: number;
  education: string;
  expectedSalary: string;
  timeline: TimelineEvent[];
  updatedAt: string;
  institutionalId?: string;
  capScore?: number;
  age?: number;
  departmentOfResidence?: string;
  localityOfResidence?: string;
  maritalStatus?: string;
  degree?: string;
  formacion_academica?: string;
  nivel_academico?: string;
  carrera?: string;
  trabaja_bdp?: string;
  cargo_bdp?: string;
  discScore?: number | string;
  curriculumScore?: number;
  knowledgeScore?: number;
  competencyScore?: number;
  leadershipCompetency?: number;
  strategicCompetency?: number;
  effectiveCommCompetency?: number;
  technicalKnowledgeLevel?: 'Bajo' | 'Medio' | 'Alto';
  toolsHandlingLevel?: 'Bajo' | 'Medio' | 'Alto';
  reliabilityAndIntegrity?: string;
  integrityLevel?: 'Bajo' | 'Medio' | 'Alto';
  theftRiskLevel?: 'Bajo' | 'Medio' | 'Alto';
  lyingRiskLevel?: 'Bajo' | 'Medio' | 'Alto';
  observations?: string[];
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  conocimientos_tecnicos?: any;
  herramientas_otros?: HerramientaOtro[];
  competencias_habilidades?: CompetenciaHabilidad[];
  herramientas?: any;
  competencias?: any;
  nivel_general_confiabilidad?: string;
  nivel_integridad?: string;
  riesgo_robo?: string;
  riesgo_mentira?: string;
  observaciones?: any;
}

export interface ConocimientoTecnico {
  nombre: string;
  nivel: string;
  detalle?: string;
}

export interface HerramientaOtro {
  nombre: string;
  nivel: string;
}

export interface CompetenciaHabilidad {
  nombre?: string;
  competencia?: string;
  porcentaje: number;
}

export interface AgencyStats {
  agencyName: string;
  totalApplicants: number;
  averageScore: number;
  rejectionRate: number;
  placementRate: number;
}

export interface HiringProcess {
  id: string;
  title: string;
  targetRoles: string[];
  agency: string;
  department: string;
  description: string;
  targetHires: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'On Hold' | 'Completed';
  openDate: string;
}
