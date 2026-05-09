import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const API = 'http://localhost:3001/api';

interface Submission {
  id: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  note?: string;
  student: { firstName: string; lastName: string; email: string };
  submittedAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxGrade: number;
  submissions: Submission[];
}

const ProfessorAssignmentDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Grading states
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/professor/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAssignment(res.data?.data || res.data);
      
      // Auto-select first submission if available and nothing selected
      const submissions = (res.data?.data || res.data).submissions;
      if (submissions && submissions.length > 0 && !selectedSubmissionId) {
        setSelectedSubmissionId(submissions[0].id);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des remises');
      navigate('/professor/courses');
    } finally {
      setLoading(false);
    }
  }, [accessToken, assignmentId, navigate, selectedSubmissionId]);

  useEffect(() => {
    if (accessToken && assignmentId) fetchAssignment();
  }, [accessToken, assignmentId, fetchAssignment]);

  const handleGradeSubmit = async () => {
    if (!selectedSubmissionId || !gradeInput) return;
    setIsSaving(true);
    try {
      await axios.post(`${API}/professor/submissions/${selectedSubmissionId}/grade`, {
        grade: Number(gradeInput),
        feedback: feedbackInput
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success('Note enregistrée !');
      fetchAssignment();
    } catch (error) {
      toast.error('Erreur lors de la notation');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assignment) return null;

  const selectedSubmission = assignment.submissions.find(s => s.id === selectedSubmissionId);

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate('/professor/courses')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-outfit">{assignment.title}</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 ml-14">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {assignment.submissions.length} remises reçues
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <ClockIcon className="w-4 h-4" />
            Échéance : {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <CheckCircleIcon className="w-4 h-4" />
            Barème : /{assignment.maxGrade}
          </div>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left sidebar: Submissions List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Liste des étudiants</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {assignment.submissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubmissionId(sub.id);
                  setGradeInput(sub.grade?.toString() || '');
                  setFeedbackInput(sub.feedback || '');
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                  selectedSubmissionId === sub.id 
                    ? 'bg-[#0A192F] text-white shadow-lg' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <h4 className={`text-sm font-bold ${selectedSubmissionId === sub.id ? 'text-white' : 'text-slate-800'}`}>
                    {sub.student.lastName} {sub.student.firstName}
                  </h4>
                  <p className={`text-xs mt-1 ${selectedSubmissionId === sub.id ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(sub.submittedAt).toLocaleDateString()} - {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                {sub.status === 'GRADED' && (
                  <CheckBadgeIcon className={`w-5 h-5 ${selectedSubmissionId === sub.id ? 'text-cyan-400' : 'text-emerald-500'}`} />
                )}
              </button>
            ))}
            {assignment.submissions.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-sm font-medium">
                Aucune remise pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Right Main Area: Submission Details & Grading */}
        <div className="flex-1 bg-[#F8FAFC] overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {selectedSubmission ? (
              <motion.div
                key={selectedSubmission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Student Info Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <UserCircleIcon className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 font-outfit">
                        {selectedSubmission.student.lastName} {selectedSubmission.student.firstName}
                      </h2>
                      <p className="text-slate-500 font-medium">{selectedSubmission.student.email}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    selectedSubmission.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedSubmission.status === 'GRADED' ? 'Évalué' : 'En attente de notation'}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Work Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                        Travail de l'étudiant
                      </h3>
                      
                      {selectedSubmission.note ? (
                        <div className="mb-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note / Lien GitHub</span>
                          <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 italic border border-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                            "{selectedSubmission.note}"
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note</span>
                          <p className="text-sm text-slate-400 italic">Aucune note fournie.</p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fichier joint</span>
                        {selectedSubmission.fileUrl ? (
                          <a 
                            href={selectedSubmission.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-2xl text-sm font-black transition-colors w-full sm:w-auto"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <DocumentArrowUpIcon className="w-5 h-5 text-indigo-500" />
                            </div>
                            Télécharger le fichier complet
                          </a>
                        ) : (
                          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                            <p className="text-sm text-slate-400 font-bold">Aucun fichier uploadé</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Grading Box */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 relative z-10">
                        Évaluation
                      </h3>

                      <div className="space-y-5 relative z-10">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note sur {assignment.maxGrade}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              placeholder="..."
                              max={assignment.maxGrade}
                              min={0}
                              step={0.5}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                              /{assignment.maxGrade}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Feedback (Optionnel)</label>
                          <textarea 
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] transition-all"
                            placeholder="Points forts, points à améliorer..."
                          />
                        </div>

                        <button 
                          onClick={handleGradeSubmit}
                          disabled={isSaving || !gradeInput}
                          className="w-full py-4 bg-[#0A192F] hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckBadgeIcon className="w-5 h-5" />
                              {selectedSubmission.status === 'GRADED' ? 'Mettre à jour la note' : 'Valider la note'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ClipboardDocumentCheckIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-bold text-slate-600">Sélectionnez une remise</p>
                <p className="text-sm font-medium mt-1">Cliquez sur un étudiant dans la liste de gauche pour voir son travail.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfessorAssignmentDetailPage;
