import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const API = 'http://localhost:3001/api';

interface Submission {
  id: string;
  status: string;
  grade?: number;
  submittedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxGrade: number;
  submissions: Submission[];
  course: {
    id: string;
    name: string;
    code: string;
  };
}

const StudentAssignmentsPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // We fetch courses and extract all assignments
        const res = await axios.get(`${API}/student/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const courses = res.data.data || res.data || [];
        const allAssignments: Assignment[] = [];
        
        courses.forEach((course: any) => {
          if (course.assignments) {
            course.assignments.forEach((assign: any) => {
              allAssignments.push({
                ...assign,
                course: { id: course.id, name: course.name, code: course.code }
              });
            });
          }
        });
        
        // Sort by due date
        allAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setAssignments(allAssignments);
      } catch (error) {
        toast.error('Erreur lors du chargement des devoirs');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchAssignments();
  }, [accessToken]);

  const getStatus = (assignment: Assignment) => {
    const submission = assignment.submissions?.[0];
    if (submission) {
      if (submission.status === 'GRADED') return { label: 'Noté', variant: 'success' };
      return { label: 'Remis', variant: 'primary' };
    }
    const isLate = new Date(assignment.dueDate).getTime() < new Date().getTime();
    if (isLate) return { label: 'En retard', variant: 'danger' };
    return { label: 'À faire', variant: 'warning' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-upf-primary"></div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const completedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black text-slate-900">Mes Devoirs</h1>
          <p className="text-slate-500 font-medium mt-1">Gérez vos travaux à rendre et consultez vos notes</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-16 text-center flex flex-col items-center justify-center">
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Aucun devoir</h3>
          <p className="text-slate-500 mt-2">Vous n'avez aucun devoir assigné pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending Section */}
          {pendingAssignments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ClockIcon className="w-4 h-4" /> À Faire ({pendingAssignments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAssignments.map(assign => {
                  const status = getStatus(assign);
                  return (
                    <motion.div 
                      key={assign.id}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/student/courses/${assign.course.id}`)}
                      className="cursor-pointer group h-full"
                    >
                      <Card hoverable className="h-full flex flex-col transition-all group-hover:border-upf-primary/30 group-hover:shadow-lg">
                        <CardContent className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="ghost">{assign.course.code}</Badge>
                            <Badge variant={status.variant as any}>{status.label}</Badge>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-upf-primary transition-colors line-clamp-2">
                            {assign.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-6 font-medium line-clamp-2 flex-1">
                            {assign.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm font-bold text-slate-600">
                              Échéance: <span className="text-upf-primary">{new Date(assign.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-upf-primary/10 flex items-center justify-center group-hover:bg-upf-primary group-hover:text-white transition-colors text-upf-primary">
                              <ArrowRightIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedAssignments.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4" /> Historique & Notes ({completedAssignments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAssignments.map(assign => {
                  const status = getStatus(assign);
                  const submission = assign.submissions[0];
                  return (
                    <motion.div 
                      key={assign.id}
                      onClick={() => navigate(`/student/courses/${assign.course.id}`)}
                      className="cursor-pointer group h-full"
                    >
                      <Card className="h-full flex flex-col bg-slate-50 hover:bg-white transition-all group-hover:border-upf-primary/30 group-hover:shadow-lg">
                        <CardContent className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="outline">{assign.course.code}</Badge>
                            <Badge variant={status.variant as any}>{status.label}</Badge>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-2">
                            {assign.title}
                          </h3>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto">
                            {submission.status === 'GRADED' ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-bold uppercase">Note obtenue</span>
                                <span className="text-xl font-black text-semantic-success">{submission.grade} <span className="text-sm text-slate-400">/{assign.maxGrade}</span></span>
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-slate-500">
                                En attente de correction...
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;

