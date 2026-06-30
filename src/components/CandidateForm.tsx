/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Applicant, QualificationMetrics } from '../types';
import { X, User, ShieldAlert, Sparkles, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CandidateFormProps {
  onClose: () => void;
  onSubmit: (candidate: Applicant) => void;
  applicantToEdit?: Applicant | null;
  isDarkMode?: boolean;
}

export default function CandidateForm({
  onClose,
  onSubmit,
  applicantToEdit,
  isDarkMode = true,
}: CandidateFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [agency, setAgency] = useState('Nexus Talent');
  const [experienceYears, setExperienceYears] = useState(5);
  const [education, setEducation] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('$130,000 / year');
  const [skillsText, setSkillsText] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  
  // Qualification sliders metrics state
  const [technical, setTechnical] = useState(80);
  const [communication, setCommunication] = useState(80);
  const [leadership, setLeadership] = useState(80);
  const [cultureFit, setCultureFit] = useState(80);
  const [experience, setExperience] = useState(80);
  const [problemSolving, setProblemSolving] = useState(80);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (applicantToEdit) {
      setName(applicantToEdit.name);
      setEmail(applicantToEdit.email);
      setPhone(applicantToEdit.phone);
      setRole(applicantToEdit.role);
      setAgency(applicantToEdit.agency);
      setExperienceYears(applicantToEdit.experienceYears);
      setEducation(applicantToEdit.education);
      setExpectedSalary(applicantToEdit.expectedSalary);
      setSkillsText(applicantToEdit.skills.join(', '));
      setResumeSummary(applicantToEdit.resumeSummary);
      
      // Sliders matching metrics
      setTechnical(applicantToEdit.metrics.technical);
      setCommunication(applicantToEdit.metrics.communication);
      setLeadership(applicantToEdit.metrics.leadership);
      setCultureFit(applicantToEdit.metrics.cultureFit);
      setExperience(applicantToEdit.metrics.experience);
      setProblemSolving(applicantToEdit.metrics.problemSolving);
    }
  }, [applicantToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      setErrorMsg("El nombre, correo electrónico y puesto de interés son campos obligatorios.");
      return;
    }
    setErrorMsg(null);

    const skillsArray = skillsText
      ? skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Product', 'Engineering'];

    const submittedData: Applicant = {
      id: applicantToEdit?.id || `app-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone: phone || "+1 (555) 234-9988",
      agency,
      role,
      status: applicantToEdit?.status || 'New',
      metrics: {
        technical,
        communication,
        leadership,
        cultureFit,
        experience,
        problemSolving
      },
      skills: skillsArray,
      resumeSummary: resumeSummary || "Profesional altamente calificado con sólida experiencia presentada por la agencia socia.",
      notes: applicantToEdit?.notes || "Sin notas de entrevista agregadas aún.",
      experienceYears: Number(experienceYears),
      education: education || "Licenciatura en Ciencias de la Computación",
      expectedSalary,
      timeline: applicantToEdit?.timeline || [
        { 
          id: `t-${Date.now()}`, 
          stage: "Ingreso de Perfil", 
          date: new Date().toISOString().split('T')[0], 
          status: "completed", 
          note: `Extraído automáticamente. Se generó la puntuación inicial.` 
        }
      ],
      updatedAt: new Date().toISOString(),
    };

    onSubmit(submittedData);
  };

  return (
    <div className={`fixed inset-0 z-[100] overflow-y-auto backdrop-blur-sm flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950/70' : 'bg-slate-900/40'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-2xl border rounded-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'backdrop-blur-2xl bg-slate-900/40 border-white/20 shadow-[0_12px_45px_rgba(0,0,0,0.5)]' 
            : 'backdrop-blur-xl bg-white border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
        }`}
      >
        {/* Form header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <User className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h3 className={`text-base font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {applicantToEdit ? 'Ajustar Calificaciones e Indicadores' : 'Registrar Nuevo Perfil de Candidato'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Nombre Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juana Pérez"
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Puesto de Interés *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Desarrollador React Senior"
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Correo Electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juanita.perez@agencia.com"
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Agencia de Origen</label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none cursor-pointer focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10 shadow-sm'
                }`}
              >
                <option value="Nexus Talent" className={isDarkMode ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>Nexus Talent</option>
                <option value="Quantum Recruiting" className={isDarkMode ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>Quantum Recruiting</option>
                <option value="Apex Careers" className={isDarkMode ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>Apex Careers</option>
                <option value="Global Workforce" className={isDarkMode ? "bg-slate-950 text-slate-200" : "bg-white text-slate-800"}>Global Workforce</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Años de Experiencia</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                min={0}
                max={30}
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Pretensión Salarial</label>
              <input
                type="text"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="$140,000 / año"
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
            <div>
              <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Grado del Título Académico</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Ingeniería en Tecnologías de la Información"
                className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                  isDarkMode 
                    ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                    : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Tecnologías Clave (Separadas por comas)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, TypeScript, AWS, CI/CD, Go"
              className={`w-full text-xs rounded-xl px-4.5 py-3 outline-none focus:ring-1 transition-all ${
                isDarkMode 
                  ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                  : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10'
              }`}
            />
          </div>

          <div>
            <label className={`text-[10px] font-mono uppercase block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>Resumen Técnico del Candidato / Logros Destacados</label>
            <textarea
              rows={2}
              value={resumeSummary}
              onChange={(e) => setResumeSummary(e.target.value)}
              placeholder="Resumen del conjunto de habilidades, hitos de arquitectura o logros de carrera..."
              className={`w-full text-xs rounded-xl px-4.5 py-2.5 outline-none font-sans focus:ring-1 transition-all ${
                isDarkMode 
                  ? 'text-slate-100 bg-slate-950/40 border border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20' 
                  : 'text-slate-800 bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500/10 font-medium'
              }`}
            />
          </div>

          {/* Qual Sliders indicator section */}
          <div className={`border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            <h4 className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Ajustar Indicadores de Calificación (0 - 100)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Puntuación Técnica', value: technical, set: setTechnical, color: 'accent-cyan-400' },
                { label: 'Competencia en Comunicación', value: communication, set: setCommunication, color: 'accent-purple-400' },
                { label: 'Cualidades de Liderazgo', value: leadership, set: setLeadership, color: 'accent-indigo-400' },
                { label: 'Nivel de Ajuste Cultural %', value: cultureFit, set: setCultureFit, color: 'accent-emerald-400' },
                { label: 'Calidad de Experiencia Laboral', value: experience, set: setExperience, color: 'accent-pink-400' },
                { label: 'Resolución Analítica de Problemas', value: problemSolving, set: setProblemSolving, color: 'accent-amber-400' },
              ].map((slider) => (
                <div key={slider.label} className={`border p-3 rounded-xl ${
                  isDarkMode ? 'bg-slate-950/15 border-white/5' : 'bg-slate-50 border-slate-200/50'
                }`}>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-650 text-slate-600'}>{slider.label}</span>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{slider.value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={slider.value}
                    onChange={(e) => slider.set(Number(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                      isDarkMode ? 'bg-slate-950' : 'bg-slate-200'
                    } ${slider.color}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 mb-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Actions footer */}
          <div className={`border-t pt-4 flex items-center justify-end gap-3 ${isDarkMode ? 'border-white/10 bg-white/0' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`text-xs font-medium px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'text-slate-300 hover:text-white bg-slate-950/20 border-white/5 hover:bg-slate-900/40' 
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200/50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cursor-pointer text-xs font-semibold px-5.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5 border border-cyan-400/20"
            >
              <Check className="w-4 h-4" />
              {applicantToEdit ? 'Guardar Cambios de Métricas' : 'Confirmar y Añadir Candidato'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
