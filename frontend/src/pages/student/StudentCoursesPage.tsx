import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  UserCircleIcon,
  FolderOpenIcon,
  MegaphoneIcon,
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

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  semester: string;
  professor: { firstName: string; lastName: string; email: string };
  materials: CourseMaterial[];
  announcements: Announcement[];
}

const StudentCoursesPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API}/student/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setCourses(res.data.data || res.data || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchCourses();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black text-slate-900">Mes Cours</h1>
          <p className="text-slate-500 font-medium mt-1">Accédez à vos supports de cours et annonces importantes</p>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={course.id}
              onClick={() => navigate(`/student/courses/${course.id}`)}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {course.code}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {course.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 font-medium">
                <UserCircleIcon className="w-5 h-5" />
                <span>Pr. {course.professor?.lastName} {course.professor?.firstName}</span>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <FolderOpenIcon className="w-4 h-4 text-indigo-500" />
                  {course.materials.length} Supports
                </div>
                {course.announcements.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-lg text-amber-700 border border-amber-100">
                    <MegaphoneIcon className="w-4 h-4" />
                    {course.announcements.length} Annonces
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <BookOpenIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Aucun cours trouvé</h3>
          <p className="text-slate-500 mt-2">Vous n'êtes actuellement affecté à aucun cours.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
