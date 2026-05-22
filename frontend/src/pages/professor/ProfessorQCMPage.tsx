import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  LanguageIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QcmResult {
  title: string;
  questions: Question[];
}

const ProfessorQCMPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState('normale');
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState('Français');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<QcmResult | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const steps = [
    "Lecture du document PDF...",
    "Extraction du contenu pédagogique...",
    "Analyse des concepts clés par Gemini AI...",
    "Génération des questions à choix multiples...",
    "Validation du barème et des explications..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateQcm = async () => {
    if (!file) return toast.error("Veuillez sélectionner un fichier PDF");

    setIsGenerating(true);
    setGenerationStep(0);
    setResult(null);

    const interval = setInterval(() => {
      setGenerationStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    const validCount = (typeof count === 'number' && !isNaN(count) && count > 0) ? count : 5;
    formData.append('count', validCount.toString());
    formData.append('language', language);

    try {
      const res = await axios.post(`${API}/qcm/generate-ai`, formData, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      let aiData = res.data;
      if (typeof aiData === 'string') {
        try { aiData = JSON.parse(aiData); } catch (e) {}
      }
      
      console.log('Raw AI Data:', aiData); // For debugging
      
      // Helper to find the largest array in an object
      const findLargestArray = (obj: any): any[] => {
        if (!obj) return [];
        if (Array.isArray(obj)) return obj;
        if (typeof obj === 'object') {
          let maxArr: any[] = [];
          for (const key of Object.keys(obj)) {
            const arr = findLargestArray(obj[key]);
            if (arr.length > maxArr.length) maxArr = arr;
          }
          return maxArr;
        }
        return [];
      };

      let normalizedResult: QcmResult = { title: "QCM Généré par IA", questions: [] };
      
      const foundArray = findLargestArray(aiData);
      
      if (foundArray && foundArray.length > 0) {
        normalizedResult.questions = foundArray;
        // Try to find a title
        normalizedResult.title = aiData.title || aiData.quiz?.title || aiData.qcm?.title || "QCM Généré par IA";
      } else {
         // Fallback if absolutely no array was found
         if (aiData && Array.isArray(aiData.questions)) normalizedResult = aiData;
         else if (aiData && aiData.quiz && Array.isArray(aiData.quiz.questions)) normalizedResult = aiData.quiz;
      }

      setResult(normalizedResult);
      if (normalizedResult.questions.length === 0) {
        toast.error("L'IA n'a retourné aucune question valide. Veuillez réessayer.");
      } else {
        toast.success(`QCM de ${normalizedResult.questions.length} questions généré avec succès !`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération par l'IA");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("JSON copié dans le presse-papier");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-outfit p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-upf-primary/20 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-upf-primary" />
              </div>
              <span className="text-upf-primary font-bold text-xs uppercase tracking-widest">Assistant Pédagogique IA</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Générateur <span className="bg-gradient-to-r from-upf-primaryLight to-violet-400 bg-clip-text text-transparent">QCM Intelligent</span></h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">Transformez vos supports de cours PDF en examens interactifs en quelques secondes grâce à la puissance de Google Gemini 1.5 Flash.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <div className="px-4 py-2 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Gemini Pro Online</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-upf-primary">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Configuration
              </h2>

              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Document Source (PDF)</label>
                  <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-upf-primary hover:bg-upf-primary/10/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <DocumentTextIcon className="w-10 h-10 text-upf-primary mb-3" />
                      ) : (
                        <CloudArrowUpIcon className="w-10 h-10 text-slate-400 group-hover:text-upf-primary transition-all mb-3" />
                      )}
                      <p className="text-[11px] font-bold text-slate-500 group-hover:text-upf-primary text-center px-4">
                        {file ? file.name : "Glissez votre PDF ici ou cliquez pour parcourir"}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Niveau de Difficulté</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['facile', 'normale', 'difficile'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${difficulty === level ? 'bg-upf-primary text-white shadow-lg shadow-upf-primary/30' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Nombre</label>
                    <div className="relative">
                      <ChartBarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="number" 
                        value={Number.isNaN(count) ? '' : count} 
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setCount(isNaN(val) ? 0 : val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-upf-primary outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Langue</label>
                    <div className="relative">
                      <LanguageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select 
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-upf-primary outline-none appearance-none"
                      >
                        <option>Français</option>
                        <option>Anglais</option>
                        <option>Arabe</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={generateQcm}
                  disabled={isGenerating || !file}
                  className="w-full py-4 bg-gradient-to-r from-upf-primary to-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-upf-primary/30 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                  Lancer la Génération
                </button>
              </div>
            </motion.div>

            {/* Info Tip */}
            <div className="bg-upf-primary/10 border border-upf-primary/20 rounded-2xl p-4 flex gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-upf-primary shrink-0" />
              <p className="text-[11px] text-upf-primary/80 leading-relaxed italic">
                L'IA analyse le contenu profond de votre document pour créer des questions qui testent réellement la compréhension, et non seulement la mémoire.
              </p>
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl min-h-[600px] relative overflow-hidden flex flex-col">
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative mb-12">
                      <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-upf-primary animate-spin" />
                      <SparklesIcon className="absolute inset-0 m-auto w-10 h-10 text-upf-primary animate-pulse" />
                    </div>
                    <div className="space-y-4 max-w-sm">
                      <h3 className="text-xl font-black text-slate-900">Analyse Pédagogique...</h3>
                      <div className="space-y-2">
                        {steps.map((step, idx) => (
                          <motion.div 
                            key={step}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ 
                              x: idx === generationStep ? 0 : -10, 
                              opacity: idx === generationStep ? 1 : 0.3,
                              color: idx === generationStep ? '#4f46e5' : '#94a3b8'
                            }}
                            className="flex items-center gap-3 text-xs font-bold"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${idx === generationStep ? 'bg-upf-primary' : 'bg-slate-200'}`} />
                            {step}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{result.title}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{result.questions.length} Questions • Niveau {difficulty}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={copyToClipboard} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                          <ClipboardDocumentCheckIcon className="w-5 h-5 text-upf-primary" />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          EXPORTER PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar max-h-[700px]">
                      {result.questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                          <div className="flex items-start gap-4">
                            <span className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-700">{qIdx + 1}</span>
                            <h4 className="text-sm font-bold leading-relaxed text-slate-800">{q.question}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-4 rounded-2xl border text-xs font-medium transition-all ${oIdx === q.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{opt}</span>
                                  {oIdx === q.correctIndex && <CheckCircleIcon className="w-4 h-4" />}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pl-12">
                            <div className="bg-upf-primary/10/50 rounded-2xl p-4 border-l-2 border-upf-primary">
                              <p className="text-[10px] font-black text-upf-primary uppercase mb-1 tracking-widest">Explication Pédagogique</p>
                              <p className="text-xs text-slate-600 leading-relaxed italic">{q.explanation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-upf-primary/10 flex items-center justify-center mb-6 border border-upf-primary/20">
                      <SparklesIcon className="w-12 h-12 text-upf-primaryLight" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">Prêt à Générer ?</h3>
                    <p className="text-sm max-w-xs text-slate-500">Configurez vos options sur la gauche et téléchargez un PDF pour commencer l'aventure IA.</p>
                  </div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfessorQCMPage;

