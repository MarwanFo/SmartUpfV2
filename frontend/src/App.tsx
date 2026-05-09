import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GlobalConfirmModal from './components/common/GlobalConfirmModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import EtablissementsPage from './pages/super-admin/EtablissementsPage';
import FilieresPage from './pages/super-admin/FilieresPage';
import ModulesPage from './pages/super-admin/ModulesPage';
import UtilisateursPage from './pages/super-admin/UtilisateursPage';
import ClassesPage from './pages/super-admin/ClassesPage';
import StaffPage from './pages/super-admin/StaffPage';
import ParametresPage from './pages/super-admin/ParametresPage';
import NotificationsPage from './pages/super-admin/NotificationsPage';
import TimetablePage from './pages/super-admin/TimetablePage';
import PublicTimetablePage from './pages/super-admin/PublicTimetablePage';
import AbsencesPage from './pages/super-admin/AbsencesPage';
import GradesPage from './pages/super-admin/GradesPage';
import SuperAdminGuard from './components/guards/SuperAdminGuard';
import ProfessorLayout from './pages/professor/ProfessorLayout';
import ProfessorDashboardPage from './pages/professor/ProfessorDashboardPage';
import ProfessorAttendancePage from './pages/professor/ProfessorAttendancePage';
import ProfessorCoursesPage from './pages/professor/ProfessorCoursesPage';
import ProfessorGradesPage from './pages/professor/ProfessorGradesPage';
import ProfessorCalendarPage from './pages/professor/ProfessorCalendarPage';
import ProfessorQCMPage from './pages/professor/ProfessorQCMPage';
import ProfessorNotificationsPage from './pages/professor/ProfessorNotificationsPage';
import ProfessorAIPage from './pages/professor/ProfessorAIPage';
import ProfessorAssignmentDetailPage from './pages/professor/ProfessorAssignmentDetailPage';
import ProfessorGuard from './components/guards/ProfessorGuard';
import NotFoundPage from './pages/NotFoundPage';
import axios from 'axios';
import { useAuthStore } from './store/authStore';
import StudentGuard from './components/guards/StudentGuard';
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentTimetablePage from './pages/student/StudentTimetablePage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentCourseDetailPage from './pages/student/StudentCourseDetailPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentGradesPage from './pages/student/StudentGradesPage';
import StudentAbsencesPage from './pages/student/StudentAbsencesPage';
import StudentAIHubPage from './pages/student/StudentAIHubPage';
import StudentIncidentsPage from './pages/student/StudentIncidentsPage';

// Intercepteur global pour gérer l'expiration de session (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // Nettoyer le store et forcer la déconnexion uniquement si ce n'est pas une tentative de login ratée
      useAuthStore.getState().logout();
      // Rediriger vers la page de login admin si on était sur le panel admin
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/secure-portal-upf-sysadmin';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/secure-portal-upf-sysadmin" element={<AdminLoginPage />} />
        
        {/* Admin Routes — Protected by SuperAdminGuard */}
        <Route path="/admin" element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="etablissements" element={<EtablissementsPage />} />
          <Route path="filieres" element={<FilieresPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="utilisateurs" element={<UtilisateursPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="emplois" element={<PublicTimetablePage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="absences" element={<AbsencesPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="parametres" element={<ParametresPage />} />
        </Route>
        
        {/* Professor Routes — Protected by ProfessorGuard */}
        <Route path="/prof" element={
          <ProfessorGuard>
            <ProfessorLayout />
          </ProfessorGuard>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProfessorDashboardPage />} />
          <Route path="courses" element={<ProfessorCoursesPage />} />
          <Route path="grades" element={<ProfessorGradesPage />} />
          <Route path="attendance" element={<ProfessorAttendancePage />} />
          <Route path="calendar" element={<ProfessorCalendarPage />} />
          <Route path="qcm" element={<ProfessorQCMPage />} />
          <Route path="notifications" element={<ProfessorNotificationsPage />} />
          <Route path="assignments/:assignmentId" element={<ProfessorAssignmentDetailPage />} />
          <Route path="ai" element={<ProfessorAIPage />} />
        </Route>

        {/* Student Routes — Protected by StudentGuard */}
        <Route path="/student" element={
          <StudentGuard>
            <StudentLayout />
          </StudentGuard>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="timetable" element={<StudentTimetablePage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="grades" element={<StudentGradesPage />} />
          <Route path="absences" element={<StudentAbsencesPage />} />
          <Route path="hub" element={<StudentAIHubPage />} />
          <Route path="incidents" element={<StudentIncidentsPage />} />
        </Route>

        {/* Catch-all Route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" />
      <GlobalConfirmModal />
    </BrowserRouter>
  );
}

export default App;
