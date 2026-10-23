import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpenIcon,
  MegaphoneIcon,
  ArrowDownTrayIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3001/api';

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Submission {
  id: string;
  status: string;
  grade?: number;
  feedback?: string;
  submittedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxGrade: number;
  submissions: Submission[];
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  semester: string;
  professor: { firstName: string; lastName: string; email: string };
  materials: CourseMaterial[];
  announcements: Announcement[];
  assignments: Assignment[];
}

const StudentCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'announcements' | 'assignments'>('materials');

  // Submission state
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/student/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCourse(res.data.data || res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails du cours');
      navigate('/student/courses');
    } finally {
      setLoading(false);
    }
  }, [accessToken, courseId, navigate]);

  useEffect(() => {
    if (accessToken && courseId) fetchCourse();
  }, [accessToken, courseId, fetchCourse]);

  const handleSubmit = async (assignmentId: string) => {
    if (!submissionFile && !submissionNote.trim()) {
      toast.error('Veuillez fournir un fichier ou un lien (GitHub/Note).');
      return;
    }

    setIsSubmitting(true);
    let fileUrl = '';

    try {
      // 1. Upload file if exists
      if (submissionFile) {
        const formData = new FormData();
        formData.append('file', submissionFile);
        
        const uploadRes = await axios.post(`${API}/upload/file`, formData, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const uploadData = uploadRes.data?.data || uploadRes.data;
        if (uploadData?.success) {
          fileUrl = uploadData.url;
        } else {
          throw new Error('Erreur upload fichier');
        }
      }

      // 2. Submit assignment
      await axios.post(`${API}/student/assignments/${assignmentId}/submit`, {
        fileUrl,
        note: submissionNote
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      toast.success('Travail soumis avec succès !');
      setSubmittingAssignmentId(null);
      setSubmissionFile(null);
      setSubmissionNote('');
      
      // Refresh course data
      fetchCourse();
      
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la soumission du travail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const getFileIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'VIDEO':
        return <PlayCircleIcon className="w-8 h-8 text-rose-500" />;
      case 'PDF':
      default:
        return <DocumentTextIcon className="w-8 h-8 text-upf-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-upf-primary"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button and Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/student/courses')}
          className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <span className="px-3 py-1 bg-upf-primary/20 text-upf-primary text-xs font-black rounded-full mb-2 inline-block">
            {course.code}
          </span>
          <h1 className="text-3xl font-outfit font-black text-slate-900">{course.name}</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5" /> 
            Professeur : {course.professor?.lastName} {course.professor?.firstName}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-8 shrink-0 overflow-x-auto custom-scrollbar gap-8">
          {[
            { id: 'materials', label: `Supports de Cours (${course.materials.length})`, icon: FolderOpenIcon },
            { id: 'assignments', label: `Devoirs (${course.assignments?.length || 0})`, icon: ClipboardDocumentListIcon },
            { id: 'announcements', label: `Annonces (${course.announcements.length})`, icon: MegaphoneIcon }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-5 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  isActive ? 'text-upf-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-upf-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 bg-slate-50/30">
          {activeTab === 'materials' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {course.materials.length > 0 ? (
                course.materials.map((mat) => (
                  <div key={mat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-shadow group gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl shrink-0">
                        {getFileIcon(mat.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-upf-primary transition-colors">{mat.title}</h4>
                        <p className="text-slate-500 text-sm mt-1">{mat.description || 'Aucune description fournie.'}</p>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                          Ajouté le : {new Date(mat.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(mat.url)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-upf-primary/10 hover:bg-upf-primary/20 text-upf-primary font-bold px-6 py-3 rounded-xl transition-colors shrink-0"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <FolderOpenIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-600 mb-1">Aucun support</p>
                  <p className="text-slate-500 font-medium">Le professeur n'a pas encore ajouté de fichiers.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'announcements' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {course.announcements.length > 0 ? (
                course.announcements.map((ann) => (
                  <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-500"></div>
                    <h4 className="font-bold text-slate-800 text-lg mb-2">{ann.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <ClockIcon className="w-4 h-4" />
                      Publié le : {new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <MegaphoneIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-600 mb-1">Aucune annonce</p>
                  <p className="text-slate-500 font-medium">Il n'y a pas d'annonce récente pour ce cours.</p>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'assignments' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {course.assignments && course.assignments.length > 0 ? (
                course.assignments.map((assignment) => {
                  const submission = assignment.submissions?.[0];
                  const isSubmitted = submission && (submission.status === 'SUBMITTED' || submission.status === 'GRADED');
                  const isGraded = submission && submission.status === 'GRADED';
                  const isOverdue = new Date(assignment.dueDate) < new Date() && !isSubmitted;

                  return (
                    <div key={assignment.id} className={`bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}>
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isGraded ? 'bg-emerald-500' : isSubmitted ? 'bg-upf-primary' : isOverdue ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-800 text-xl">{assignment.title}</h4>
                            {isGraded ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Noté
                              </span>
                            ) : isSubmitted ? (
                              <span className="px-2.5 py-1 bg-upf-primary/10 text-upf-primary text-[10px] font-black rounded-lg uppercase tracking-wider border border-upf-primary/20 flex items-center gap-1">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Remis
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-red-100">
                                En Retard
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-slate-200">
                                À Faire
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">{assignment.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                              <ClockIcon className="w-4 h-4" />
                              Échéance : {new Date(assignment.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-upf-primary">
                              <ChartBarIcon className="w-4 h-4" />
                              Barème : /{assignment.maxGrade}
                            </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="w-full sm:w-auto flex flex-col items-end shrink-0 gap-2">
                          {isGraded ? (
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Votre Note</p>
                              <p className="text-3xl font-black text-emerald-600 font-outfit">{submission.grade}<span className="text-base text-emerald-400">/{assignment.maxGrade}</span></p>
                            </div>
                          ) : isSubmitted ? (
                            <div className="text-right">
                              <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 bg-upf-primary/10 text-upf-primaryLight font-bold px-6 py-3 rounded-xl cursor-not-allowed">
                                <CheckCircleIcon className="w-5 h-5" />
                                Travail remis
                              </button>
                              <p className="text-[10px] font-bold text-slate-400 mt-2">
                                {new Date(submission.submittedAt || '').toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : submittingAssignmentId === assignment.id ? (
                            <button 
                              onClick={() => { setSubmittingAssignmentId(null); setSubmissionFile(null); setSubmissionNote(''); }}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl transition-all text-sm"
                            >
                              Annuler
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSubmittingAssignmentId(assignment.id)}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-upf-primary to-upf-primary hover:from-upf-primary hover:to-upf-primary shadow-md shadow-upf-primary/20 text-white font-black px-6 py-3 rounded-xl transition-all"
                            >
                              <CloudArrowUpIcon className="w-5 h-5" />
                              Soumettre mon travail
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submission Form */}
                      {submittingAssignmentId === assignment.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="mt-6 pt-6 border-t border-slate-100 space-y-4"
                        >
                          <h5 className="font-bold text-slate-800 text-sm">Déposer votre travail</h5>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fichier (Optionnel)</label>
                              <input 
                                type="file" 
                                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-upf-primary/10 file:text-upf-primary hover:file:bg-upf-primary/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lien GitHub ou Remarque (Optionnel)</label>
                              <textarea 
                                value={submissionNote}
                                onChange={(e) => setSubmissionNote(e.target.value)}
                                placeholder="https://github.com/votre-projet ou une remarque..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-upf-primary/20 focus:border-upf-primary outline-none transition-all min-h-[100px]"
                              ></textarea>
                            </div>
                            <button 
                              onClick={() => handleSubmit(assignment.id)}
                              disabled={isSubmitting}
                              className="w-full flex items-center justify-center gap-2 bg-upf-primary hover:bg-upf-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-upf-primary/20"
                            >
                              {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <CloudArrowUpIcon className="w-5 h-5" />
                                  Confirmer l'envoi
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Feedback Section if graded */}
                      {isGraded && submission.feedback && (
                        <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Feedback du professeur</p>
                          <p className="text-sm text-emerald-800">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <ClipboardDocumentListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-600 mb-1">Aucun devoir</p>
                  <p className="text-slate-500 font-medium">Vous n'avez aucun devoir assigné pour ce cours.</p>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetailPage;

