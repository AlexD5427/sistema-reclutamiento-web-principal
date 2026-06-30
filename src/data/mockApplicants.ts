/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Applicant, AgencyStats } from '../types';

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "app-001",
    name: "Maya Lin",
    email: "maya.lin@nexus-talent.com",
    phone: "+1 (555) 234-5678",
    agency: "Nexus Talent",
    role: "Arquitecta Frontend Principal",
    status: "Shortlisted",
    metrics: {
      technical: 94,
      communication: 88,
      leadership: 85,
      cultureFit: 92,
      experience: 80,
      problemSolving: 90
    },
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "System Design", "Web Performance"],
    resumeSummary: "Líder de ingeniería frontend con más de 8 años de experiencia en la creación de sistemas de diseño visualmente impactantes y optimizados para rendimiento. Amplia trayectoria en mentoría de equipos multidisciplinarios de desarrollo y diseño UX.",
    notes: "Desempeño sobresaliente en el panel técnico en vivo. Demuestra un fuerte instinto de producto y defiende con pasión la accesibilidad (WCAG AA). Recomendada para una contratación inmediata como líder.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    experienceYears: 8,
    education: "Maestría en Desarrollo de Sistemas Web",
    expectedSalary: "$165,000 USD / año",
    updatedAt: "2026-06-08T14:30:00Z",
    timeline: [
      { id: "e1", stage: "Candidato Identificado", date: "2026-05-15", status: "completed", note: "Perfil extraído del portal de la API de Nexus Talent." },
      { id: "e2", stage: "Contacto Inicial de RH", date: "2026-05-18", status: "completed", note: "Entrevistada por socio de reclutamiento. Habilidades de comunicación excepcionales." },
      { id: "e3", stage: "Prueba Técnica para Llevar", date: "2026-05-24", status: "completed", note: "Entregó componentes de React elegantes y modulares. Construcción y validación perfectas." },
      { id: "e4", stage: "Entrevista de Panel de Arquitectura", date: "2026-06-02", status: "completed", note: "Diseñó una arquitectura de tablero en tiempo real de alta escala con optimización de tokens." },
      { id: "e5", stage: "Ajuste Cultural y de Liderazgo", date: "2026-06-08", status: "completed", note: "Muy alineada con nuestros principios de proactividad y responsabilidad." },
      { id: "e6", stage: "Revisión Ejecutiva", date: "2026-06-10", status: "current", note: "Pendiente de revisión de compensación y aprobación final." }
    ],
    institutionalId: "4857219-541-2026",
    capScore: 94,
    age: 28,
    departmentOfResidence: "La Paz",
    localityOfResidence: "Sopocachi",
    maritalStatus: "Soltero/a",
    degree: "Maestría en Desarrollo de Sistemas Web"
  },
  {
    id: "app-002",
    name: "Marcus Vance",
    email: "m.vance@apex-careers.org",
    phone: "+1 (555) 987-6543",
    agency: "Apex Careers",
    role: "Arquitecto de Soluciones Principal",
    status: "Interviewing",
    metrics: {
      technical: 98,
      communication: 76,
      leadership: 95,
      cultureFit: 84,
      experience: 96,
      problemSolving: 95
    },
    skills: ["Cloud Architecture", "PostgreSQL", "Go", "Docker", "Kubernetes", "Distributed Systems", "gRPC"],
    resumeSummary: "Arquitecto de sistemas y backend veterano con más de 14 años de experiencia en desarrollo de microservicios y proyectos de migración con cero tiempo de inactividad. Construyó plataformas de telemetría para gigantes de retail.",
    notes: "Experiencia profunda en ingeniería de sistemas. Comunicación sumamente directa y técnica, pero posee una compostura extraordinaria bajo presión. Sobresalió en consultas de sistemas distribuidos complejos.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    experienceYears: 14,
    education: "Doctorado en Computación de Alto Rendimiento",
    expectedSalary: "$195,000 USD / año",
    updatedAt: "2026-06-09T09:12:00Z",
    timeline: [
      { id: "e1", stage: "Identificado", date: "2026-05-28", status: "completed", note: "Localizado a través de la red de búsqueda ejecutiva de Apex." },
      { id: "e2", stage: "Entrevista de Sistemas", date: "2026-06-05", status: "completed", note: "Demostró una optimización impecable de índices de BD y arquitecturas de consultas." },
      { id: "e3", stage: "Sincronización de Liderazgo", date: "2026-06-09", status: "completed", note: "Alineado en las hojas de ruta de migración global a la nube." },
      { id: "e4", stage: "Mesa Redonda con Colaboradores", date: "2026-06-12", status: "upcoming", note: "Sesión final con líderes de alto rango." }
    ],
    institutionalId: "7219538-125-2026",
    capScore: 92,
    age: 39,
    departmentOfResidence: "Santa Cruz",
    localityOfResidence: "Equipetrol",
    maritalStatus: "Casado/a",
    degree: "Doctorado en Computación de Alto Rendimiento"
  },
  {
    id: "app-003",
    name: "Chloe Dupont",
    email: "chloe.dupont@quantumrecruiting.eu",
    phone: "+33 6 1234 5678",
    agency: "Quantum Recruiting",
    role: "Ingeniera Full Stack Senior",
    status: "Offered",
    metrics: {
      technical: 90,
      communication: 92,
      leadership: 80,
      cultureFit: 96,
      experience: 75,
      problemSolving: 88
    },
    skills: ["Node.js", "React", "Rust", "SQLite", "GraphQL", "WebSockets", "Vite"],
    resumeSummary: "Ingeniera dinámica especializada en interfaces en tiempo real, visualizaciones interactivas y protocolos de servicio veloces. Muy enfocada en crear experiencias cohesivas para desarrolladores (DX) y herramientas.",
    notes: "Candidata sumamente carismática. Mostró un juego multijugador de audio en tiempo real que construyó en su tiempo libre. Explica conceptos técnicos de forma sencilla. Todos en el equipo votaron por 'Contratar Fuertemente'.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    experienceYears: 6,
    education: "Maestría en Ingeniería de Software Multilenguaje",
    expectedSalary: "$145,000 USD / año",
    updatedAt: "2026-06-10T11:00:00Z",
    timeline: [
      { id: "e1", stage: "Identificada", date: "2026-05-12", status: "completed", note: "Referida por agente de Quantum Recruiting." },
      { id: "e2", stage: "Filtro Técnico", date: "2026-05-19", status: "completed", note: "Impresionó al panel con su conocimiento profundo en estándares web y seguridad." },
      { id: "e3", stage: "Panel Onsite", date: "2026-05-28", status: "completed", note: "Presentó un hermoso canvas de vidrio con diseños adaptables y precisos." },
      { id: "e4", stage: "Oferta Extendida", date: "2026-06-07", status: "completed", note: "Propuesta de compensación base + acciones enviada." },
      { id: "e5", stage: "Decisión de la Candidata", date: "2026-06-10", status: "current", note: "Revisando paquete de beneficios y reubicación. Señales preliminares positivas." }
    ],
    institutionalId: "8657498-125-2026",
    capScore: 89,
    age: 31,
    departmentOfResidence: "Cochabamba",
    localityOfResidence: "Cala Cala",
    maritalStatus: "Soltero/a",
    degree: "Maestría en Ingeniería de Software Multilenguaje"
  },
  {
    id: "app-004",
    name: "Elena Rostova",
    email: "elena.r@nexus-talent.com",
    phone: "+1 (555) 304-8971",
    agency: "Nexus Talent",
    role: "Gerente de Producto Técnico",
    status: "Shortlisted",
    metrics: {
      technical: 82,
      communication: 96,
      leadership: 92,
      cultureFit: 90,
      experience: 85,
      problemSolving: 85
    },
    skills: ["Product Roadmap", "SQL", "Agile", "User Analytics", "A/B Testing", "Figma", "SaaS Strategy"],
    resumeSummary: "Orquestadora enfocada en negocios, especializada en ciclo de vida de producto para portales seguros de desarrolladores con alto volumen de datos. Formuló pipelines analíticos que lograron un crecimiento del 32% en retención.",
    notes: "Sumamente orientada a métricas. La habilidad de Elena para comunicar requisitos técnicos a los clientes y lógica de negocios a los ingenieros es excelente. Sólidas bases técnicas (escribe respuestas SQL complejas y analiza trazas de TypeScript).",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    experienceYears: 9,
    education: "Maestría en Gestión y Estrategia de Productos",
    expectedSalary: "$150,000 USD / año",
    updatedAt: "2026-06-07T16:20:00Z",
    timeline: [
      { id: "e1", stage: "Identificada", date: "2026-05-20", status: "completed", note: "Localizada a través de la lista estratégica de Nexus Talent." },
      { id: "e2", stage: "Entrevista de Estrategia de Producto", date: "2026-05-27", status: "completed", note: "Realizó un análisis en vivo de nuestro tablero de telemetría de producto de manera estelar." },
      { id: "e3", stage: "Alineación de Colaboración de Ingeniería", date: "2026-06-03", status: "completed", note: "Demostró excelente empatía técnica y claridad en el desglose de tareas." },
      { id: "e4", stage: "Sesión Informativa Ejecutiva Final", date: "2026-06-07", status: "completed", note: "En espera de la asignación de presupuesto final para la división del portal en la nube." }
    ],
    institutionalId: "9518420-102-2026",
    capScore: 87,
    age: 34,
    departmentOfResidence: "Tarija",
    localityOfResidence: "San Roque",
    maritalStatus: "Casado/a",
    degree: "Maestría en Gestión y Estrategia de Productos"
  },
  {
    id: "app-005",
    name: "Rajesh Nair",
    email: "rajesh.nair@globalworkforce.co",
    phone: "+91 98 7654 3210",
    agency: "Global Workforce",
    role: "Ingeniero DevOps Senior",
    status: "New",
    metrics: {
      technical: 96,
      communication: 80,
      leadership: 74,
      cultureFit: 88,
      experience: 90,
      problemSolving: 92
    },
    skills: ["AWS", "Terraform", "CI/CD Platforms", "Python", "Monitoring", "ECS", "Serverless Architecture"],
    resumeSummary: "Ingeniero de nube empresarial con 10 años de experiencia en la implementación de infraestructura inmutable en la nube, secuencias de despliegue azul-verde y entornos de contenedores. Redujo gastos anuales en la nube un 22%.",
    notes: "El perfil contiene credenciales impresionantes. Excelentes paradigmas de infraestructura como código con una estructura limpia de Terraform. Llamada de diagnóstico programada para mañana o pasado.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    experienceYears: 10,
    education: "Licenciatura en Ingeniería de Sistemas y DevOps",
    expectedSalary: "$160,000 USD / año",
    updatedAt: "2026-06-10T14:45:00Z",
    timeline: [
      { id: "e1", stage: "Ingreso a Base de Datos", date: "2026-06-10", status: "completed", note: "Perfil sincronizado a través de la base de datos de la API segura de Global Workforce." },
      { id: "e2", stage: "Filtro Inicial Programado", date: "2026-06-11", status: "current", note: "Llamada inicial de verificación técnica programada." }
    ],
    institutionalId: "6541239-089-2026",
    capScore: 82,
    age: 29,
    departmentOfResidence: "Chuquisaca",
    localityOfResidence: "Sucre - Zona Central",
    maritalStatus: "Soltero/a",
    degree: "Licenciatura en Ingeniería de Sistemas y DevOps"
  },
  {
    id: "app-006",
    name: "Jordan Brooks",
    email: "jordan.b@apex-careers.org",
    phone: "+1 (555) 432-1098",
    agency: "Apex Careers",
    role: "Ingeniero de UI Creativo",
    status: "Screening",
    metrics: {
      technical: 88,
      communication: 85,
      leadership: 70,
      cultureFit: 94,
      experience: 75,
      problemSolving: 82
    },
    skills: ["Tailwind CSS", "React", "Framer Motion", "GSAP", "UI Prototyping", "WebGL", "Figma Design Systems"],
    resumeSummary: "Especialista en frontend interactivo enfocado en animaciones de alta fidelidad, microinteracciones, renderizado de canvas y frameworks modernos. Dedicado a construir interfaces que los usuarios puedan sentir antes que solo mirar.",
    notes: "Portafolio de diseño interactivo increíblemente impresionante. Demuestra dominio sobre sistemas visuales modernos, estética de vidrio líquido, curvas de movimiento y cambios de diseño. Perfil joven pero con un potencial tremendo.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    experienceYears: 5,
    education: "Licenciatura en Bellas Artes e Interfaces",
    expectedSalary: "$130,000 USD / año",
    updatedAt: "2026-06-05T10:15:00Z",
    timeline: [
      { id: "e1", stage: "Ingreso de Apex", date: "2026-06-01", status: "completed", note: "Localizado a través del portal creativo para artistas de Apex." },
      { id: "e2", stage: "Evaluación de Portafolio", date: "2026-06-04", status: "completed", note: "Calificación 10/10 para diseños de interfaces artísticas y robustas." },
      { id: "e3", stage: "Filtro de Cultura y Ajuste", date: "2026-06-08", status: "current", note: "Revisando estándares técnicos de ingeniería de diseño con el equipo." }
    ],
    institutionalId: "3251649-112-2026",
    capScore: 80,
    age: 25,
    departmentOfResidence: "Oruro",
    localityOfResidence: "Zona Sud",
    maritalStatus: "Soltero/a",
    degree: "Licenciatura en Bellas Artes e Interfaces"
  },
  {
    id: "app-007",
    name: "Sofia Chen",
    email: "s.chen@quantumrecruiting.eu",
    phone: "+1 (555) 762-3904",
    agency: "Quantum Recruiting",
    role: "Ingeniera de Infraestructura de Datos",
    status: "Rejected",
    metrics: {
      technical: 92,
      communication: 72,
      leadership: 68,
      cultureFit: 70,
      experience: 75,
      problemSolving: 86
    },
    skills: ["Apache Spark", "Python", "SQL", "Snowflake", "dbt", "Airflow", "Data Modeling"],
    resumeSummary: "Ingeniera de datos con experiencia especializada en construcción de pipelines ETL, escalamiento de almacenes de datos y modelado analítico de información. Implementó pipelines de Spark para millones de transacciones diarias.",
    notes: "Habilidades de modelado de bases de datos extremadamente sólidas, pero desafortunadamente las restricciones de zona horaria local y sus altas expectativas salariales ($220,000 USD) están fuera de los límites para este puesto. Manteniendo en archivo para futuras vacantes.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    experienceYears: 7,
    education: "Maestría en Ingeniería y Minería de Datos",
    expectedSalary: "$220,000 USD / año",
    updatedAt: "2026-06-09T17:00:00Z",
    timeline: [
      { id: "e1", stage: "Identificada", date: "2026-05-24", status: "completed", note: "Extraída a través del portal de reclutamiento de Quantum." },
      { id: "e2", stage: "Filtro Técnico", date: "2026-06-01", status: "completed", note: "Alta competencia analítica. Resolvió todas las consultas de modelado." },
      { id: "e3", stage: "Revisión Estratégica", date: "2026-06-09", status: "completed", note: "Rechazada debido a un desajuste crítico en las expectativas de presupuesto/salario." }
    ],
    institutionalId: "1284539-015-2026",
    capScore: 78,
    age: 35,
    departmentOfResidence: "Pando",
    localityOfResidence: "Cobija",
    maritalStatus: "Divorciado/a",
    degree: "Maestría en Ingeniería y Minería de Datos"
  }
];

export const AGENCY_STATS: AgencyStats[] = [
  {
    agencyName: "Nexus Talent",
    totalApplicants: 18,
    averageScore: 88.5,
    rejectionRate: 15,
    placementRate: 45
  },
  {
    agencyName: "Quantum Recruiting",
    totalApplicants: 14,
    averageScore: 84.0,
    rejectionRate: 20,
    placementRate: 35
  },
  {
    agencyName: "Apex Careers",
    totalApplicants: 12,
    averageScore: 86.2,
    rejectionRate: 18,
    placementRate: 40
  },
  {
    agencyName: "Global Workforce",
    totalApplicants: 9,
    averageScore: 81.3,
    rejectionRate: 25,
    placementRate: 28
  }
];
