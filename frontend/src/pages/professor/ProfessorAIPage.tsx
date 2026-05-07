import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const ProfessorAIPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D33682] to-purple-700 flex items-center justify-center shadow-xl shadow-purple-500/20 animate-pulse">
        <SparklesIcon className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-outfit mb-2">Assistant UPF-IA</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Cette page est en cours de développement. Elle intègrera Gemini 1.5 Flash pour vous assister dans la préparation de cours, la génération de QCM et l'analyse de la progression de vos étudiants.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
        <SparklesIcon className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-bold text-purple-600">Phase 5 & 6 — En cours de développement</span>
      </div>
    </div>
  );
};

export default ProfessorAIPage;
